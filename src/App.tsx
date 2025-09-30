// src/App.tsx
"use client";
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Topbar from "./components/Topbar";
import PatientCard from "./components/PatientCard";
import AppointmentsCard from "./components/AppointmentsCard";
import BloodTestCard from "./components/BloodTestCard";
import ViewerPanel from "./components/ViewerPanel";
import DiagnosisPanel from "./components/DiagnosisPanel";
import LoginPage from "./app/login/page"; // ★ /login 페이지 연결

export default function App() {
  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_800px_at_110%_20%,#e8f1ff_0%,transparent_55%),#eaf0f7] text-slate-900">
      <div className="max-w-[1280px] mx-auto px-4 pt-6 pb-8">
        {/* 공통 상단 */}
        <Topbar />

        {/* 라우트에 따라 본문 전환 */}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<LoginPage />} />
          {/* 필요하면 추가 라우트들 */}
          {/* <Route path="/overview" element={<OverviewPage />} /> */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

/* ----- 기존 대시보드 본문을 컴포넌트로 분리 ----- */
function Dashboard() {
  return (
    <div className="grid grid-cols-12 gap-4 mt-6">
      {/* Left */}
      <div className="col-span-12 lg:col-span-4">
        <PatientCard />
        <AppointmentsCard />
        <BloodTestCard />
      </div>

      {/* Center */}
      <div className="col-span-12 lg:col-span-5">
        <ViewerPanel
        />
      </div>

      {/* Right */}
      <div className="col-span-12 lg:col-span-3">
        <DiagnosisPanel />
      </div>
    </div>
  );
}
