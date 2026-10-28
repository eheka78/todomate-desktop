import { useCallback, useState } from "react";
import { login as loginRequest, type Session } from "../api/todomate";

const KEY = "todomate.session";

function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as Session;
    return session.expiresAt > Date.now() ? session : null;
  } catch {
    return null;
  }
}

/** 비밀번호는 로그인 요청에만 쓰고, 토큰과 만료 시각만 저장한다. */
export function useSession() {
  const [session, setSession] = useState<Session | null>(loadSession);

  const login = useCallback(async (email: string, password: string) => {
    const { token, expiresAt } = await loginRequest(email, password);
    const next = { token, expiresAt };
    localStorage.setItem(KEY, JSON.stringify(next));
    setSession(next);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(KEY);
    setSession(null);
  }, []);

  return { session, login, logout };
}
