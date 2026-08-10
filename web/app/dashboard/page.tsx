"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import MyPortfolioTab from "@/components/dashboard/MyPortfolioTab";
import TransactionsTab from "@/components/dashboard/TransactionsTab";
import MarketIntelligenceTab from "@/components/dashboard/MarketIntelligenceTab";
import { Lock, Loader2 } from "lucide-react";

function OfficerDashboardContent() {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { t, currentLanguage } = useTranslation();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [worklistItems, setWorklistItems] = useState<WorklistItem[]>([]);
  const [loadingWorklist, setLoadingWorklist] = useState<boolean>(true);
  const [worklistError, setWorklistError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [districtFilter, setDistrictFilter] = useState("ALL");
  const [segmentFilter, setSegmentFilter] = useState("ALL");
  const [tierFilter, setTierFilter] = useState("ALL");
  const [selectedId, setSelectedId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"portfolio" | "market" | "transactions">("portfolio");
  const [selectedTenderFilter, setSelectedTenderFilter] = useState<string>("all");

  // Detailed API States for selected enterprise
  const [enterpriseDetails, setEnterpriseDetails] = useState<EnterpriseDetailsResponse | null>(null);
  const [receivables, setReceivables] = useState<ReceivableItem[]>([]);
  const [paymentMix, setPaymentMix] = useState<PaymentMixResponse | null>(null);
  const [riskPrediction, setRiskPrediction] = useState<RiskPredictionResponse | null>(null);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);

  const searchParams = useSearchParams();
  const queryId = searchParams?.get("enterprise_id");

  // Sync query parameter changes to selectedId state
  useEffect(() => {
    if (queryId && queryId !== selectedId) {
      setSelectedId(queryId);
    }
  }, [queryId, selectedId]);

  // Sync selectedId changes back to query parameters
  useEffect(() => {
    if (selectedId) {
      const params = new URLSearchParams(window.location.search);
      if (params.get("enterprise_id") !== selectedId) {
        params.set("enterprise_id", selectedId);
        router.replace(`${window.location.pathname}?${params.toString()}`);
      }
    }
  }, [selectedId, router]);

  useEffect(() => {
    // Enable responsive desktop-only body overflow hidden
    document.body.classList.add("dashboard-body");
    return () => {
      document.body.classList.remove("dashboard-body");
    };
  }, []);

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
            const urlParams = new URLSearchParams(window.location.search);
            const queryId = urlParams.get("enterprise_id");
            setSelectedId(queryId || list[0].enterprise_id);
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

  // Tier counts mapping for search and filter buttons
  const tierCounts = useMemo(() => {
    return worklistItems.reduce((acc, item) => {
      const tier = item.risk_tier || "AMBER";
      acc[tier] = (acc[tier] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
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

  const selectedWorklistItem = useMemo(() => {
    return worklistItems.find((item) => item.enterprise_id === selectedId);
  }, [worklistItems, selectedId]);

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
    <div className="min-h-[calc(100vh-62px)] lg:h-[calc(100vh-62px)] lg:max-h-[calc(100vh-62px)] bg-[#F4F5F0] text-[#1A2016] p-4 lg:p-5 flex flex-col overflow-visible lg:overflow-hidden">
      {/* Top Title Bar */}
      <div className="w-full max-w-7xl mx-auto mb-2 flex flex-col md:flex-row md:items-center md:justify-between gap-2 border-b border-[#E2E6D8] pb-2 shrink-0">
        <div className="flex items-baseline gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#2E7D32]"></span>
            <h1 className="text-xs sm:text-sm font-extrabold text-[#1A2016] font-['Poppins',sans-serif] tracking-tight">
              {t.dash.title}
            </h1>
          </div>
          <span className="text-[10px] text-[#5F6656] hidden sm:inline">| {t.dash.tagline}</span>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-[#FAFBF6] border border-[#E2E6D8] p-0.5 rounded-lg flex items-center shadow-2xs shrink-0 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab("portfolio")}
            className={`flex-1 md:flex-none px-3 py-1.5 md:py-1 rounded-md text-[10.5px] font-bold transition-all cursor-pointer ${activeTab === "portfolio"
              ? "bg-[#2E7D32] text-white shadow-xs"
              : "text-[#5F6656] hover:text-[#1A2016]"
              }`}
          >
            {t.dash.portfolioTab || "My Portfolio"}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("market")}
            className={`flex-1 md:flex-none px-3 py-1.5 md:py-1 rounded-md text-[10.5px] font-bold transition-all cursor-pointer ${activeTab === "market"
              ? "bg-[#2E7D32] text-white shadow-xs"
              : "text-[#5F6656] hover:text-[#1A2016]"
              }`}
          >
            {t.dash.marketIntelTab || "Market Intel"}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("transactions")}
            className={`flex-1 md:flex-none px-3 py-1.5 md:py-1 rounded-md text-[10.5px] font-bold transition-all cursor-pointer ${activeTab === "transactions"
              ? "bg-[#2E7D32] text-white shadow-xs"
              : "text-[#5F6656] hover:text-[#1A2016]"
              }`}
          >
            {t.dash.transactionsTab}
          </button>
        </div>
      </div>

      {/* Tab Render Switch */}
      <div className="w-full max-w-7xl mx-auto flex-1 min-h-0 overflow-visible lg:overflow-hidden flex flex-col">
        {activeTab === "portfolio" ? (
          <MyPortfolioTab
            filteredWorklistItems={filteredWorklistItems}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            selectedEnterprise={selectedEnterprise}
            enterpriseDetails={enterpriseDetails}
            loadingWorklist={loadingWorklist}
            loadingDetails={loadingDetails}
            worklistError={worklistError}
            receivables={receivables}
            paymentMix={paymentMix}
            riskPrediction={riskPrediction}
            bankableCount={bankableCount}
            atRiskCount={atRiskCount}
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
            tierCounts={tierCounts}
            t={t}
            lang={currentLanguage}
            onSelectTenderFilter={(tender: string) => {
              setSelectedTenderFilter(tender);
              setActiveTab("transactions");
            }}
          />
        ) : activeTab === "market" ? (
          <MarketIntelligenceTab initialSubType={selectedWorklistItem?.sub_type} />
        ) : (
          <TransactionsTab
            enterpriseId={selectedId}
            enterpriseName={selectedEnterprise?.name}
            initialTenderFilter={selectedTenderFilter}
            onTenderFilterChange={setSelectedTenderFilter}
            t={t}
            worklistItems={worklistItems}
          />
        )}
      </div>
    </div>
  );
}

export default function OfficerDashboard() {
  return (
    <React.Suspense fallback={
      <div className="min-h-[calc(100vh-62px)] bg-[#F4F5F0] flex flex-col items-center justify-center text-[#5F6656]">
        <Loader2 className="w-8 h-8 text-[#2E7D32] animate-spin mb-3" />
        <p className="text-xs font-semibold">Loading Dashboard...</p>
      </div>
    }>
      <OfficerDashboardContent />
    </React.Suspense>
  );
}
