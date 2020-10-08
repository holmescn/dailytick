import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FormatterService {
  constructor() { }

  private pad(x: number, size: number=2): string {
    var s = String(x);
    while (s.length < size) {s = "0" + s;}
    return s;
  }

  date(ts: number) {
    const t = new Date(ts);
    const Y = t.getFullYear();
    const m = this.pad(t.getMonth()+1);
    const d = this.pad(t.getDate());
    return `${Y}-${m}-${d}`;
  }

  time(ts: number) {
    const t = new Date(ts);
    const H = this.pad(t.getHours());
    const M = this.pad(t.getMinutes());
    return `${H}:${M}`;
  }

  duration(dt: number) {
    dt = dt / 1000;
    const h = Math.floor(dt / 3600);
    const m = Math.floor(dt % 3600 / 60);
    const s = Math.floor(dt % 3600 % 60);
    if (h === 0) {
      return `${m}m ${s}s`;
    }
    return `${h}h ${m}m`;
  }

  toISOString(t: number): string {
    return (new Date(t)).toISOString();
  }
}
