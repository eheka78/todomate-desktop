import { useEffect, useMemo, useState } from "react";
import { createApi, type Todo } from "../api/todomate";

/** 받은 기간(YYYYMMDD)과 그 기간의 투두 */
export type RangeTodos = { from: number; to: number; todos: Todo[] };

type Options = {
  token: string;
  /** 달력에 보이는 기간 (YYYYMMDD) */
  range: { from: number; to: number } | null;
  /** 바뀌면 같은 기간을 다시 받는다 */
  revision: number;
};

/** 달력에 보이는 기간의 투두. 투두를 바꿀 때마다 다시 받아 다른 날로 옮긴 투두도 반영한다. */
export function useRangeTodos({ token, range, revision }: Options) {
  const api = useMemo(() => createApi(token), [token]);
  const [fetched, setFetched] = useState<RangeTodos | null>(null);
  const from = range?.from;
  const to = range?.to;

  useEffect(() => {
    if (from === undefined || to === undefined) return;
    let stale = false;
    api
      .todosInRange(from, to)
      .then((todos) => !stale && setFetched({ from, to, todos }))
      // 보조 데이터라 실패하면 이전 값을 둔다. 세션 만료는 useTodos가 처리한다.
      .catch(() => {});
    return () => {
      stale = true;
    };
  }, [api, from, to, revision]);

  return fetched;
}
