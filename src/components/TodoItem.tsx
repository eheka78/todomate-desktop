import { useEffect, useRef, useState } from "react";
import type { Goal, Todo } from "../api/todomate";
import { inputToYmd, todoDateToYmd, ymdToInput } from "../utils/date";

type Props = {
  todo: Todo;
  goals: Goal[];
  onToggle: () => void;
  onEdit: (patch: { content?: string; goalId?: string; date?: number }) => void;
  onDelete: () => void;
};

export default function TodoItem({
  todo,
  goals,
  onToggle,
  onEdit,
  onDelete,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.content);
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (
        e instanceof KeyboardEvent
          ? e.key === "Escape"
          : !ref.current?.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [menuOpen]);

  function startEdit() {
    setDraft(todo.content);
    setEditing(true);
  }

  function commit() {
    setEditing(false);
    const content = draft.trim();
    if (content && content !== todo.content) onEdit({ content });
  }

  return (
    <div
      ref={ref}
      className={`todo${todo.isDone ? " done" : ""}${menuOpen ? " menu-open" : ""}`}
    >
      {editing ? (
        <input
          className="todo-edit"
          value={draft}
          autoFocus
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.nativeEvent.isComposing) return;
            if (e.key === "Enter") commit();
            if (e.key === "Escape") setEditing(false);
          }}
        />
      ) : (
        <span
          className="todo-text"
          onDoubleClick={startEdit}
          title="더블클릭해서 수정"
        >
          {todo.content}
        </span>
      )}
      <div className="todo-actions">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="목표·날짜 변경"
        >
          ⋯
        </button>
        <button onClick={onDelete} aria-label="삭제">
          ✕
        </button>
      </div>
      <button
        className="todo-check"
        onClick={onToggle}
        aria-label={todo.isDone ? "미완료로 바꾸기" : "완료하기"}
      >
        {todo.isDone && "✓"}
      </button>

      {menuOpen && (
        <div className="todo-menu">
          <label>
            목표
            <select
              value={todo.goalID}
              onChange={(e) => {
                onEdit({ goalId: e.target.value });
                setMenuOpen(false);
              }}
            >
              {goals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            날짜
            <input
              type="date"
              value={ymdToInput(todoDateToYmd(todo.date))}
              onChange={(e) => {
                if (!e.target.value) return;
                onEdit({ date: inputToYmd(e.target.value) });
                setMenuOpen(false);
              }}
            />
          </label>
        </div>
      )}
    </div>
  );
}
