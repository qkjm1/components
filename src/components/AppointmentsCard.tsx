"use client";
import React from "react";

//src/components/AppointmentsCard.tsx

/* 
위치: 왼쪽 컬럼 중단.

방문 기록 / 예약 리스트. 최근 방문을 강조.
항목 클릭 시 우측/중앙 패널 데이터 교체(해당 방문으로 컨텍스트 스위칭).

데이터 구조(예시)
{ date: "2025-11-09", title: "Left shoulder injury", id: 123, active: true }
UX 팁

스크롤이 길어지면 내부 스크롤 영역으로 처리(max-h-[...px] overflow-y-auto).
*/
const items = [
  { date: "November 9, 2024", title: "Left shoulder injury", active: true },
  { date: "Sep 17, 2024", title: "Routine check", active: false },
  { date: "Mar 20, 2024", title: "Routine check", active: false },
];

export default function AppointmentsCard() {
  return (
    <section className="card mt-3">
      <h3 className="m-0 text-[14px] text-slate-500 font-bold">Appointments</h3>
      <ul className="mt-2">
        {items.map((it) => (
          <li key={it.date}
              className={`px-3 py-2 mt-2 rounded-xl border border-white bg-white flex items-center justify-between shadow text-[13px] ${it.active ? "outline outline-2 outline-blue-500 bg-blue-50" : ""}`}>
            <span className="truncate">
              <b className="text-slate-900">{it.date}</b> • {it.title}
            </span>
            <span>→</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

const card = "backdrop-blur bg-white/70 border border-white/80 rounded-2xl shadow-[0_1px_1px_rgba(18,44,85,.06),0_8px_24px_rgba(18,44,85,.08)] p-3";
