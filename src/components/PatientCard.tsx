"use client";

//src/components/PatientCard.tsx

import React from "react";

type Props = {
  name: string;
  sex: string;
  blood: string;
  photo: string;
  age: string;
  height: string;
  weight: string;
  bmi: string;
};

export default function PatientCard(p: Props) {
  const Chip = ({label, value}:{label:string; value:string}) => (
    <div className="bg-white border border-white rounded-xl px-3 py-2 shadow text-[13px] text-slate-500 flex items-center justify-between">
      <span>{label}</span><b className="text-slate-900">{value}</b>
    </div>
  );

  return (
    <section className="card">
      <div className="flex items-center gap-3">
        <img src={p.photo} alt="" className="w-11 h-11 rounded-xl border border-white shadow object-cover"/>
        <div>
          <div className="font-bold">{p.name}</div>
          <div className="text-slate-500 text-xs">{p.sex} • Blood {p.blood}</div>
        </div>
        <button className="ml-auto text-slate-400">⋯</button>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-3">
        <Chip label="Age" value={p.age}/>
        <Chip label="Weight" value={p.weight}/>
        <Chip label="Height" value={p.height}/>
        <Chip label="BMI" value={p.bmi}/>
      </div>
    </section>
  );
}

/* Tailwind helper (공통 카드) */
const cardBase = "backdrop-blur bg-white/70 border border-white/80 rounded-2xl shadow-[0_1px_1px_rgba(18,44,85,.06),0_8px_24px_rgba(18,44,85,.08)] p-3";
export const Card = ({children,className=""}:{children:React.ReactNode; className?:string}) =>
  <section className={`${cardBase} ${className}`}>{children}</section>;
