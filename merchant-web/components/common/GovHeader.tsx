import React from 'react';
import { Landmark } from 'lucide-react';

interface GovHeaderProps {
  title?: string;
  subtitle?: string;
}

export function GovHeader({
  title = 'DHANSETU NETWORK',
  subtitle = 'Verified Merchant Gateway',
}: GovHeaderProps) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-9 h-9 rounded-lg bg-[#E7F2E7] border border-[#E7E5DA] flex items-center justify-center">
        <Landmark className="w-5 h-5 text-[#2E7D32]" />
      </div>
      <div>
        <p className="text-[#1D261F] text-[11px] font-bold tracking-wider leading-none uppercase">{title}</p>
        <p className="text-[#6F6B5E] text-[10px] font-semibold mt-0.5 leading-none">{subtitle}</p>
      </div>
    </div>
  );
}
