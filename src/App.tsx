import { useState } from "react";
import type { Todo } from "./api/todomate";
import LoginScreen from "./components/LoginScreen";
import Sidebar from "./components/Sidebar";
import Toast from "./components/Toast";
import TodoCard from "./components/TodoCard";
import { useSession } from "./hooks/useSession";
import { useTheme } from "./hooks/useTheme";
import { useToast } from "./hooks/useToast";
import { useTodos } from "./hooks/useTodos";
import { toYmd } from "./utils/date";

type TodoScreenProps = {
  token: string;
  onLogout: () => void;
  theme: ReturnType<typeof useTheme>;
};

function TodoScreen({ token, onLogout, theme }: TodoScreenProps) {
  const [selected, setSelected] = useState(() => new Date());
  const { toast, show, dismiss } = useToast();

  const { goals, todos, loading, add, toggle, edit, remove } = useTodos({
    token,
    date: toYmd(selected),
    onError: show,
    onUnauthorized: onLogout,
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
        mode={theme.mode}
        accent={theme.accent}
        onModeChange={theme.setMode}
        onAccentChange={theme.setAccent}
        onLogout={onLogout}
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
  return session ? (
    <TodoScreen token={session.token} onLogout={logout} theme={theme} />
  ) : (
    <LoginScreen onLogin={login} />
  );
}
