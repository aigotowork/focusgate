import React from "react";
import { BRAND, gateMarkSvg } from "./brand";

type BrandMarkProps = {
  className?: string;
  label?: string;
};

export function BrandMark({ className = "h-10 w-10", label = BRAND.fullName }: BrandMarkProps): JSX.Element {
  return (
    <span
      aria-label={label}
      className={`inline-flex shrink-0 items-center justify-center ${className}`}
      dangerouslySetInnerHTML={{ __html: gateMarkSvg }}
      role="img"
    />
  );
}

export function BrandWordmark({ compact = false }: { compact?: boolean }): JSX.Element {
  if (compact) {
    return (
      <span className="font-bold text-slate-950">
        Focus<span className="text-indigo-600">Gate</span>
      </span>
    );
  }

  return (
    <span className="inline-flex flex-col leading-none">
      <span className="text-base font-extrabold tracking-normal text-slate-950">
        Focus<span className="text-indigo-600">Gate</span>
      </span>
      <span className="mt-1 text-[10px] font-medium tracking-[0.28em] text-slate-400">{BRAND.nameZh}</span>
    </span>
  );
}
