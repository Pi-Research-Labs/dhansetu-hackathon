import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface SecurityBadgeProps {
  label?: string;
}

export function SecurityBadge({
  label = 'Protected by National Cyber Security Audit • NIC Verified',
}: SecurityBadgeProps) {
  return (
    <div className="flex items-center justify-center gap-1.5 py-2 text-center">
      <ShieldCheck className="w-4 h-4 text-[#2E7D32]" />
      <span className="text-[#6F6B5E] text-[11px] font-semibold">{label}</span>
    </div>
  );
}
