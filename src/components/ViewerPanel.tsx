"use client";

//src/components/ViewerPanel.tsx


import React, { useMemo, useRef, useState } from "react";
/*
핵심 시각 자료(해부/엑스레이/3D/렌더 컷)를 보여주는 뷰어.
줌/드래그 인터랙션, 상단 탭(Intake / Assessment / Diagnosis / Treatment), 우측 툴 버튼(Info/Gallery/Measure).

현재 포커스(예: “Left shoulder”)를 배지로 강조.
주요 상태

zoom (0.8~2.4), offset (드래그로 이동), activeTab (선택된 탭)
데이터 흐름
좌측 카드/우측 패널 이벤트 → 중앙 뷰어 이미지/주석/포커스 영역 갱신.
*/

type Props = {
  title: string;
  focus: string;
  src: string;
};

export default function ViewerPanel({ title, focus, src }: Props) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({x:0, y:0});
  const imgRef = useRef<HTMLImageElement | null>(null);
  const canDrag = zoom > 1;

  const transform = useMemo(
    () => `translateX(calc(-50% + ${offset.x}px)) translateY(${offset.y}px) scale(${zoom})`,
    [zoom, offset]
  );

  function onWheel(e: React.WheelEvent) {
    e.preventDefault();
    setZoom(z => Math.min(2.4, Math.max(0.8, z + (e.deltaY > 0 ? -0.1 : 0.1))));
  }

  function onMouseDown(e: React.MouseEvent) {
    if (!canDrag) return;
    const start = { x: e.clientX, y: e.clientY };
    const origin = { ...offset };
    const onMove = (m: MouseEvent) => {
      setOffset({ x: origin.x + (m.clientX - start.x) / 2, y: origin.y + (m.clientY - start.y) / 2 });
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  return (
    <section className="card h-[640px] relative overflow-hidden bg-gradient-to-b from-indigo-50 to-slate-50 border shadow-[0_1px_1px_rgba(18,44,85,.06),0_30px_60px_rgba(18,44,85,.10)]">
      {/* 상단 탭(인트레이크/Assessment/Diagnosis) */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[60%]">
        <div className="flex bg-white/60 border border-white rounded-full p-1 justify-between">
          {["Intake","Assessment","Diagnosis","Treatment Plan"].map(lbl=>(
            <button key={lbl}
              className={`px-4 py-2 rounded-full text-sm font-semibold ${lbl==="Diagnosis" ? "bg-white shadow" : "text-slate-500 hover:text-slate-900"}`}>
              {lbl}
            </button>
          ))}
        </div>
      </div>

      {/* 강조 배지 */}
      <div className="absolute right-[22%] top-[22%] bg-rose-500 text-white font-bold px-2.5 py-2 rounded-xl shadow-[0_8px_16px_rgba(255,106,106,.35)]">
        {focus}
      </div>

      {/* 메인 이미지 */}
      <img
        ref={imgRef}
        src={src}
        alt="anatomy"
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        className="select-none pointer-events-auto absolute bottom-0 left-1/2 h-full object-contain"
        style={{
          filter: "drop-shadow(0 40px 60px rgba(18,44,85,.15))",
          transform,
          transformOrigin: "50% 90%",
          transition: "transform .2s ease"
        }}
      />

      {/* 툴 버튼 */}
      <div className="absolute right-4 top-1/3 grid gap-2">
        {["Info","Gallery","Measure"].map((k)=>(
          <button key={k} className="iconbtn">{k[0]}</button>
        ))}
      </div>

      {/* 줌 컨트롤 */}
      <div className="absolute left-3 bottom-3 flex gap-2 bg-white/70 border border-white rounded-full p-1 shadow">
        <button className="iconbtn" onClick={()=>setZoom(z=>Math.max(0.8, z-0.1))}>−</button>
        <button className="iconbtn" onClick={()=>setZoom(z=>Math.min(2.4, z+0.1))}>＋</button>
        <button className="iconbtn" onClick={()=>{setZoom(1); setOffset({x:0,y:0});}}>⤾</button>
      </div>
    </section>
  );
}
