import type { Todo } from "../api/todomate";
import { todoDateToYmd, ymdToDate } from "../utils/date";

type Props = {
  todos: Todo[];
  onSelectDate: (d: Date) => void;
  onDone: (todo: Todo) => void;
  onMoveToToday: (todo: Todo) => void;
};

function shortDate(todo: Todo): string {
  const s = String(todoDateToYmd(todo.date));
  return `${s.slice(4, 6)}.${s.slice(6)}`;
}

export default function Overdue({
  todos,
  onSelectDate,
  onDone,
  onMoveToToday,
}: Props) {
  if (todos.length === 0) return null;

  return (
    <section className="overdue">
      <div className="overdue-title">
        밀린 할 일 <span>{todos.length}</span>
      </div>
      <div className="overdue-list">
        {todos.map((todo) => (
          <div key={todo.id} className="overdue-row">
            <button
              className="overdue-date"
              onClick={() => onSelectDate(ymdToDate(todoDateToYmd(todo.date)))}
              title="그 날로 이동"
            >
              {shortDate(todo)}
            </button>
            <span className="overdue-text">{todo.content}</span>
            <button
              className="overdue-move"
              onClick={() => onMoveToToday(todo)}
            >
              오늘로
            </button>
            <button
              className="overdue-check"
              onClick={() => onDone(todo)}
              aria-label="완료하기"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
