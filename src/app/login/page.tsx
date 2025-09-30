// app/login/page.tsx  (또는 src/app/login/page.tsx)
"use client";

import AuthPanel from "../../components/AuthPanel"; // ← 여기!

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-100">
      <AuthPanel
        onLogin={async (email) => {
          console.log("login with", email); // TODO: /api/login 연동
        }}
        onSignup={async (name, email) => {
          console.log("signup", name, email); // TODO: /api/signup 연동
        }}
        onLogout={async () => {
          console.log("logout"); // TODO: 토큰/세션 파기
        }}
      />
    </main>
  );
}
