import type { Goal, Todo } from "../api/todomate";
import AddTodo from "./AddTodo";
import TodoItem from "./TodoItem";

type Props = {
  goals: Goal[];
  todos: Todo[];
  loading: boolean;
  onAdd: (content: string, goalId: string) => Promise<void>;
  onToggle: (todo: Todo) => void;
  onEdit: (
    todo: Todo,
    patch: { content?: string; goalId?: string; date?: number },
  ) => void;
  onDelete: (todo: Todo) => void;
};

/** 목표 순서대로 묶고, 목록에 없는 목표의 투두는 맨 뒤 '기타'로 */
function groupByGoal(goals: Goal[], todos: Todo[]) {
  const groups = goals
    .map((g) => ({
      id: g.id,
      title: g.title,
      todos: todos.filter((t) => t.goalID === g.id),
    }))
    .filter((g) => g.todos.length > 0);
  const known = new Set(goals.map((g) => g.id));
  const rest = todos.filter((t) => !known.has(t.goalID));
  if (rest.length > 0) groups.push({ id: "__etc", title: "기타", todos: rest });
  return groups;
}

export default function TodoCard({
  goals,
  todos,
  loading,
  onAdd,
  onToggle,
  onEdit,
  onDelete,
}: Props) {
  const doneCount = todos.filter((t) => t.isDone).length;
  // 종료된 목표는 묶음 제목으로만 쓰고 선택지에서는 뺀다
  const activeGoals = goals.filter((g) => g.finishType == null);

  return (
    <section className="card">
      <header className="card-title">
        <b>TodoList</b>
        <span className="count">
          {doneCount} / {todos.length}
        </span>
      </header>

      <div className="todo-list">
        {loading && todos.length === 0 ? (
          <p className="empty">불러오는 중…</p>
        ) : todos.length === 0 ? (
          <p className="empty">할 일이 없어요</p>
        ) : (
          groupByGoal(goals, todos).map((group) => (
            <div key={group.id} className="goal-group">
              <div className="goal-title">{group.title}</div>
              {group.todos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  goals={goals.filter(
                    (g) => g.finishType == null || g.id === todo.goalID,
                  )}
                  onToggle={() => onToggle(todo)}
                  onEdit={(patch) => onEdit(todo, patch)}
                  onDelete={() => onDelete(todo)}
                />
              ))}
            </div>
          ))
        )}
      </div>

      <AddTodo goals={activeGoals} onAdd={onAdd} />
    </section>
  );
}
