"use client";

import { Search } from "lucide-react";
import { TranslationDictionary } from "@/utils/translations/dictionary";

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
  t,
}: SearchAndFiltersProps) {
  return (
    <div className="bg-white border border-[#E2E6D8] p-3.5 rounded-xl space-y-2.5 shadow-2xs">
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-[#5F6656] absolute left-3 top-2.5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.dash.searchPlaceholder}
          className="w-full bg-[#FAFBF6] border border-[#E2E6D8] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#1A2016] placeholder-[#9E9E9E] focus:outline-none focus:ring-1 focus:ring-[#2E7D32]"
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <select
          value={districtFilter}
          onChange={(e) => setDistrictFilter(e.target.value)}
          className="bg-[#FAFBF6] border border-[#E2E6D8] text-[11px] text-[#1A2016] rounded-lg p-1.5 focus:outline-none"
        >
          <option value="ALL">{t.dash.allDistricts}</option>
          {districts.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <select
          value={segmentFilter}
          onChange={(e) => setSegmentFilter(e.target.value)}
          className="bg-[#FAFBF6] border border-[#E2E6D8] text-[11px] text-[#1A2016] rounded-lg p-1.5 focus:outline-none"
        >
          <option value="ALL">{t.dash.allSegments}</option>
          {segments.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          className="bg-[#FAFBF6] border border-[#E2E6D8] text-[11px] text-[#1A2016] rounded-lg p-1.5 focus:outline-none"
        >
          <option value="ALL">{t.dash.allTiers}</option>
          <option value="GREEN">GREEN</option>
          <option value="AMBER">AMBER</option>
          <option value="RED">RED</option>
        </select>
      </div>
    </div>
  );
}
