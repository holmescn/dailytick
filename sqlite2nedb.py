# -*- coding: utf-8 -*-
import re
import sqlite3
import argparse
import requests
import pprint
from datetime import datetime
from difflib import get_close_matches
from collections import defaultdict


class Transformer:
    def __init__(self, username, password):
        self.total = 0
        self.posted = 0
        self.activities = []
        self.activity_alternatives = dict()
        self.activity_tags = dict()
        self.tags = []
        self.headers = {
            'Content-Type': 'application/json'
        }
        data = requests.post('http://localhost:3030/authentication', json={
            'strategy': 'local',
            'email': username,
            'password': password
        }, headers=self.headers).json()
        self.headers['Authorization'] = 'Bearer {}'.format(data['accessToken'])

        self.last_tick_time = 0
        data = requests.get(f'http://localhost:3030/ticks?$limit=400&$sort[tickTime]=-1', headers=self.headers).json()
        for tick in data['data']:
            if tick['activity'] not in self.activities:
                self.activities.append(tick['activity'])

            for tag in tick['tags']:
                if tag not in self.tags:
                    self.tags.append(tag)

            if tick['activity'] not in self.activity_tags:
                self.activity_tags[tick['activity']] = tick['tags']

            if tick['tickTime'] > self.last_tick_time:
                self.last_tick_time = tick['tickTime']

    def post(self, tick):
        r = requests.post('http://localhost:3030/ticks', json=tick, headers=self.headers)
        assert r.ok, f'{r.status_code} {r.reason}'
        self.posted += 1

    def normalize(self, time, activity):
        print(time.strftime("%Y-%m-%d %H:%M"), self.posted,
              self.total, self.total - self.posted)
        print(activity)

        if activity not in self.activity_alternatives:
            self.activity_alternatives[activity] = defaultdict(lambda: 0)

        activities = self.activity_alternatives[activity]
        items = list(activities.items())
        n = len(items)
        if n == 1:
            a, c = items[0]
            if c >= 5:
                return a
        elif n > 1:
            for i, (a, _) in enumerate(items):
                print(f"[{i}] {a}")
            x = input("Choose: ").strip()
            if x.isdigit() and int(x) < n:
                a, _ = items[int(x)]
                activities[a] += 1
                return a

        choices = get_close_matches(activity, self.activities, cutoff=0.5)
        if len(choices) > 0:
            if choices[0] == activity:
                activities[activity] += 1
                return activity

            for i, text in enumerate(choices):
                print(f'[{i}] {text}')

            x = input("请选择: ").strip()
            if x.isdigit() and int(x) < len(choices):
                activity = choices[int(x)]
                activities[activity] += 1
                return activity

        x = input("input new (empty for keep): ").strip()
        if x == '':
            if activity not in self.activities:
                self.activities.append(activity)
            activities[activity] += 1
            return activity

        if x not in self.activities:
            self.activities.append(x)
        activities[x] += 1
        return x

    def to_tags(self, activity):
        if activity in self.activity_tags:
            return self.activity_tags[activity]

        tags = []
        if self.tags:
            for i, tag in enumerate(self.tags):
                print(f"[{i+1}] {tag}")
            while True:
                try:
                    x = int(input("Choose tag (0 to exit): ").strip())
                except ValueError:
                    continue

                if x == 0:
                    break
                tags.append(self.tags[x-1])

        while True:
            x = input("Another tag: ").strip()
            if x == '':
                break
            tags.append(x)
            self.tags.append(x)

        self.activity_tags[activity] = tags
        return tags

    def convert(self, row):
        time = datetime.fromtimestamp(row['time']*1e-3)
        activity = self.normalize(time, row['activity'].strip())
        tags = self.to_tags(activity)
        print(activity, tags)

        self.post({
            'tickTime': int(row['time']),
            'activity': activity,
            'tags': tags
        })
        print('\n')


def execute(args, cursor):
    t = Transformer(args.username, args.password)
    # t0 = datetime(2020, 2, 2, 18, 40).timestamp() * 1000
    t0 = t.last_tick_time
    sql = "SELECT COUNT(*) AS total FROM ticks WHERE [time] > ? ORDER BY [time] ASC"
    row = cursor.execute(sql, (t0,)).fetchone()
    t.total = row['total']

    sql = "SELECT * FROM ticks WHERE [time] > ? ORDER BY [time] ASC"
    for row in cursor.execute(sql, (t0, )):
        t.convert(row)


def main(args):
    def dict_factory(cursor, row):
        d = {}
        for idx, col in enumerate(cursor.description):
            d[col[0]] = row[idx]
        return d

    con = sqlite3.connect(args.data_file)
    con.row_factory = dict_factory
    try:
        cur = con.cursor()
        execute(args, cur)
    finally:
        con.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("data_file", type=str)
    parser.add_argument("--username", type=str)
    parser.add_argument("--password", type=str)
    main(parser.parse_args())
