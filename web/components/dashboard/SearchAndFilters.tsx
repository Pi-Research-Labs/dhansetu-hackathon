"use client";

import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { TranslationDictionary } from "@/utils/translations/dictionary";
import { useAppSelector } from "@/redux/hooks";
import { translateText } from "@/utils/translator";
import { LanguageCode } from "@/redux/slices/languageSlice";

interface SearchAndFiltersProps {
  search: string;
  setSearch: (val: string) => void;
  districtFilter: string;
  setDistrictFilter: (val: string) => void;
  segmentFilter: string;
  setSegmentFilter: (val: string) => void;
  tierFilter: string;
  setTierFilter: (val: string) => void;
  districts: string[];
  segments: string[];
  tierCounts?: Record<string, number>;
  t: TranslationDictionary;
}

export default function SearchAndFilters({
  search,
  setSearch,
  districtFilter,
  setDistrictFilter,
  segmentFilter,
  setSegmentFilter,
  tierFilter,
  setTierFilter,
  districts,
  segments,
  tierCounts = {},
  t,
}: SearchAndFiltersProps) {
  const currentLanguage = useAppSelector(
    (state) => state.language.currentLanguage || "en"
  ) as LanguageCode;

  const [translatedDistricts, setTranslatedDistricts] = useState<Record<string, string>>({});
  const [translatedSegments, setTranslatedSegments] = useState<Record<string, string>>({});

  useEffect(() => {
    let isMounted = true;
    async function translateLists() {
      const dTr: Record<string, string> = {};
      await Promise.all(
        districts.map(async (d) => {
          dTr[d] = await translateText(d, currentLanguage);
        })
      );
      const sTr: Record<string, string> = {};
      await Promise.all(
        segments.map(async (s) => {
          sTr[s] = await translateText(s, currentLanguage);
        })
      );
      if (isMounted) {
        setTranslatedDistricts(dTr);
        setTranslatedSegments(sTr);
      }
    }
    translateLists();
    return () => {
      isMounted = false;
    };
  }, [districts, segments, currentLanguage]);

  const tierPills = [
    { key: "RED", label: t.tiers?.RED || "Act now", color: "#C62828", bg: "#FFEBEE" },
    { key: "AMBER", label: t.tiers?.AMBER || "Watch", color: "#E65100", bg: "#FFF3E0" },
    { key: "GREEN", label: t.tiers?.GREEN || "Stable", color: "#2E7D32", bg: "#E8F5E9" },
  ];

  return (
    <div className="bg-white border border-[#E2E6D8] p-2.5 rounded-lg space-y-2 shadow-3xs shrink-0">
      {/* Full-width Search Input at Top */}
      <div className="relative w-full">
        <Search className="w-3.5 h-3.5 text-[#5F6656] absolute left-2.5 top-2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.dash.searchPlaceholder || "Search..."}
          className="w-full bg-[#FAFBF6] border border-[#E2E6D8] rounded-md pl-8 pr-2.5 py-1 text-xs text-[#1A2016] placeholder-[#9E9E9E] focus:outline-none focus:ring-1 focus:ring-[#2E7D32]"
        />
      </div>

      {/* Dropdown Filters for Block & Segment */}
      <div className="grid grid-cols-2 gap-2">
        <select
          value={districtFilter}
          onChange={(e) => setDistrictFilter(e.target.value)}
          className="bg-[#FAFBF6] border border-[#E2E6D8] text-[10.5px] text-[#1A2016] rounded-md p-1 focus:outline-none cursor-pointer"
        >
          <option value="ALL">{t.dash.allDistricts || "All Blocks"}</option>
          {districts.map((d) => (
            <option key={d} value={d}>
              {translatedDistricts[d] || d}
            </option>
          ))}
        </select>

        <select
          value={segmentFilter}
          onChange={(e) => setSegmentFilter(e.target.value)}
          className="bg-[#FAFBF6] border border-[#E2E6D8] text-[10.5px] text-[#1A2016] rounded-md p-1 focus:outline-none cursor-pointer"
        >
          <option value="ALL">{t.dash.allSegments || "All Segments"}</option>
          {segments.map((s) => (
            <option key={s} value={s}>
              {translatedSegments[s] || s}
            </option>
          ))}
        </select>
      </div>

      {/* Tier Filter Pill Buttons with Counts */}
      <div className="flex items-center justify-between gap-1.5 border-t border-[#E2E6D8]/50 pt-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          {tierPills.map((tier) => {
            const isActive = tierFilter === tier.key;
            const count = tierCounts[tier.key] || 0;
            return (
              <button
                key={tier.key}
                onClick={() => setTierFilter(isActive ? "ALL" : tier.key)}
                className="flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-semibold cursor-pointer transition-all"
                style={{
                  borderColor: isActive ? tier.color : "#E2E6D8",
                  backgroundColor: tier.bg,
                  color: tier.color,
                }}
              >
                <span className="font-mono font-bold text-[9.5px]">{count}</span>
                <span>{tier.label}</span>
              </button>
            );
          })}
        </div>
        {tierFilter !== "ALL" && (
          <button
            onClick={() => setTierFilter("ALL")}
            className="text-[10px] text-[#5F6656] hover:text-[#1A2016] underline cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

