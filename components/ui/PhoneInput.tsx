"use client";

import { ChevronDown } from "lucide-react";
import { COUNTRIES } from "@/lib/phone";

export function PhoneInput({ code, number, onCode, onNumber, placeholder, className = "" }: {
  code: string; number: string; onCode: (v: string) => void; onNumber: (v: string) => void; placeholder: string; className?: string;
}) {
  return (
    <div className={`flex overflow-hidden rounded-xl border border-[#CBD5E1] bg-white transition-colors focus-within:border-[#0F172A] ${className}`}>
      <label className="relative flex shrink-0 items-center border-r border-[#E2E8F0] bg-[#F8FAFC]">
        <select value={code} onChange={(e) => onCode(e.target.value)} aria-label="Pozivni broj"
          className="h-full cursor-pointer appearance-none bg-transparent py-3 pl-3.5 pr-8 text-[14px] font-semibold text-[#0F172A] outline-none">
          {COUNTRIES.map((x) => <option key={x.c} value={x.d}>{x.c} +{x.d}</option>)}
        </select>
        <ChevronDown size={14} className="pointer-events-none absolute right-2.5 text-[#64748B]" />
      </label>
      <input value={number} onChange={(e) => onNumber(e.target.value.replace(/[^\d\s]/g, ""))} inputMode="tel" autoComplete="tel-national"
        placeholder={placeholder} className="min-w-0 flex-1 bg-transparent px-4 py-3 text-[14px] text-[#0F172A] outline-none placeholder:text-[#94A3B8]" />
    </div>
  );
}
