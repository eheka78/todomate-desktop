/** 로컬 날짜 → API용 YYYYMMDD 숫자 */
export function toYmd(d: Date): number {
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

/** 투두 레코드의 date(UTC 자정 ms) → YYYYMMDD */
export function todoDateToYmd(ms: number): number {
  const d = new Date(ms);
  return (
    d.getUTCFullYear() * 10000 + (d.getUTCMonth() + 1) * 100 + d.getUTCDate()
  );
}

export function ymdToDate(ymd: number): Date {
  return new Date(
    Math.floor(ymd / 10000),
    Math.floor((ymd % 10000) / 100) - 1,
    ymd % 100,
  );
}

/** YYYYMMDD ↔ <input type="date"> 값(YYYY-MM-DD) */
export function ymdToInput(ymd: number): string {
  const s = String(ymd);
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6)}`;
}

export function inputToYmd(value: string): number {
  return Number(value.replace(/-/g, ""));
}

export function isSameDay(a: Date, b: Date): boolean {
  return toYmd(a) === toYmd(b);
}
