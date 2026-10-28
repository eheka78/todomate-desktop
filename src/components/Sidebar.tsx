import type { DayStats } from "../hooks/useDayStats";
import type { ThemeMode } from "../hooks/useTheme";
import Calendar from "./Calendar";
import ThemeControls from "./ThemeControls";

type Props = {
  selected: Date;
  onSelect: (d: Date) => void;
  stats: DayStats;
  onRangeChange: (range: { from: number; to: number }) => void;
  mode: ThemeMode;
  accent: string;
  onModeChange: (mode: ThemeMode) => void;
  onAccentChange: (color: string) => void;
  onLogout: () => void;
};

export default function Sidebar({
  selected,
  onSelect,
  stats,
  onRangeChange,
  onLogout,
  ...theme
}: Props) {
  const weekday = selected
    .toLocaleDateString("en-US", { weekday: "long" })
    .toUpperCase();
  const month = selected
    .toLocaleDateString("en-US", { month: "long" })
    .toUpperCase();

  return (
    <aside className="sidebar">
      <button
        className="big-date"
        onClick={() => onSelect(new Date())}
        title="오늘로 이동"
      >
        <span className="big-date-num">{selected.getDate()}</span>
        <span className="big-date-text">
          {weekday}
          <br />
          {month}
        </span>
      </button>
      <Calendar
        selected={selected}
        onSelect={onSelect}
        stats={stats}
        onRangeChange={onRangeChange}
      />
      <div className="sidebar-footer">
        <ThemeControls {...theme} />
        <button className="text-button" onClick={onLogout}>
          로그아웃
        </button>
      </div>
    </aside>
  );
}
