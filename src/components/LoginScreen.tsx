import { useState, type FormEvent } from "react";
import { ApiError } from "../api/todomate";

type Props = { onLogin: (email: string, password: string) => Promise<void> };

function errorMessage(e: unknown): string {
  if (e instanceof ApiError) {
    if (e.status === 401) return "이메일 또는 비밀번호가 맞지 않아요";
    if (e.status === 429)
      return "로그인 시도가 너무 많아요. 잠시 후 다시 해 주세요";
  }
  return "로그인에 실패했어요. 네트워크를 확인해 주세요";
}

export default function LoginScreen({ onLogin }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await onLogin(email, password);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <main className="login">
      <form className="card login-card" onSubmit={submit}>
        <div className="card-title">
          <b>Todomate</b>
        </div>
        <label>
          이메일
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
            required
          />
        </label>
        <label>
          비밀번호
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && <p className="login-error">{error}</p>}
        <button className="primary" disabled={busy}>
          {busy ? "로그인 중…" : "Login"}
        </button>
        <p className="login-note">
          비밀번호는 저장하지 않아요. 로그인 토큰만 이 기기에 보관해요.
        </p>
      </form>
    </main>
  );
}
