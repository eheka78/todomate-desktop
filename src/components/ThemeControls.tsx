import { ACCENT_PRESETS, type ThemeMode } from "../hooks/useTheme";

type Props = {
  mode: ThemeMode;
  accent: string;
  onModeChange: (mode: ThemeMode) => void;
  onAccentChange: (color: string) => void;
};

export default function ThemeControls({
  mode,
  accent,
  onModeChange,
  onAccentChange,
}: Props) {
  const isPreset = ACCENT_PRESETS.some(
    (p) => p.color.toLowerCase() === accent.toLowerCase(),
  );

  return (
    <div className="theme-controls">
      <button
        className="text-button"
        onClick={() => onModeChange(mode === "dark" ? "light" : "dark")}
      >
        {mode === "dark" ? "라이트" : "다크"} 모드
      </button>
      {mode === "dark" && (
        <div className="swatches">
          {ACCENT_PRESETS.map((p) => (
            <button
              key={p.color}
              className={`swatch${p.color.toLowerCase() === accent.toLowerCase() ? " on" : ""}`}
              style={{ background: p.color }}
              title={p.name}
              aria-label={`포인트 색 ${p.name}`}
              onClick={() => onAccentChange(p.color)}
            />
          ))}
          <label
            className={`swatch custom${isPreset ? "" : " on"}`}
            title="직접 고르기"
            style={isPreset ? undefined : { background: accent }}
          >
            {isPreset && "+"}
            <input
              type="color"
              value={accent}
              onChange={(e) => onAccentChange(e.target.value)}
              aria-label="포인트 색 직접 고르기"
            />
          </label>
        </div>
      )}
    </div>
  );
}
