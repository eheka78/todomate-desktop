import { useState } from "react";
import { isSameDay } from "../utils/date";

type Props = { selected: Date; onSelect: (d: Date) => void };

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

export default function Calendar({ selected, onSelect }: Props) {
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
        {monthCells(view.getFullYear(), view.getMonth()).map((d) => {
          const classes = ["cal-day"];
          if (d.getMonth() !== view.getMonth()) classes.push("outside");
          if (isSameDay(d, today)) classes.push("today");
          if (isSameDay(d, selected)) classes.push("selected");
          return (
            <button
              key={d.toISOString()}
              className={classes.join(" ")}
              onClick={() => onSelect(d)}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
