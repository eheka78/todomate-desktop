import { useCallback, useState } from "react";
import type { Todo } from "./api/todomate";
import LoginScreen from "./components/LoginScreen";
import Sidebar from "./components/Sidebar";
import Toast from "./components/Toast";
import TodoCard from "./components/TodoCard";
import { useDayStats } from "./hooks/useDayStats";
import { useOverdue } from "./hooks/useOverdue";
import { useSession } from "./hooks/useSession";
import { useTheme } from "./hooks/useTheme";
import { useToast } from "./hooks/useToast";
import { useTodos } from "./hooks/useTodos";
import { toYmd } from "./utils/date";

type TodoScreenProps = {
  token: string;
  onLogout: (reason?: string) => void;
  theme: ReturnType<typeof useTheme>;
};

function TodoScreen({ token, onLogout, theme }: TodoScreenProps) {
  const [selected, setSelected] = useState(() => new Date());
  const { toast, show, showError, dismiss } = useToast();

  const [range, setRange] = useState<{ from: number; to: number } | null>(
    null,
  );
  const date = toYmd(selected);

  const { goals, todos, loading, add, toggle, edit, remove } = useTodos({
    token,
    date,
    onError: showError,
    onSessionLost: onLogout,
  });
  const stats = useDayStats({ token, range, date, todos, loading });
  const { overdue, done, moveToToday } = useOverdue({
    token,
    goals,
    date,
    todos,
    loading,
    toggle,
    edit,
  });

  const handleDelete = (todo: Todo) => {
    const undo = remove(todo);
    show("삭제했어요", { label: "되돌리기", run: undo });
  };

  return (
    <div className="layout">
      <Sidebar
        selected={selected}
        onSelect={setSelected}
        stats={stats}
        onRangeChange={setRange}
        overdue={overdue}
        onOverdueDone={done}
        onMoveToToday={moveToToday}
        mode={theme.mode}
        accent={theme.accent}
        onModeChange={theme.setMode}
        onAccentChange={theme.setAccent}
        onLogout={() => onLogout()}
      />
      <TodoCard
        goals={goals}
        todos={todos}
        loading={loading}
        onAdd={add}
        onToggle={toggle}
        onEdit={edit}
        onDelete={handleDelete}
      />
      <Toast toast={toast} onDismiss={dismiss} />
    </div>
  );
}

export default function App() {
  const { session, login, logout } = useSession();
  const theme = useTheme();
  const [notice, setNotice] = useState<string | null>(null);

  const handleLogout = useCallback(
    (reason?: string) => {
      setNotice(reason ?? null);
      logout();
    },
    [logout],
  );

  return session ? (
    <TodoScreen token={session.token} onLogout={handleLogout} theme={theme} />
  ) : (
    <LoginScreen onLogin={login} notice={notice} />
  );
}
