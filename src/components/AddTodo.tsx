import { useRef, useState, type FormEvent } from "react";
import type { Goal } from "../api/todomate";

type Props = {
  goals: Goal[];
  onAdd: (content: string, goalId: string) => Promise<void>;
};

const LAST_GOAL_KEY = "todomate.lastGoal";

export default function AddTodo({ goals, onAdd }: Props) {
  const [content, setContent] = useState("");
  const [picked, setPicked] = useState(
    () => localStorage.getItem(LAST_GOAL_KEY) ?? "",
  );
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 저장된 목표가 없거나 사라졌으면 첫 번째 목표
  const goalId = goals.some((g) => g.id === picked)
    ? picked
    : (goals[0]?.id ?? "");

  async function submit(e: FormEvent) {
    e.preventDefault();
    const text = content.trim();
    if (!text || !goalId || busy) return;
    setBusy(true);
    await onAdd(text, goalId);
    setContent("");
    setBusy(false);
    inputRef.current?.focus();
  }

  return (
    <form className="add" onSubmit={submit}>
      <div className="add-head">
        <b>Add</b>
        <button
          type="button"
          className="add-plus"
          onClick={() => inputRef.current?.focus()}
          aria-label="입력칸으로 이동"
        >
          +
        </button>
      </div>
      <div className="add-row">
        <select
          value={goalId}
          onChange={(e) => {
            setPicked(e.target.value);
            localStorage.setItem(LAST_GOAL_KEY, e.target.value);
          }}
          aria-label="목표"
        >
          {goals.map((g) => (
            <option key={g.id} value={g.id}>
              {g.title}
            </option>
          ))}
        </select>
        <input
          ref={inputRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="할 일 입력 후 Enter"
          disabled={goals.length === 0}
          autoFocus
        />
      </div>
    </form>
  );
}
