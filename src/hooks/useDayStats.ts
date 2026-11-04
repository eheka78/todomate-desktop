import { useMemo } from "react";
import type { Todo } from "../api/todomate";
import { todoDateToYmd } from "../utils/date";
import type { RangeTodos } from "./useRangeTodos";

export type DayStat = { done: number; total: number };
export type DayStats = Map<number, DayStat>;

type Options = {
  /** 달력에 보이는 기간의 투두 */
  range: RangeTodos | null;
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

/** 날짜별 투두 수. 기간은 받아 둔 투두로, 선택한 날은 화면의 투두로 바로 계산한다. */
export function useDayStats({ range, date, todos, loading }: Options) {
  const fetched = useMemo(() => countByDay(range?.todos ?? []), [range]);

  return useMemo(() => {
    if (loading) return fetched;
    const stats = new Map(fetched);
    stats.delete(date);
    for (const [ymd, stat] of countByDay(todos)) stats.set(ymd, stat);
    return stats;
  }, [fetched, loading, todos, date]);
}
