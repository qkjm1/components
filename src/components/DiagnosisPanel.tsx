"use client";

//src/components/DiagnosisPanel.tsx

import React from "react";
/*
위치: 오른쪽 컬럼 전체.


썸네일 스트립(X-ray 결과), Complaint 상세, Severity 바 등 케이스 요약.

+ Add entry로 새 인사이트(메모/진단/태그) 추가.
상호작용
썸네일 클릭 → 중앙 ViewerPanel의 이미지 전환.
Severity를 조절하거나, 특정 Key-Value 필드를 편집하는 모드로 확장 가능.
*/
export default function DiagnosisPanel() {
  return (
    <section className="card grid gap-3">
      <div className="flex items-center justify-between">
        <h3 className="m-0">Left shoulder</h3>
        <button className="px-3 py-1.5 rounded-full bg-white border border-white shadow text-sm text-blue-600 font-semibold">
          + Add entry
        </button>
      </div>

      <div>
        <div className="text-slate-500 font-semibold mb-2">X-ray results</div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=300&q=60",
            "https://images.unsplash.com/photo-1578496479939-9064e6f6b158?w=300&q=60",
            "https://images.unsplash.com/photo-1581594549595-35f6edc7b76f?w=300&q=60",
            "https://images.unsplash.com/photo-1580281780460-92c86b5398d1?w=300&q=60",
          ].map((u,i)=>(
            <div key={i}
                 className="thumb"
                 style={{ backgroundImage:`url(${u})` }} />
          ))}
        </div>
      </div>

      <div className="grid gap-1">
        <div className="text-slate-500 font-semibold">Complaint details</div>
        <Field k="Primary complaint" v="Shoulder pain after a fall" />
        <Field k="Prior injuries" v="Strained right shoulder in Jul 2022" />
        <Field k="Activity" v="Basketball player; high-impact jumps" />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500 font-semibold">Severity</span>
          <b>6 / 10</b>
        </div>
        <div className="relative h-2 rounded-full bg-slate-100 shadow-inner">
          <div className="absolute inset-y-0 left-0 w-3/5 rounded-full bg-gradient-to-r from-rose-200 to-rose-500 border border-white/60" />
        </div>
      </div>
    </section>
  );
}

function Field({k,v}:{k:string; v:string}) {
  return (
    <div className="flex items-center justify-between text-[13px] py-1">
      <span className="text-slate-500">{k}</span>
      <b className="text-slate-900">{v}</b>
    </div>
  );
}
