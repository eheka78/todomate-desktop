import { useState, type FormEvent } from "react";
import { ApiError } from "../api/todomate";

type Props = {
  onLogin: (email: string, password: string) => Promise<void>;
  /** 투두 화면에서 튕겨 나온 이유 */
  notice?: string | null;
};

function errorMessage(e: unknown): string {
  if (e instanceof ApiError) {
    if (e.status === 401) return "이메일 또는 비밀번호가 맞지 않아요";
    if (e.status === 429)
      return "로그인 시도가 너무 많아요. 잠시 후 다시 해 주세요";
  }
  return "API 서버에 연결할 수 없어요. 서버가 켜져 있는지 확인해 주세요";
}

export default function LoginScreen({ onLogin, notice }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(notice ?? null);
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

  const today = new Date();
  const weekday = today
    .toLocaleDateString("en-US", { weekday: "long" })
    .toUpperCase();
  const month = today
    .toLocaleDateString("en-US", { month: "long" })
    .toUpperCase();

  return (
    <main className="login">
      <form className="login-col" onSubmit={submit}>
        <div className="big-date">
          <span className="big-date-num">{today.getDate()}</span>
          <span className="big-date-text">
            <span>{weekday}</span>
            <span>{month}</span>
          </span>
        </div>
        <p className="login-hello">투두메이트 계정으로 로그인</p>
        <div className="login-box">
          <label className="login-field">
            <span>이메일</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              required
            />
          </label>
          <label className="login-field">
            <span>비밀번호</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button className="login-submit" disabled={busy}>
            <span>{busy ? "로그인 중…" : "로그인"}</span>
            <span aria-hidden>→</span>
          </button>
        </div>
        {error && <p className="login-error">{error}</p>}
        <p className="login-note">
          비밀번호는 저장하지 않아요. 로그인 토큰만 이 기기에 보관해요.
        </p>
      </form>
    </main>
  );
}
