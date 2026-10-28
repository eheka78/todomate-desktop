import { useEffect, useMemo, useState } from "react";
import { createApi, type Todo } from "../api/todomate";
import { todoDateToYmd } from "../utils/date";

export type DayStat = { done: number; total: number };
export type DayStats = Map<number, DayStat>;

type Options = {
  token: string;
  /** 달력에 보이는 기간 (YYYYMMDD) */
  range: { from: number; to: number } | null;
  date: number;
  todos: Todo[];
  loading: boolean;
};

function countByDay(todos: Todo[]): DayStats {
  const stats: DayStats = new Map();
  for (const todo of todos) {
    const ymd = todoDateToYmd(todo.date);
    const stat = stats.get(ymd) ?? { done: 0, total: 0 };
    stats.set(ymd, {
      done: stat.done + (todo.isDone ? 1 : 0),
      total: stat.total + 1,
    });
  }
  return stats;
}

/**
 * 날짜별 투두 수. 기간은 선택한 날이 바뀔 때마다 다시 받아 다른 날로 옮긴 투두도 반영하고,
 * 선택한 날은 화면의 투두로 바로 계산한다.
 */
export function useDayStats({ token, range, date, todos, loading }: Options) {
  const api = useMemo(() => createApi(token), [token]);
  const [fetched, setFetched] = useState<DayStats>(() => new Map());
  const from = range?.from;
  const to = range?.to;

  useEffect(() => {
    if (from === undefined || to === undefined) return;
    let stale = false;
    api
      .todosInRange(from, to)
      .then((list) => !stale && setFetched(countByDay(list)))
      // 보조 표시라 실패하면 점 없이 둔다. 세션 만료는 useTodos가 처리한다.
      .catch(() => {});
    return () => {
      stale = true;
    };
  }, [api, from, to, date]);

  return useMemo(() => {
    if (loading) return fetched;
    const stats = new Map(fetched);
    stats.delete(date);
    for (const [ymd, stat] of countByDay(todos)) stats.set(ymd, stat);
    return stats;
  }, [fetched, loading, todos, date]);
}
