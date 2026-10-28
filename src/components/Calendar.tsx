import { type CSSProperties, useEffect, useState } from "react";
import type { DayStat, DayStats } from "../hooks/useDayStats";
import { isSameDay, toYmd } from "../utils/date";

type Props = {
  selected: Date;
  onSelect: (d: Date) => void;
  stats: DayStats;
  onRangeChange: (range: { from: number; to: number }) => void;
};

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

/** 월요일 시작, 6주 고정 그리드 */
function monthCells(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7;
  return Array.from(
    { length: 42 },
    (_, i) => new Date(year, month, 1 - offset + i),
  );
}

/** 남은 일이 있는 날은 남은 비율만큼 진한 점, 다 끝낸 날은 흐린 점 */
function dotProps(stat: DayStat | undefined) {
  if (!stat || stat.total === 0) return {};
  const left = stat.total - stat.done;
  if (left === 0) return { className: "all-done" };
  return {
    className: "has-left",
    style: { "--left": left / stat.total } as CSSProperties,
  };
}

function summary(stat: DayStat | undefined): string {
  if (!stat || stat.total === 0) return "할 일 없음";
  const left = stat.total - stat.done;
  return left === 0
    ? `모두 완료 / ${stat.total}개`
    : `${left}개 남음 / ${stat.total}개`;
}

export default function Calendar({
  selected,
  onSelect,
  stats,
  onRangeChange,
}: Props) {
  const [view, setView] = useState(
    () => new Date(selected.getFullYear(), selected.getMonth(), 1),
  );
  const today = new Date();

  // 바깥에서 다른 달의 날짜가 선택되면 그 달로 따라간다.
  const [lastSelected, setLastSelected] = useState(selected);
  if (lastSelected !== selected) {
    setLastSelected(selected);
    if (
      selected.getMonth() !== view.getMonth() ||
      selected.getFullYear() !== view.getFullYear()
    ) {
      setView(new Date(selected.getFullYear(), selected.getMonth(), 1));
    }
  }

  const cells = monthCells(view.getFullYear(), view.getMonth());
  const from = toYmd(cells[0]);
  const to = toYmd(cells[cells.length - 1]);
  useEffect(() => onRangeChange({ from, to }), [from, to, onRangeChange]);

  let monthDone = 0;
  let monthTotal = 0;
  for (const d of cells) {
    const stat = stats.get(toYmd(d));
    if (stat && d.getMonth() === view.getMonth()) {
      monthDone += stat.done;
      monthTotal += stat.total;
    }
  }

  const move = (delta: number) =>
    setView(new Date(view.getFullYear(), view.getMonth() + delta, 1));

  return (
    <div className="calendar">
      <div className="cal-head">
        <button onClick={() => move(-1)} aria-label="이전 달">
          ‹
        </button>
        <span>
          {view.getFullYear()}.{String(view.getMonth() + 1).padStart(2, "0")}
          {!(
            isSameDay(selected, today) &&
            view.getMonth() === today.getMonth() &&
            view.getFullYear() === today.getFullYear()
          ) && (
            <button className="cal-today" onClick={() => onSelect(new Date())}>
              오늘
            </button>
          )}
        </span>
        <button onClick={() => move(1)} aria-label="다음 달">
          ›
        </button>
      </div>
      <div className="cal-grid">
        {WEEKDAYS.map((w, i) => (
          <div key={i} className="cal-weekday">
            {w}
          </div>
        ))}
        {cells.map((d) => {
          const dot = dotProps(stats.get(toYmd(d)));
          const classes = ["cal-day"];
          if (dot.className) classes.push(dot.className);
          if (d.getMonth() !== view.getMonth()) classes.push("outside");
          if (isSameDay(d, today)) classes.push("today");
          if (isSameDay(d, selected)) classes.push("selected");
          return (
            <button
              key={d.toISOString()}
              className={classes.join(" ")}
              style={dot.style}
              onClick={() => onSelect(d)}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
      <div className="cal-summary">
        <span>
          {selected.getDate()}일 · <b>{summary(stats.get(toYmd(selected)))}</b>
        </span>
        {monthTotal > 0 && (
          <span>
            이번 달 {monthDone}/{monthTotal}
          </span>
        )}
      </div>
    </div>
  );
}
