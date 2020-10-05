export interface Tick {
  _id: string,
  _date?: string,
  _time?: string,
  _duration?: string,
  _endTime?: number,
  tickTime: number,
  activity: string,
  tags: string[]
};