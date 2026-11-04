import { useEffect, useRef, useState } from "react";
import { inputToYmd, toYmd } from "../utils/date";

type Props = {
  /** 옮길 미완료 할 일 수. 0이면 버튼을 끈다 */
  count: number;
  onPostpone: (date: number) => void;
};

function daysFromToday(n: number): number {
  const d = new Date();
  return toYmd(new Date(d.getFullYear(), d.getMonth(), d.getDate() + n));
}

/** 미완료 할 일을 한 번에 다른 날로 옮기는 버튼과 날짜 메뉴 */
export default function PostponeMenu({ count, onPostpone }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (
        e instanceof KeyboardEvent
          ? e.key === "Escape"
          : !ref.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  function pick(date: number) {
    setOpen(false);
    onPostpone(date);
  }

  return (
    <div className="postpone" ref={ref}>
      <button
        className="postpone-toggle"
        disabled={count === 0}
        onClick={() => setOpen((v) => !v)}
      >
        미루기
      </button>
      {open && (
        <div className="postpone-menu">
          <p>미완료 {count}개를</p>
          <button onClick={() => pick(daysFromToday(0))}>오늘로</button>
          <button onClick={() => pick(daysFromToday(1))}>내일로</button>
          <label>
            날짜 고르기
            <input
              type="date"
              onChange={(e) =>
                e.target.value && pick(inputToYmd(e.target.value))
              }
            />
          </label>
        </div>
      )}
    </div>
  );
}
