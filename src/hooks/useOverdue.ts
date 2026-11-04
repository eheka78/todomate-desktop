import { useCallback, useEffect, useMemo, useState } from "react";
import { createApi, type Goal, type Todo } from "../api/todomate";
import { todoDateToYmd, toYmd } from "../utils/date";

const DAYS = 14;

type Options = {
  token: string;
  goals: Goal[];
  /** 선택한 날과 그 날의 투두. 기간 안이면 화면의 투두로 바로 반영한다 */
  date: number;
  todos: Todo[];
  loading: boolean;
  /** 바뀌면 목록을 다시 받는다 */
  revision: number;
  toggle: (todo: Todo) => Promise<boolean>;
  edit: (todo: Todo, patch: { date: number }) => Promise<boolean>;
  moveMany: (
    list: Todo[],
    target: number,
  ) => Promise<{ moved: number; failed: Todo[] }>;
};

function daysAgo(n: number): number {
  const d = new Date();
  return toYmd(new Date(d.getFullYear(), d.getMonth(), d.getDate() - n));
}

/** 어제까지 최근 DAYS일 동안 끝내지 않은 투두. 종료·중단된 목표의 투두는 뺀다 */
export function useOverdue({
  token,
  goals,
  date,
  todos,
  loading,
  revision,
  toggle,
  edit,
  moveMany,
}: Options) {
  const api = useMemo(() => createApi(token), [token]);
  const [fetched, setFetched] = useState<Todo[]>([]);
  const from = daysAgo(DAYS);
  const to = daysAgo(1);

  useEffect(() => {
    let stale = false;
    api
      .todosInRange(from, to)
      .then((list) => !stale && setFetched(list))
      // 보조 목록이라 실패하면 비워 둔다. 세션 만료는 useTodos가 처리한다.
      .catch(() => {});
    return () => {
      stale = true;
    };
  }, [api, from, to, revision]);

  const overdue = useMemo(() => {
    const live = !loading && date >= from && date <= to;
    const list = live
      ? [...fetched.filter((t) => todoDateToYmd(t.date) !== date), ...todos]
      : fetched;
    const ended = new Set(
      goals.filter((g) => g.finishType != null).map((g) => g.id),
    );
    return list
      .filter((t) => !t.isDone && !ended.has(t.goalID))
      .sort((a, b) => b.date - a.date || a.createTime - b.createTime);
  }, [fetched, todos, loading, date, from, to, goals]);

  /** 목록에서 먼저 빼고, 실패하면 되돌린다 */
  const settle = useCallback(async (todo: Todo, action: Promise<boolean>) => {
    setFetched((list) => list.filter((t) => t.id !== todo.id));
    if (!(await action)) setFetched((list) => [...list, todo]);
  }, []);

  const done = useCallback(
    (todo: Todo) => settle(todo, toggle(todo)),
    [settle, toggle],
  );

  const moveToToday = useCallback(
    (todo: Todo) => settle(todo, edit(todo, { date: daysAgo(0) })),
    [settle, edit],
  );

  /** 밀린 할 일을 모두 target 날로. 목록에서 먼저 빼고, 실패한 것만 되돌린다 */
  const postponeAll = useCallback(
    async (target: number) => {
      const ids = new Set(overdue.map((t) => t.id));
      setFetched((list) => list.filter((t) => !ids.has(t.id)));
      const result = await moveMany(overdue, target);
      if (result.failed.length > 0)
        setFetched((list) => [...list, ...result.failed]);
      return result;
    },
    [overdue, moveMany],
  );

  return { overdue, done, moveToToday, postponeAll };
}
