import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ApiError, createApi, type Goal, type Todo } from "../api/todomate";
import { todoDateToYmd } from "../utils/date";
import { TOAST_MS } from "./useToast";

type Options = {
  token: string;
  date: number;
  onError: (message: string) => void;
  /** 세션을 쓸 수 없을 때. reason은 로그인 화면에 보여 줄 문구 */
  onSessionLost: (reason: string) => void;
};

const EXPIRED = "로그인이 만료됐어요. 다시 로그인해 주세요";

function loadFailReason(error: unknown): string {
  if (error instanceof ApiError) {
    return error.status === 401
      ? EXPIRED
      : `투두를 불러오지 못했어요 (${error.message})`;
  }
  return "API 서버에 연결할 수 없어요. 서버가 켜져 있는지 확인해 주세요";
}

type PendingDelete = { todo: Todo; timer: number };

export function useTodos({ token, date, onError, onSessionLost }: Options) {
  const api = useMemo(() => createApi(token), [token]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const pending = useRef(new Map<string, PendingDelete>());
  const currentDate = useRef(date);
  currentDate.current = date;

  const fail = useCallback(
    (error: unknown) => {
      if (error instanceof ApiError && error.status === 401)
        onSessionLost(EXPIRED);
      else
        onError(error instanceof Error ? error.message : "요청에 실패했어요");
    },
    [onError, onSessionLost],
  );

  // 첫 요청이 실패하면 어떤 이유든 로그인 화면으로 돌아간다.
  useEffect(() => {
    api
      .goals()
      .then(setGoals)
      .catch((e) => onSessionLost(loadFailReason(e)));
  }, [api, onSessionLost]);

  useEffect(() => {
    let stale = false;
    setLoading(true);
    api
      .todos(date)
      .then((list) => {
        if (!stale) setTodos(list.filter((t) => !pending.current.has(t.id)));
      })
      .catch((e) => !stale && fail(e))
      .finally(() => !stale && setLoading(false));
    return () => {
      stale = true;
    };
  }, [api, date, fail]);

  // 되돌리기 대기 중인 삭제는 창을 닫거나 로그아웃할 때 즉시 전송한다.
  useEffect(() => {
    const map = pending.current;
    const flush = () => {
      for (const [id, { timer }] of map) {
        window.clearTimeout(timer);
        api.deleteTodo(id, true).catch(() => {});
      }
      map.clear();
    };
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, [api]);

  const add = useCallback(
    async (content: string, goalId: string) => {
      try {
        const created = await api.createTodo({ content, goalId, date });
        setTodos((list) => [...list, created]);
      } catch (e) {
        fail(e);
      }
    },
    [api, date, fail],
  );

  const toggle = useCallback(
    async (todo: Todo) => {
      const done = !todo.isDone;
      setTodos((list) =>
        list.map((t) => (t.id === todo.id ? { ...t, isDone: done } : t)),
      );
      try {
        await api.setDone(todo.id, done);
      } catch (e) {
        setTodos((list) =>
          list.map((t) =>
            t.id === todo.id ? { ...t, isDone: todo.isDone } : t,
          ),
        );
        fail(e);
      }
    },
    [api, fail],
  );

  const edit = useCallback(
    async (
      todo: Todo,
      patch: { content?: string; goalId?: string; date?: number },
    ) => {
      try {
        const updated = await api.updateTodo(todo.id, patch);
        setTodos((list) =>
          todoDateToYmd(updated.date) === date
            ? list.map((t) => (t.id === todo.id ? updated : t))
            : list.filter((t) => t.id !== todo.id),
        );
      } catch (e) {
        fail(e);
      }
    },
    [api, date, fail],
  );

  /** 화면에서 바로 지우고 TOAST_MS 뒤에 실제 삭제. 반환된 함수로 되돌린다. */
  const remove = useCallback(
    (todo: Todo) => {
      setTodos((list) => list.filter((t) => t.id !== todo.id));
      const timer = window.setTimeout(() => {
        pending.current.delete(todo.id);
        api.deleteTodo(todo.id).catch(fail);
      }, TOAST_MS);
      pending.current.set(todo.id, { todo, timer });

      return () => {
        const entry = pending.current.get(todo.id);
        if (!entry) return;
        window.clearTimeout(entry.timer);
        pending.current.delete(todo.id);
        if (todoDateToYmd(todo.date) === currentDate.current) {
          setTodos((list) =>
            [...list, todo].sort((a, b) => a.createTime - b.createTime),
          );
        }
      };
    },
    [api, fail],
  );

  return { goals, todos, loading, add, toggle, edit, remove };
}
