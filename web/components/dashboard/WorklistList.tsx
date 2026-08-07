"use client";

import React from "react";
import { WorklistItem } from "@/utils/api-config";
import { TranslationDictionary } from "@/utils/translations/dictionary";
import { getWorklistSparkData } from "@/utils/mockData";
import { AlertTriangle, Loader2 } from "lucide-react";

interface WorklistListProps {
  items: WorklistItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  t: TranslationDictionary;
  isLoading?: boolean;
  error?: string | null;
}

// Spark SVG component matching rural-cashflow-dashboard.jsx (supports blank or mock data)
function Spark({
  hist = [],
  fc = [],
  tier,
  w = 140,
  h = 32,
}: {
  hist?: { net: number }[];
  fc?: number[];
  tier: string;
  w?: number;
  h?: number;
}) {
  const nets = hist.map((d) => d.net);
  const fcVals = fc;
  const all = [...nets, ...fcVals];
  const n = all.length;

  if (n < 2) {
    // Blank placeholder SVG for when sparkline data is disabled
    return (
      <svg width={w} height={h} className="block shrink-0 opacity-25">
        <line x1={0} x2={w} y1={h / 2} y2={h / 2} stroke="#E2E6D8" strokeDasharray="3 3" />
      </svg>
    );
  }

  const min = Math.min(...all, 0);
  const max = Math.max(...all, 1);
  const x = (i: number) => (i / (n - 1)) * w;
  const y = (v: number) => h - ((v - min) / (max - min || 1)) * (h - 4) - 2;

  const histPts = nets.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const fcPts = [nets.length - 1, ...fcVals.map((_, i) => nets.length + i)]
    .map((idx, j) => `${x(idx)},${y(j === 0 ? nets[nets.length - 1] : fcVals[j - 1])}`)
    .join(" ");

  const zx = x(nets.length - 1);

  const tierColors: Record<string, string> = {
    GREEN: "#2E7D32",
    AMBER: "#E65100",
    RED: "#C62828",
  };
  const col = tierColors[tier] || "#2E7D32";

  return (
    <svg width={w} height={h} className="block shrink-0">
      <rect x={zx} y={0} width={w - zx} height={h} fill={col} opacity={0.08} />
      {min < 0 && <line x1={0} x2={w} y1={y(0)} y2={y(0)} stroke="#E2E6D8" />}
      <polyline points={histPts} fill="none" stroke={col} strokeWidth="1.6" />
      <polyline points={fcPts} fill="none" stroke={col} strokeWidth="1.6" strokeDasharray="3 3" />
      <circle cx={zx} cy={y(nets[nets.length - 1])} r="2.2" fill={col} />
    </svg>
  );
}

export default function WorklistList({
  items,
  selectedId,
  onSelect,
  t,
  isLoading = false,
  error = null,
}: WorklistListProps) {
  if (isLoading) {
    return (
      <div className="bg-white border border-[#E2E6D8] rounded-xl p-8 text-center text-xs text-[#5F6656] shadow-2xs flex flex-col items-center justify-center gap-2">
        <Loader2 className="w-6 h-6 text-[#2E7D32] animate-spin" />
        <span>Loading Officer Worklist from API...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#FFEBEE] border border-[#C62828]/30 rounded-xl p-4 text-xs text-[#C62828] shadow-2xs flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        <span>Failed to load worklist: {error}</span>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white border border-[#E2E6D8] rounded-xl p-6 text-center text-xs text-[#5F6656] shadow-2xs">
        {t.dash.noMatch || "No worklist items match your criteria."}
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E2E6D8] rounded-xl overflow-hidden max-h-[650px] overflow-y-auto divide-y divide-[#E2E6D8]/60 shadow-2xs">
      {items.map((item) => {
        const isSelected = item.enterprise_id === selectedId;

        const tierConfig: Record<string, { color: string; label: string }> = {
          GREEN: { color: "#2E7D32", label: t.tiers?.GREEN || "Stable" },
          AMBER: { color: "#E65100", label: t.tiers?.AMBER || "Watch" },
          RED: { color: "#C62828", label: t.tiers?.RED || "Act now" },
        };

        const tierKey = (item.risk_tier as "GREEN" | "AMBER" | "RED") || "AMBER";
        const tier = tierConfig[tierKey] || tierConfig.AMBER;
        const formattedScore = Math.round(item.score <= 1 ? item.score * 100 : item.score);

        // Fetch detachable sparkline graph data
        const sparkData = getWorklistSparkData(
          item.enterprise_id,
          item.risk_tier,
          item.rupees_at_risk,
          item.projected_shortfall
        );

        return (
          <button
            key={item.enterprise_id}
            onClick={() => onSelect(item.enterprise_id)}
            className={`w-full text-left px-4 py-3 transition-all cursor-pointer flex items-center gap-3 border-b border-[#E2E6D8]/60 ${
              isSelected
                ? "bg-white border-l-[3px]"
                : "bg-transparent border-l-[3px] border-l-transparent hover:bg-[#FAFBF6]"
            }`}
            style={{
              borderLeftColor: isSelected ? tier.color : "transparent",
            }}
          >
            {/* Enterprise/Proprietor Name & Subtitle */}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-[13.5px] text-[#1A2016] truncate">
                {item.proprietor_name || `Enterprise ${item.enterprise_id}`}
              </div>
              <div className="text-[11px] text-[#5F6656] truncate mt-0.5">
                {item.sub_type} · {item.block} · ID: {item.enterprise_id}
              </div>
            </div>

            {/* Sparkline Chart SVG (Sourced from detachable mockData helper) */}
            <Spark hist={sparkData.history} fc={sparkData.fc} tier={tierKey} />

            {/* Tier Status Label & Score */}
            <div
              className="font-mono text-[11px] font-semibold min-w-[62px] text-right shrink-0"
              style={{ color: tier.color }}
            >
              <div>{tier.label}</div>
              <div className="text-[#5F6656] font-medium font-sans mt-0.5">
                {formattedScore}/100
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}


