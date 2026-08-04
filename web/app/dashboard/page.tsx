"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { checkIsAuthenticated } from "@/utils/auth";
import { useTranslation } from "@/utils/translations/useTranslation";
import {
  getWorklist,
  getEnterpriseDetails,
  getReceivables,
  getPaymentMix,
  getRiskPrediction,
  WorklistItem,
  EnterpriseDetailsResponse,
  ReceivableItem,
  PaymentMixResponse,
  RiskPredictionResponse,
} from "@/utils/api-config";
import { worklistItemToEnterprise, enterpriseDetailsToEnterprise } from "@/utils/worklistAdapter";
import { Enterprise } from "@/types/enterprise";
import PortfolioMetrics from "@/components/dashboard/PortfolioMetrics";
import SearchAndFilters from "@/components/dashboard/SearchAndFilters";
import WorklistList from "@/components/dashboard/WorklistList";
import OfficerVisitOutcomeBar from "@/components/dashboard/OfficerVisitOutcomeBar";
import EnterpriseDetailCard from "@/components/dashboard/EnterpriseDetailCard";
import FinancialChart from "@/components/dashboard/FinancialChart";
import ReceivablesCard from "@/components/dashboard/ReceivablesCard";
import PaymentMixCard from "@/components/dashboard/PaymentMixCard";
import RiskAndAdvicePanel from "@/components/dashboard/RiskAndAdvicePanel";
import { Lock, TrendingUp, Loader2 } from "lucide-react";

export default function OfficerDashboard() {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { t } = useTranslation();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [worklistItems, setWorklistItems] = useState<WorklistItem[]>([]);
  const [loadingWorklist, setLoadingWorklist] = useState<boolean>(true);
  const [worklistError, setWorklistError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [districtFilter, setDistrictFilter] = useState("ALL");
  const [segmentFilter, setSegmentFilter] = useState("ALL");
  const [tierFilter, setTierFilter] = useState("ALL");
  const [selectedId, setSelectedId] = useState<string>("");

  // Detailed API States for selected enterprise
  const [enterpriseDetails, setEnterpriseDetails] = useState<EnterpriseDetailsResponse | null>(null);
  const [receivables, setReceivables] = useState<ReceivableItem[]>([]);
  const [paymentMix, setPaymentMix] = useState<PaymentMixResponse | null>(null);
  const [riskPrediction, setRiskPrediction] = useState<RiskPredictionResponse | null>(null);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);

  // Route protection guard & API Worklist fetcher
  useEffect(() => {
    if (!isAuthenticated && !checkIsAuthenticated()) {
      router.replace("/login");
      return;
    }

    queueMicrotask(() => {
      setCheckingAuth(false);
    });

    let isMounted = true;
    async function loadWorklist() {
      try {
        setLoadingWorklist(true);
        setWorklistError(null);
        const data = await getWorklist();
        if (isMounted) {
          const list = Array.isArray(data) ? data : [];
          setWorklistItems(list);
          if (list.length > 0) {
            setSelectedId(list[0].enterprise_id);
          }
        }
      } catch (err) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : "Failed to load worklist from API";
          setWorklistError(msg);
        }
      } finally {
        if (isMounted) {
          setLoadingWorklist(false);
        }
      }
    }

    loadWorklist();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, router]);

  // Fetch full details whenever selectedId changes
  useEffect(() => {
    if (!selectedId) return;

    let isMounted = true;

    async function fetchEnterpriseFullData() {
      setLoadingDetails(true);

      try {
        const details = await getEnterpriseDetails(selectedId).catch(() => null);
        if (isMounted) setEnterpriseDetails(details);

        const recs = await getReceivables(selectedId).catch(() => []);
        if (isMounted) setReceivables(recs);

        const pm = await getPaymentMix(selectedId).catch(() => null);
        if (isMounted) setPaymentMix(pm);

        const pred = await getRiskPrediction(selectedId).catch(() => null);
        if (isMounted) setRiskPrediction(pred);
      } catch {
        // Handle unexpected error silently
      } finally {
        if (isMounted) {
          setLoadingDetails(false);
        }
      }
    }

    fetchEnterpriseFullData();

    return () => {
      isMounted = false;
    };
  }, [selectedId]);

  // Unique blocks/districts from API worklist
  const districts = useMemo(() => {
    return Array.from(new Set(worklistItems.map((item) => item.block).filter(Boolean)));
  }, [worklistItems]);

  // Unique segments/sub_types from API worklist
  const segments = useMemo(() => {
    return Array.from(new Set(worklistItems.map((item) => item.sub_type).filter(Boolean)));
  }, [worklistItems]);

  // Filter worklist items based on search and filters
  const filteredWorklistItems = useMemo(() => {
    return worklistItems.filter((item) => {
      const matchSearch =
        item.proprietor_name.toLowerCase().includes(search.toLowerCase()) ||
        item.enterprise_id.toLowerCase().includes(search.toLowerCase()) ||
        item.sub_type.toLowerCase().includes(search.toLowerCase()) ||
        item.block.toLowerCase().includes(search.toLowerCase());

      const matchDist = districtFilter === "ALL" || item.block === districtFilter;
      const matchSeg = segmentFilter === "ALL" || item.sub_type === segmentFilter;
      const matchTier = tierFilter === "ALL" || item.risk_tier === tierFilter;

      return matchSearch && matchDist && matchSeg && matchTier;
    });
  }, [worklistItems, search, districtFilter, segmentFilter, tierFilter]);

  // Selected enterprise model built purely from live API responses
  const selectedEnterprise: Enterprise = useMemo(() => {
    if (enterpriseDetails) {
      return enterpriseDetailsToEnterprise(enterpriseDetails);
    }

    const foundItem =
      worklistItems.find((item) => item.enterprise_id === selectedId) ||
      filteredWorklistItems[0] ||
      worklistItems[0];

    if (foundItem) {
      return worklistItemToEnterprise(foundItem);
    }

    // Default empty Enterprise placeholder if no API item loaded yet
    return {
      id: selectedId || "N/A",
      name: "Select Enterprise",
      segment: "MSME",
      district: "District",
      phone: "+91 0000000000",
      tier: "AMBER",
      score: 0,
      confidence: { score: 0, label: "Unknown" },
      forecastBand: [],
      reasons: [],
      adviceKeys: [],
      forecast90: 0,
      forecast180: 0,
      netNow90: 0,
      monthlyForecast: [0, 0, 0, 0, 0, 0],
      metrics: {
        avgInflow30: 0,
        outInRatio: 0,
        zeroDays: 0,
        volatility: 0,
        trend: 0,
        savings: 0,
        runwayMonths: 0,
        missedEmi: 0,
        loan: 0,
        emi: 0,
        upiShare: 0,
        appShare: 0,
        digitalShare: 0,
        dscr: null,
        creditHeadroom: 0,
        suggestedEmi: 0,
      },
      history: [],
    };
  }, [selectedId, enterpriseDetails, worklistItems, filteredWorklistItems]);

  const bankableCount = useMemo(() => {
    return worklistItems.filter((item) => item.risk_tier === "GREEN").length;
  }, [worklistItems]);

  const atRiskCount = useMemo(() => {
    return worklistItems.filter((item) => item.risk_tier === "RED" || item.risk_tier === "AMBER").length;
  }, [worklistItems]);

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
        {/* Left Sidebar: Officer Worklist & Metrics */}
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

          <WorklistList
            items={filteredWorklistItems}
            selectedId={selectedId}
            onSelect={setSelectedId}
            t={t}
            isLoading={loadingWorklist}
            error={worklistError}
          />
        </div>

        {/* Right Detail Panel */}
        <div className="lg:col-span-8 space-y-5">
          {/* Top Officer Field Visit Outcome Checkbar */}
          <OfficerVisitOutcomeBar
            enterprise={selectedEnterprise}
            latestAlert={enterpriseDetails?.latest_alert}
          />

          {/* Main Details Loading Animation or Content */}
          {loadingDetails ? (
            <div className="bg-white border border-[#E2E6D8] p-12 rounded-2xl shadow-2xs text-center flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-[#2E7D32] animate-spin" />
              <div>
                <h4 className="text-xs font-bold text-[#1A2016] uppercase tracking-wider">
                  Loading Enterprise Analytics...
                </h4>
                <p className="text-[11px] text-[#5F6656] mt-1 font-mono">
                  Fetching GCP Maps Static Tile, Udhaar Receivables & Live Forecasts
                </p>
              </div>
            </div>
          ) : (
            <>
              <EnterpriseDetailCard
                card={enterpriseDetails?.card}
                enterprise={selectedEnterprise}
              />

              <FinancialChart
                enterprise={selectedEnterprise}
                liveForecast={enterpriseDetails?.live_forecast}
                t={t}
              />

              <ReceivablesCard items={receivables} isLoading={loadingDetails} />

              <PaymentMixCard data={paymentMix} isLoading={loadingDetails} />

              <RiskAndAdvicePanel
                enterprise={selectedEnterprise}
                latestAlert={enterpriseDetails?.latest_alert}
                prediction={riskPrediction}
                t={t}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
