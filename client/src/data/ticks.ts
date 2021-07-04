export interface Tick {
  activity: string;
  tickTime: number;
  tags: string[],
  _time: string;
  _duration: string;
  id: number;
}

const ticks: Tick[] = [
  {
    activity: 'Getting Things Done',
    tickTime: 1623580581028,
    tags: ["阅读", "书籍"],
    _time: '10:32 PM',
    _duration: "10m 10s",
    id: 0
  },
  {
    activity: 'Getting Things Done',
    tickTime: 1623580581028,
    tags: ["阅读", "书籍"],
    _time: '6:32 PM',
    _duration: "10m 10s",
    id: 1
  },
  {
    activity: 'Getting Things Done',
    tickTime: 1623580581028,
    tags: ["阅读", "书籍"],
    _time: '6:32 PM',
    _duration: "10m 10s",
    id: 2
  },
  {
    activity: 'Getting Things Done',
    tickTime: 1623580581028,
    tags: ["阅读", "书籍"],
    _time: '6:32 PM',
    _duration: "10m 10s",
    id: 3
  },
  {
    activity: 'Getting Things Done',
    tickTime: 1623580581028,
    tags: ["阅读", "书籍"],
    _time: '6:32 PM',
    _duration: "10m 10s",
    id: 4
  }
];

export const getTicks = () => ticks;

export const getTick = (id: number) => ticks.find(m => m.id === id);
