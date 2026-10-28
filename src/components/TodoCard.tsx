import { useState } from "react";
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

/**
 * 목표 순서대로 묶는다. 진행 중인 목표는 비어 있어도 보여서 바로 추가할 수 있고,
 * 종료된 목표는 투두가 있을 때만, 목록에 없는 목표의 투두는 맨 뒤 '기타'로
 */
function groupByGoal(goals: Goal[], todos: Todo[]) {
  const groups = goals
    .map((g) => ({
      id: g.id,
      title: g.title,
      active: g.finishType == null,
      todos: todos.filter((t) => t.goalID === g.id),
    }))
    .filter((g) => g.active || g.todos.length > 0);
  const known = new Set(goals.map((g) => g.id));
  const rest = todos.filter((t) => !known.has(t.goalID));
  if (rest.length > 0)
    groups.push({ id: "__etc", title: "기타", active: false, todos: rest });
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
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const doneCount = todos.filter((t) => t.isDone).length;
  const groups = groupByGoal(goals, todos);

  return (
    <section className="card">
      <header className="card-title">
        <b>TodoList</b>
        <span className="count">
          {doneCount} / {todos.length}
        </span>
      </header>

      <div className="todo-list">
        {groups.length === 0 ? (
          <p className="empty">{loading ? "불러오는 중…" : "할 일이 없어요"}</p>
        ) : (
          groups.map((group) => (
            <div key={group.id} className="goal-group">
              <div className="goal-title">
                {group.title}
                {group.active && (
                  <button
                    className="goal-add"
                    onClick={() => setAddingTo(group.id)}
                    aria-label={`${group.title}에 할 일 추가`}
                  >
                    +
                  </button>
                )}
              </div>
              {group.todos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  // 종료된 목표는 선택지에서 빼되, 지금 속한 목표는 남긴다
                  goals={goals.filter(
                    (g) => g.finishType == null || g.id === todo.goalID,
                  )}
                  onToggle={() => onToggle(todo)}
                  onEdit={(patch) => onEdit(todo, patch)}
                  onDelete={() => onDelete(todo)}
                />
              ))}
              {addingTo === group.id && (
                <AddTodo
                  onAdd={(content) => onAdd(content, group.id)}
                  onClose={() => setAddingTo(null)}
                />
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
