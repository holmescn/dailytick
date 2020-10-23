export interface Tick {
  _id: string,
  _date?: string,
  _time?: string,
  _duration?: string,
  tickTime: number,
  activity: string,
  tags: string[]
};