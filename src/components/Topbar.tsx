"use client";

// src/components/Topbar.tsx
import React from "react";
import { NavLink, useLocation } from "react-router-dom";

export default function Topbar() {
  const { pathname } = useLocation();

  const NAV = [
    { label: "Home", href: "/login" }, // HOME → 로그인으로 연결
    { label: "Overview", href: "/overview" },
    { label: "Imaging", href: "/imaging" },
    { label: "Labs", href: "/labs" },
    { label: "Heart", href: "/heart" },
    { label: "Brain", href: "/brain" },
    { label: "Lungs", href: "/lungs" },
    { label: "Digestive", href: "/digestive" },
    { label: "Cancer", href: "/cancer" },
    { label: "Hormones", href: "/hormones" },
  ];

  return (
    <div className="backdrop-blur bg-white/70 border border-white/80 rounded-2xl shadow-[0_1px_1px_rgba(18,44,85,.06),0_8px_24px_rgba(18,44,85,.08)] px-3 py-2 flex items-center gap-3">
      <div className="flex items-center gap-2 px-2 py-1.5 rounded-xl bg-white border border-white shadow">
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
          <circle cx="12" cy="12" r="10" fill="#2f6df6" />
          <path d="M7 12h10M12 7v10" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span className="font-bold">MedEx</span>
      </div>

      <nav className="flex-1 rounded-full bg-white/60 border border-white px-1 py-1 flex gap-1">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href);
          return (
            <NavLink
              key={item.label}
              to={item.href}
              className={`px-3.5 py-2 rounded-full text-sm font-semibold transition ${
                active ? "bg-white text-slate-900 shadow" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-white shadow text-sm">
        <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500" />
        Synced
      </div>
      <div className="w-9 h-9 rounded-full bg-gradient-to-b from-indigo-100 to-white border border-white shadow" />
    </div>
  );
}
