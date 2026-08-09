"use client";

import React from "react";
import {
  WorklistItem,
  EnterpriseDetailsResponse,
  ReceivableItem,
  PaymentMixResponse,
  RiskPredictionResponse,
} from "@/utils/api-config";
import { Enterprise } from "@/types/enterprise";
import { TranslationDictionary } from "@/utils/translations/dictionary";
import { Loader2, Building2 } from "lucide-react";

import PortfolioMetrics from "./PortfolioMetrics";
import SearchAndFilters from "./SearchAndFilters";
import WorklistList from "./WorklistList";
import OfficerVisitOutcomeBar from "./OfficerVisitOutcomeBar";
import EnterpriseDetailCard from "./EnterpriseDetailCard";
import FinancialChart from "./FinancialChart";
import ReceivablesCard from "./ReceivablesCard";
import PaymentMixCard from "./PaymentMixCard";
import RiskAndAdvicePanel from "./RiskAndAdvicePanel";

interface MyPortfolioTabProps {
  filteredWorklistItems: WorklistItem[];
  selectedId: string;
  setSelectedId: (id: string) => void;
  selectedEnterprise?: Enterprise;
  enterpriseDetails?: EnterpriseDetailsResponse | null;
  loadingWorklist: boolean;
  loadingDetails: boolean;
  worklistError: string | null;
  receivables: ReceivableItem[];
  paymentMix: PaymentMixResponse | null;
  riskPrediction: RiskPredictionResponse | null;
  bankableCount: number;
  atRiskCount: number;
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
  tierCounts: Record<string, number>;
  t: TranslationDictionary;
}

export default function MyPortfolioTab({
  filteredWorklistItems,
  selectedId,
  setSelectedId,
  selectedEnterprise,
  enterpriseDetails,
  loadingWorklist,
  loadingDetails,
  worklistError,
  receivables,
  paymentMix,
  riskPrediction,
  bankableCount,
  atRiskCount,
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
  tierCounts,
  t,
}: MyPortfolioTabProps) {
  return (
    <div className="w-full flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-5 overflow-visible lg:overflow-hidden">
      {/* Left Sidebar: Officer Worklist & Metrics */}
      <div className="lg:col-span-5 flex flex-col lg:h-full min-h-0 overflow-visible lg:overflow-hidden space-y-3 shrink-0">
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
          tierCounts={tierCounts}
          t={t}
        />

        <div className="max-h-[40vh] lg:max-h-none lg:flex-1 min-h-0 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-[#2E7D32]/15 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent [scrollbar-width:thin]">
          <WorklistList
            items={filteredWorklistItems}
            selectedId={selectedId}
            onSelect={setSelectedId}
            t={t}
            isLoading={loadingWorklist}
            error={worklistError}
          />
        </div>
      </div>

      {/* Right Detail Panel - Independent vertical scrolling */}
      <div className="lg:col-span-7 lg:h-full min-h-0 overflow-visible lg:overflow-y-auto pr-1 space-y-4 lg:[&::-webkit-scrollbar]:w-1.5 lg:[&::-webkit-scrollbar-thumb]:bg-[#2E7D32]/15 lg:[&::-webkit-scrollbar-thumb]:rounded-full lg:[&::-webkit-scrollbar-track]:bg-transparent lg:[scrollbar-width:thin]">
        {!selectedEnterprise ? (
          <div className="bg-white border border-[#E2E6D8] p-12 rounded-2xl shadow-3xs text-center flex flex-col items-center justify-center gap-2 h-full text-[#5F6656]">
            <Building2 className="w-8 h-8 text-[#E2E6D8] shrink-0" />
            <h4 className="font-bold text-[#1A2016]">No Enterprise Selected</h4>
            <p className="text-[10px] max-w-sm leading-tight">
              Please choose an enterprise from the portfolio worklist on the left to view active forecasts, receivables, and risk mitigation strategies.
            </p>
          </div>
        ) : (
          <>
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
                  t={t}
                />

                <FinancialChart
                  enterprise={selectedEnterprise}
                  liveForecast={enterpriseDetails?.live_forecast}
                  t={t}
                />

                <ReceivablesCard items={receivables} isLoading={loadingDetails} t={t} />

                <PaymentMixCard data={paymentMix} isLoading={loadingDetails} t={t} />

                <RiskAndAdvicePanel
                  enterprise={selectedEnterprise}
                  latestAlert={enterpriseDetails?.latest_alert}
                  prediction={riskPrediction}
                  t={t}
                />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
