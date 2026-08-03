"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { useTranslation } from "@/utils/translations/useTranslation";
import { DATA } from "@/utils/mockData";
import PortfolioMetrics from "@/components/dashboard/PortfolioMetrics";
import SearchAndFilters from "@/components/dashboard/SearchAndFilters";
import EnterpriseList from "@/components/dashboard/EnterpriseList";
import EnterpriseDetailCard from "@/components/dashboard/EnterpriseDetailCard";
import FinancialChart from "@/components/dashboard/FinancialChart";
import RiskAndAdvicePanel from "@/components/dashboard/RiskAndAdvicePanel";
import { Lock, TrendingUp } from "lucide-react";

export default function OfficerDashboard() {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { t } = useTranslation();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [search, setSearch] = useState("");
  const [districtFilter, setDistrictFilter] = useState("ALL");
  const [segmentFilter, setSegmentFilter] = useState("ALL");
  const [tierFilter, setTierFilter] = useState("ALL");
  const [selectedId, setSelectedId] = useState<string>(DATA.enterprises[0].id);

  // Route protection guard
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (!isAuthenticated && !token) {
      router.replace("/login");
    } else {
      setCheckingAuth(false);
    }
  }, [isAuthenticated, router]);

  const districts = useMemo(() => {
    return Array.from(new Set(DATA.enterprises.map((e) => e.district)));
  }, []);

  const segments = useMemo(() => {
    return Array.from(new Set(DATA.enterprises.map((e) => e.segment)));
  }, []);

  const filteredEnterprises = useMemo(() => {
    return DATA.enterprises.filter((e) => {
      const matchSearch =
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.phone.includes(search) ||
        e.id.toLowerCase().includes(search.toLowerCase());

      const matchDist = districtFilter === "ALL" || e.district === districtFilter;
      const matchSeg = segmentFilter === "ALL" || e.segment === segmentFilter;
      const matchTier = tierFilter === "ALL" || e.tier === tierFilter;

      return matchSearch && matchDist && matchSeg && matchTier;
    });
  }, [search, districtFilter, segmentFilter, tierFilter]);

  const selectedEnterprise = useMemo(() => {
    return (
      DATA.enterprises.find((e) => e.id === selectedId) ||
      filteredEnterprises[0] ||
      DATA.enterprises[0]
    );
  }, [selectedId, filteredEnterprises]);

  const bankableCount = DATA.enterprises.filter((e) => e.tier === "GREEN").length;
  const atRiskCount = DATA.enterprises.filter((e) => e.tier === "RED" || e.tier === "AMBER").length;

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#F4F5F0] flex flex-col items-center justify-center text-[#5F6656]">
        <Lock className="w-8 h-8 text-[#2E7D32] animate-bounce mb-3" />
        <p className="text-xs font-semibold">Authenticating Officer Credentials...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F5F0] text-[#1A2016] p-4 sm:p-6 lg:p-8">
      {/* Top Title Bar */}
      <div className="max-w-6xl mx-auto mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E6D8] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2E7D32]"></span>
            <h1 className="text-xl font-extrabold text-[#1A2016] font-['Poppins',sans-serif]">
              {t.dash.title}
            </h1>
          </div>
          <p className="text-xs text-[#5F6656] mt-0.5">{t.dash.tagline}</p>
        </div>

        {/* Backtest Stat Badge */}
        <div className="bg-white border border-[#E2E6D8] px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold text-[#2E7D32] shadow-2xs flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-[#2E7D32]" />
          <span>{t.dash.backtestStat(29.2, 57.5)}</span>
        </div>
      </div>

      {/* Dashboard Main Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <PortfolioMetrics bankableCount={bankableCount} atRiskCount={atRiskCount} t={t} />

          <SearchAndFilters
            search={search}
            setSearch={setSearch}
            districtFilter={districtFilter}
            setDistrictFilter={setDistrictFilter}
            segmentFilter={segmentFilter}
            setSegmentFilter={setSegmentFilter}
            tierFilter={tierFilter}
            setTierFilter={setTierFilter}
            districts={districts}
            segments={segments}
            t={t}
          />

          <EnterpriseList
            enterprises={filteredEnterprises}
            selectedEnterpriseId={selectedEnterprise.id}
            onSelect={setSelectedId}
            t={t}
          />
        </div>

        {/* Right Detail Panel */}
        <div className="lg:col-span-8 space-y-5">
          <EnterpriseDetailCard enterprise={selectedEnterprise} t={t} />

          <FinancialChart enterprise={selectedEnterprise} t={t} />

          <RiskAndAdvicePanel enterprise={selectedEnterprise} t={t} />
        </div>
      </div>
    </div>
  );
}
