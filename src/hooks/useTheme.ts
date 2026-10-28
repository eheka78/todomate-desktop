import { useEffect, useState } from "react";

export type ThemeMode = "light" | "dark";

export const ACCENT_PRESETS = [
  { name: "노랑", color: "#F6DD9A" },
  { name: "라임", color: "#C6F432" },
  { name: "오렌지레드", color: "#FF5A36" },
  { name: "라벤더 블루", color: "#7C8CFF" },
];

const MODE_KEY = "todomate.theme";
const ACCENT_KEY = "todomate.accent";

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function initialMode(): ThemeMode {
  const saved = read(MODE_KEY);
  if (saved === "light" || saved === "dark") return saved;
  return "dark";
}

/** 밝은 포인트 색 위에는 검정, 어두운 색 위에는 흰 글씨 */
function inkFor(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return 0.299 * r + 0.587 * g + 0.114 * b > 150 ? "#111111" : "#ffffff";
}

export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>(initialMode);
  const [accent, setAccent] = useState(
    () => read(ACCENT_KEY) ?? ACCENT_PRESETS[0].color,
  );

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = mode;
    // 라이트 테마는 무채색이라 포인트 색 대신 검정을 쓴다.
    const color = mode === "dark" ? accent : "#111111";
    root.style.setProperty("--acc", color);
    root.style.setProperty("--acc-ink", inkFor(color));
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", mode === "dark" ? "#0b0b0b" : "#ffffff");
    try {
      localStorage.setItem(MODE_KEY, mode);
      localStorage.setItem(ACCENT_KEY, accent);
    } catch {
      // 저장 실패해도 현재 화면은 그대로 동작
    }
  }, [mode, accent]);

  return { mode, setMode, accent, setAccent };
}
