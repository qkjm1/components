"use client";
import React from "react";

//src/components/BloodTestCard.tsx

/*
위치: 왼쪽 컬럼 하단.

최근 혈액검사 요약 값(CRP, WBC, ESR, HGB 등) 나열.
우측 패널의 상세 리포트로 드릴다운 링크를 제공해도 좋음.

데이터 연동
최신 결과만 가져오거나, “더 보기”를 누르면 이력 모달/페이지로 이동.
*/
export default function BloodTestCard() {
  const Row = ({k,v}:{k:string; v:string}) => (
    <div className="flex items-center justify-between text-[13px] py-1">
      <span className="text-slate-500">{k}</span><b className="text-slate-900">{v}</b>
    </div>
  );
  return (
    <section className="card mt-3">
      <h3 className="m-0 text-[14px] text-slate-500 font-bold">Latest blood test</h3>
      <Row k="CRP" v="1.8 mg/L" />
      <Row k="WBC" v="8,500/µL" />
      <Row k="ESR" v="12 mm/h" />
      <Row k="HGB" v="15.1 g/dL" />
    </section>
  );
}
