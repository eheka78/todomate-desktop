const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export type Session = { token: string; expiresAt: number };

export type Goal = { id: string; title: string; priority?: number };

export type Todo = {
  id: string;
  content: string;
  /** UTC 자정 epoch ms */
  date: number;
  goalID: string;
  isDone: boolean;
  createTime: number;
};

export class ApiError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  init: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, ...rest } = init;
  const headers: Record<string, string> = {};
  if (rest.body !== undefined) headers["content-type"] = "application/json";
  if (token) headers.authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...rest, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(
      res.status,
      body?.error?.message ?? `HTTP ${res.status}`,
    );
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

export function login(email: string, password: string): Promise<Session> {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function createApi(token: string) {
  return {
    goals: () => request<Goal[]>("/goals", { token }),
    todos: (date: number) => request<Todo[]>(`/todos?date=${date}`, { token }),
    createTodo: (input: { content: string; goalId: string; date: number }) =>
      request<Todo>("/todos", {
        method: "POST",
        token,
        body: JSON.stringify(input),
      }),
    updateTodo: (
      id: string,
      input: { content?: string; goalId?: string; date?: number },
    ) =>
      request<Todo>(`/todos/${id}`, {
        method: "PATCH",
        token,
        body: JSON.stringify(input),
      }),
    setDone: (id: string, done: boolean) =>
      request<Todo>(`/todos/${id}/complete`, {
        method: "PATCH",
        token,
        body: JSON.stringify({ done }),
      }),
    deleteTodo: (id: string, keepalive = false) =>
      request<void>(`/todos/${id}`, { method: "DELETE", token, keepalive }),
  };
}

export type Api = ReturnType<typeof createApi>;
