import fs from 'fs';
import path from 'path';
import { Id, Params, ServiceMethods } from '@feathersjs/feathers';
import { Application } from '../../declarations';

interface Data {}

interface ServiceOptions {}

interface Tick {
  activity: string,
  tickTime: number,
  tags: string[],
  endTime: number
}

interface Record {
  activity: string,
  start: number,
  end: number,
  duration: number,
  tags: string[]
}

export class ExportData implements Partial<ServiceMethods<Data>> {
  app: Application;
  options: ServiceOptions;

  constructor (options: ServiceOptions = {}, app: Application) {
    this.options = options;
    this.app = app;
  }

  async get (id: Id, params?: Params): Promise<Data> {
    if (id === 'daily-details-csv') {
      return this.exportDailyDetailsCSV(params);
    } else if (id === 'daily-details-json') {
      return this.exportDailyDetailsJSON(params);
    } else {
      return {
        code: -1,
        message:  `unknown export type: ${id}`
      };
    }
  }

  async exportDailyDetailsCSV(params?: Params): Promise<Data> {
    const ticks: Tick[] = await this.findAllTicks(params);

    // ,,tag::date{}
    // 活动,开始时间,用时,标签
    // ,,end::date[]
    const lines: string[] = [];
    const header = '活动,开始时间,用时,标签';
    let _dateTag = '', totalDuration = 0;
    ticks.forEach((tick: Tick) => {
      const t0 = new Date(tick.tickTime + 8 * 8.64e7);
      const t1 = new Date(tick.endTime + 8 * 8.64e7);
      const duration = Math.floor((tick.endTime - tick.tickTime) / 1000);
      const dateTag = this.dateTag(t1);

      if (lines.length > 0) {
        if (dateTag !== _dateTag) {
          lines.push(`共计,,${this.formatDuration(totalDuration)},`);
          lines.push(`,,, ${_dateTag.replace('tag', 'end')}`);
          lines.push('');
          lines.push(`,,, ${dateTag}`);
          lines.push(header);
          totalDuration = 0;
        }
      } else {
        lines.push(`,,, ${dateTag}`);
        lines.push(header);
      }

      const tagsPart = tick.tags.join(' #');
      const line = `${tick.activity.replace(',', '，')},${this.datetime(t0)},${this.formatDuration(duration)},#${tagsPart}`;
      lines.push(line);
      totalDuration += duration;
      _dateTag = dateTag;
    });
    lines.push(`共计,,${this.formatDuration(totalDuration)},`);
    lines.push(`,,, ${_dateTag.replace('tag', 'end')}`);

    const fn = `daily-details-${params?.user._id}.csv`;
    const folder = path.resolve(`${__dirname}/../../../public`);
    const fullPath = `${folder}/${fn}`;
    fs.writeFileSync(fullPath, lines.join('\n'));

    // remove after 1 minute
    this.removeFile(fullPath);

    return {
      code: 0,
      filename: `${fn}`
    };
  }

  async exportDailyDetailsJSON(params?: Params): Promise<Data> {
    const ticks: Tick[] = await this.findAllTicks(params);

    // {
    //   "D20200101": [{
    //     "activity": "",
    //     "start": "",
    //     "stop": "",
    //     "duration": "",
    //     "tags": [],
    //   }]
    // }
    const data: any = {};
    ticks.forEach((tick: Tick) => {
      const h = 86400;
      // const t0 = new Date(tick.tickTime + 8 * h);
      const t1 = new Date(tick.endTime  + 8 * h);
      const duration = Math.floor((tick.endTime - tick.tickTime) / 1000);
      const key = this.dateTag(t1).replace('tag::', 'D').replace('[]', '');

      const record: Record = {
        activity: tick.activity,
        start: tick.tickTime,
        end: tick.endTime,
        duration,
        tags: tick.tags
      }

      if (data[key]) {
        data[key].push(record);
      } else {
        data[key] = [record];
      }
    });

    const fn = `daily-details-${params?.user._id}.json`;
    const folder = path.resolve(`${__dirname}/../../../public`);
    const fullPath = `${folder}/${fn}`;
    fs.writeFileSync(fullPath, JSON.stringify(data, null, 2));

    // remove after 1 minute
    this.removeFile(fullPath);

    return {
      code: 0,
      filename: `${fn}`
    };
  }

  dateTag(t: Date): string {
    const Y = t.getFullYear();
    const M = t.getMonth() + 1;
    const D = t.getDate();
    const MM = M < 10 ? `0${M}` : `${M}`;
    const DD = D < 10 ? `0${D}` : `${D}`;
    return `tag::${Y}${MM}${DD}[]`;
  }

  datetime(t: Date): string {
    const Y = t.getFullYear();
    const M = t.getMonth() + 1;
    const D = t.getDate();
    const h = t.getHours();
    const m = t.getMinutes() + (t.getSeconds() < 35 ? 0 : 1);

    const MM = M < 10 ? `0${M}` : `${M}`;
    const DD = D < 10 ? `0${D}` : `${D}`;
    const hh = h < 10 ? `0${h}` : `${h}`;
    const mm = m < 10 ? `0${m}` : `${m}`;
    return `${Y}-${MM}-${DD} ${hh}:${mm}`;
  }

  formatDuration(dt: number): string {
    const h = Math.floor(dt / 3600);
    const m = Math.floor(dt % 3600 / 60);
    const s = Math.floor(dt % 3600 % 60);
    if (h > 0) {
      if (m < 5) {
        return `${h} 小时`;
      } else if (s < 35) {
        return `${h} 小时 ${m} 分钟`;
      } else {
        return `${h} 小时 ${m+1} 分钟`;
      }
    } else {
      return s < 35 ? `${m} 分钟` : `${m+1} 分钟`;
    }
  }

  async findAllTicks(params?: Params): Promise<Tick[]> {
    const ticks = await this.app.service('ticks').find({
      ...params,
      provider: undefined,
      paginate: false,
      query: {
        tickTime: { $gt: 0 },
        $sort: { tickTime: 1 },
        $select: ['activity', 'tags', 'tickTime']
      }
    });

    return ticks.map((item: any, index: number, items: any[]) => Object.assign(item, {
      endTime: (index+1<items.length ? items[index+1].tickTime : Date.now()),
    }));
  }

  removeFile(full_path: string, delay=60): void {
    setTimeout(() => {
      if (fs.existsSync(full_path)) {
        fs.unlinkSync(full_path);
      }
    }, delay * 1000);
  }
}