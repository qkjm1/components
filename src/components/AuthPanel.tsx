import React, { useMemo, useState } from "react";

//src/components/AuthPanel.tsx

type Mode = "signup" | "login";

type Props = {
  onLogin?: (email: string) => Promise<void> | void;     // 실서비스 연동 시 사용
  onSignup?: (name: string, email: string) => Promise<void> | void;
  onLogout?: () => Promise<void> | void;
};

export default function AuthPanel({ onLogin, onSignup, onLogout }: Props) {
  // --- 데모용 "로그인된 상태" 관리 (실서비스에선 토큰/세션으로 대체)
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [mode, setMode] = useState<Mode>("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [agree, setAgree] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const title = useMemo(() => (mode === "signup" ? "Sign up" : "Log in"), [mode]);

  const validate = () => {
    if (!/^\S+@\S+\.\S+$/.test(email)) return "이메일 형식이 올바르지 않아요.";
    if (mode === "signup" && name.trim().length < 2) return "이름을 2자 이상 입력하세요.";
    if (pw.length < 6) return "비밀번호는 6자 이상 권장합니다.";
    if (mode === "signup" && !agree) return "약관에 동의해야 가입할 수 있어요.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const v = validate();
    if (v) return setErr(v);
    setErr(null);
    setBusy(true);
    try {
      if (mode === "login") {
        await onLogin?.(email);
        // 데모: 로그인 성공 처리
        setUserEmail(email);
      } else {
        await onSignup?.(name, email);
        // 데모: 가입 직후 로그인된 상태라고 가정
        setUserEmail(email);
      }
    } catch (e: any) {
      setErr(e?.message ?? "요청 처리 중 문제가 발생했어요.");
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = async () => {
    setBusy(true);
    try {
      await onLogout?.();
      setUserEmail(null);
      setName("");
      setEmail("");
      setPw("");
      setAgree(false);
    } finally {
      setBusy(false);
    }
  };

  // 로그인된 상태 UI
  if (userEmail) {
    return (
      <div className="min-h-[80vh] w-full flex items-center justify-center p-6">
        <div className="relative w-full max-w-3xl rounded-[28px] shadow-xl overflow-hidden bg-gradient-to-br from-pink-200 via-purple-200 to-cyan-200">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -left-24 -top-24 w-72 h-72 bg-white/30 blur-3xl rounded-full" />
            <div className="absolute -right-20 bottom-0 w-72 h-72 bg-white/20 blur-2xl rounded-full" />
          </div>

          <div className="grid md:grid-cols-2 gap-6 relative">
            <LeftHero />
            <div className="p-8 md:p-10">
              <div className="mb-8 flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-slate-800">Welcome ✨</h2>
              </div>

              <div className="rounded-2xl bg-white/70 backdrop-blur p-6 shadow-sm">
                <p className="text-slate-700">
                  <span className="font-semibold">{userEmail}</span> 로 로그인되어 있어요.
                </p>
                <p className="text-slate-500 mt-1">서비스를 계속 이용하실 수 있어요.</p>

                <div className="mt-6 flex items-center gap-3">
                  <button
                    onClick={handleLogout}
                    disabled={busy}
                    className="px-5 py-3 rounded-full bg-slate-900 text-white font-medium hover:opacity-90 disabled:opacity-50 transition"
                  >
                    {busy ? "처리 중..." : "Log out"}
                  </button>
                  <a
                    href="#"
                    className="text-slate-700 underline underline-offset-4 hover:opacity-80"
                    onClick={(e) => e.preventDefault()}
                  >
                    계정 설정
                  </a>
                </div>
              </div>

              <div className="mt-10 border-t border-white/50 pt-6 text-sm text-slate-600">
                데모 상태입니다. 실제 로그아웃/토큰 파기는 <code>onLogout</code>으로 연결하세요.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 비로그인(가입/로그인) UI
  return (
    <div className="min-h-[80vh] w-full flex items-center justify-center p-6">
      <div className="relative w-full max-w-5xl rounded-[28px] shadow-xl overflow-hidden bg-gradient-to-br from-pink-200 via-purple-200 to-cyan-200">
        {/* soft glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -left-24 -top-24 w-72 h-72 bg-white/30 blur-3xl rounded-full" />
          <div className="absolute -right-20 bottom-0 w-72 h-72 bg-white/20 blur-2xl rounded-full" />
        </div>

        <div className="grid md:grid-cols-2 gap-6 relative">
          <LeftHero />

          {/* Right panel */}
          <div className="p-8 md:p-10">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-slate-800">{title}</h2>
              <p className="text-sm text-slate-700">
                {mode === "signup" ? "이미 계정이 있나요? " : "처음이신가요? "}
                <button
                  className="font-semibold underline underline-offset-4 hover:opacity-80"
                  onClick={() => {
                    setErr(null);
                    setMode(mode === "signup" ? "login" : "signup");
                  }}
                >
                  {mode === "signup" ? "Log in" : "Sign up"}
                </button>
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="rounded-2xl bg-white/70 backdrop-blur p-6 shadow-sm"
            >
              {mode === "signup" && (
                <Field
                  label="Name"
                  placeholder="Your name"
                  value={name}
                  onChange={setName}
                  rightClear
                />
              )}

              <Field
                label="Email address"
                placeholder="example@gmail.com"
                type="email"
                value={email}
                onChange={setEmail}
                rightClear
              />

              <Field
                label="Password"
                placeholder="Enter password"
                type={showPw ? "text" : "password"}
                value={pw}
                onChange={setPw}
                rightIcon={
                  <button
                    type="button"
                    aria-label={showPw ? "비밀번호 숨기기" : "비밀번호 보기"}
                    onClick={() => setShowPw((v) => !v)}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    {showPw ? "🙈" : "👁️"}
                  </button>
                }
              />

              {mode === "signup" && (
                <label className="mt-3 flex items-start gap-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300"
                  />
                  <span>
                    I agree to the <a className="text-pink-600 underline">Terms of Service</a> and{" "}
                    <a className="text-pink-600 underline">Privacy Policy</a>.
                  </span>
                </label>
              )}

              {err && (
                <p className="mt-4 text-sm text-pink-700 bg-pink-50 border border-pink-200 rounded-lg px-3 py-2">
                  {err}
                </p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="mt-6 w-full md:w-auto px-6 py-3 rounded-full bg-slate-900 text-white font-medium hover:opacity-90 disabled:opacity-50 transition"
              >
                {busy ? "처리 중..." : mode === "signup" ? "Create account" : "Log in"}
              </button>

              <div className="mt-6 flex items-center gap-3 text-slate-500">
                <div className="h-px flex-1 bg-slate-300/60" />
                <span className="text-sm">or sign up with</span>
                <div className="h-px flex-1 bg-slate-300/60" />
              </div>

              <div className="mt-4 flex items-center gap-3">
                <SocialButton label="Google" onClick={() => alert("연동 위치")} />
                <SocialButton label="Facebook" onClick={() => alert("연동 위치")} />
              </div>
            </form>

            <p className="mt-6 text-xs text-slate-600">
              * 데모 화면입니다. 실제 인증은 <code>onLogin / onSignup / onLogout</code>에
              백엔드 호출을 연결하세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- 재사용 필드 ---------- */
function Field({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  rightIcon,
  rightClear,
}: {
  label: string;
  placeholder?: string;
  type?: "text" | "email" | "password";
  value: string;
  onChange: (v: string) => void;
  rightIcon?: React.ReactNode;
  rightClear?: boolean;
}) {
  return (
    <div className="mb-4">
      <label className="block text-sm text-slate-700 mb-2">{label}</label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-full border border-slate-200 bg-white px-5 py-3 pr-12 shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-300"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {rightClear && value && (
            <button
              type="button"
              aria-label="입력 지우기"
              onClick={() => onChange("")}
              className="text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
          {rightIcon}
        </div>
      </div>
    </div>
  );
}

/* ---------- 좌측 히어로 (문구 + 로켓) ---------- */
function LeftHero() {
  return (
    <div className="p-8 md:p-10 flex flex-col justify-between">
      <div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-800 leading-tight">
          Be <br /> limitless
        </h1>
        <p className="mt-4 text-slate-700">
          빠르고 간단한 가입으로 지금 바로 시작하세요.
        </p>
      </div>

      <div className="mt-8 md:mt-0 flex justify-center md:justify-start">
        <Rocket3D />
      </div>
    </div>
  );
}

/* ---------- 소셜 버튼 (간단 스타일) ---------- */
function SocialButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 hover:bg-slate-50 transition"
      aria-label={`${label}로 계속하기`}
    >
      <span className="text-xl">🔵</span>
      <span className="text-sm font-medium text-slate-700">{label}</span>
    </button>
  );
}

/* ---------- 간단한 로켓 SVG (일러스트 느낌) ---------- */
function Rocket3D() {
  return (
    <svg width="220" height="220" viewBox="0 0 220 220" aria-hidden="true">
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#c7d2fe" />
        </linearGradient>
      </defs>
      <g transform="translate(20,10)">
        <ellipse cx="60" cy="180" rx="22" ry="10" fill="#e5e7eb" />
        <path d="M60 10 C100 30 110 90 100 130 L20 130 C10 90 20 30 60 10Z" fill="url(#g1)" stroke="#e2e8f0" />
        <circle cx="80" cy="80" r="16" fill="#0f172a" stroke="#fbbf24" strokeWidth="6" />
        <circle cx="62" cy="105" r="10" fill="#0f172a" stroke="#fbbf24" strokeWidth="6" />
        <path d="M20 120 C5 130 5 150 22 150 L40 135 Z" fill="#93c5fd" />
        <path d="M100 120 C115 130 115 150 98 150 L80 135 Z" fill="#93c5fd" />
        <path d="M60 130 L55 160 L65 160 Z" fill="#fb923c" />
      </g>
    </svg>
  );
}
