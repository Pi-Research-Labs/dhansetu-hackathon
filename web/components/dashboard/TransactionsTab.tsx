"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Select from "react-select";
import { getTransactions, getWorklist, LedgerTransaction, WorklistItem } from "@/utils/api-config";
import { formatCurrency } from "@/utils/formatters";
import { TranslationDictionary } from "@/utils/translations/dictionary";
import {
  Calendar,
  Globe,
  Coins,
  TrendingUp,
  TrendingDown,
  Loader2,
  Filter,
  CheckCircle2,
  Smartphone,
  CreditCard,
  AlertCircle,
} from "lucide-react";

interface TransactionsTabProps {
  enterpriseId?: string | null;
  enterpriseName?: string | null;
  initialTenderFilter?: string;
  onTenderFilterChange?: (filter: string) => void;
  t: TranslationDictionary;
  worklistItems?: WorklistItem[];
}

export default function TransactionsTab({
  enterpriseId,
  enterpriseName,
  initialTenderFilter = "all",
  onTenderFilterChange,
  t,
  worklistItems = [],
}: TransactionsTabProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Worklist local state
  const [worklist, setWorklist] = useState<WorklistItem[]>(worklistItems);
  const [queue, setQueue] = useState<LedgerTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [directionFilter, setDirectionFilter] = useState<string>("all");
  const [tenderFilter, setTenderFilter] = useState<string>(initialTenderFilter);
  const [prevInitialFilter, setPrevInitialFilter] = useState<string>(initialTenderFilter);

  // Sync state if initialTenderFilter changes from parent (during render-phase)
  if (initialTenderFilter !== prevInitialFilter) {
    setTenderFilter(initialTenderFilter);
    setPrevInitialFilter(initialTenderFilter);
  }

  // Load/fetch worklist on mount if not provided as a prop
  useEffect(() => {
    if (worklistItems && worklistItems.length > 0) {
      setWorklist(worklistItems);
      return;
    }
    let isMounted = true;
    getWorklist()
      .then((data) => {
        if (isMounted) {
          setWorklist(data || []);
        }
      })
      .catch(() => { });
    return () => {
      isMounted = false;
    };
  }, [worklistItems]);

  // Read enterprise_id from query parameters
  const queryEnterpriseId = searchParams.get("enterprise_id");

  // Determine the active enterprise ID (prioritizes query param, then prop, then first item in worklist)
  const activeEnterpriseId = queryEnterpriseId || enterpriseId || (worklist[0]?.enterprise_id || "");

  // Find active enterprise from worklist
  const activeEnterprise = useMemo(() => {
    return worklist.find((item) => item.enterprise_id === activeEnterpriseId);
  }, [worklist, activeEnterpriseId]);

  const activeEnterpriseName = activeEnterprise?.proprietor_name || enterpriseName || "Unknown proprietor";

  const handleTenderFilterChange = (val: string) => {
    setTenderFilter(val);
    if (onTenderFilterChange) {
      onTenderFilterChange(val);
    }
  };

  const handleEnterpriseChange = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (id) {
      params.set("enterprise_id", id);
    } else {
      params.delete("enterprise_id");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  // Load transactions queue when activeEnterpriseId changes
  useEffect(() => {
    if (!activeEnterpriseId) {
      setQueue([]);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    // Fetch a larger limit so we can filter locally
    getTransactions(activeEnterpriseId, { limit: 100 })
      .then((page) => {
        if (!isMounted) return;
        setQueue(page.transactions || []);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to load transactions");
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeEnterpriseId]);

  // Filtered Queue
  const filteredQueue = useMemo(() => {
    return queue.filter((item) => {
      // 1. Direction filter
      const matchesDirection =
        directionFilter === "all" || item.direction === directionFilter;

      // 2. Tender mode filter (checks both tender and channel fields)
      const itemTender = String(item.tender || item.channel || "").toLowerCase();
      const matchesTender =
        tenderFilter === "all" || itemTender === tenderFilter;

      return matchesDirection && matchesTender;
    });
  }, [queue, directionFilter, tenderFilter]);

  // Clean filters helper
  const resetFilters = () => {
    setDirectionFilter("all");
    handleTenderFilterChange("all");
  };

  const getTenderIcon = (tender?: string) => {
    const tLower = (tender || "").toLowerCase();
    if (tLower === "upi" || tLower === "wallet") {
      return <Smartphone className="w-3.5 h-3.5 text-[#1565C0] shrink-0" />;
    } else if (tLower === "cash") {
      return <Coins className="w-3.5 h-3.5 text-[#2E7D32] shrink-0" />;
    }
    return <CreditCard className="w-3.5 h-3.5 text-[#5F6656] shrink-0" />;
  };

  const getConfidencePct = (confidence?: number | string | null) => {
    if (confidence === undefined || confidence === null) return 0;
    const num = Number(confidence);
    if (isNaN(num)) return 0;
    if (num <= 1) return Math.round(num * 100);
    return Math.round(num);
  };

  // react-select custom styling to match the organic, modern dashboard design
  const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: "#FFFFFF",
      borderColor: state.isFocused ? "#2E7D32" : "#E2E6D8",
      borderRadius: "0.75rem", // rounded-xl
      fontSize: "0.75rem", // text-xs
      color: "#1A2016",
      boxShadow: state.isFocused ? "0 0 0 1px #2E7D32" : "none",
      "&:hover": {
        borderColor: state.isFocused ? "#2E7D32" : "#E2E6D8",
      },
      minHeight: "34px",
      height: "34px",
      cursor: "pointer",
    }),
    valueContainer: (provided: any) => ({
      ...provided,
      padding: "0 10px",
      height: "34px",
      display: "flex",
      alignItems: "center",
    }),
    input: (provided: any) => ({
      ...provided,
      margin: "0px",
    }),
    indicatorsContainer: (provided: any) => ({
      ...provided,
      height: "34px",
    }),
    dropdownIndicator: (provided: any) => ({
      ...provided,
      padding: "4px",
      color: "#5F6656",
      "&:hover": {
        color: "#1A2016",
      },
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      fontSize: "0.75rem",
      backgroundColor: state.isSelected
        ? "#2E7D32"
        : state.isFocused
          ? "#FAFBF6"
          : "#FFFFFF",
      color: state.isSelected ? "#FFFFFF" : "#1A2016",
      cursor: "pointer",
      ":active": {
        backgroundColor: state.isSelected ? "#2E7D32" : "#E2E6D8",
      },
    }),
    menu: (provided: any) => ({
      ...provided,
      borderRadius: "0.75rem",
      overflow: "hidden",
      border: "1px solid #E2E6D8",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
      zIndex: 50,
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: "#1A2016",
      fontWeight: "600",
    }),
  };

  // Dropdown options
  const enterpriseOptions = useMemo(() => {
    return worklist.map((item) => ({
      value: item.enterprise_id,
      label: item.proprietor_name,
    }));
  }, [worklist]);

  const selectedEnterpriseOption = useMemo(() => {
    return enterpriseOptions.find((opt) => opt.value === activeEnterpriseId) || null;
  }, [enterpriseOptions, activeEnterpriseId]);

  const directionOptions = [
    { value: "all", label: "All Directions" },
    { value: "inflow", label: "Inflow (Income)" },
    { value: "outflow", label: "Outflow (Expense)" },
  ];

  const selectedDirectionOption = useMemo(() => {
    return directionOptions.find((opt) => opt.value === directionFilter) || directionOptions[0];
  }, [directionFilter]);

  const tenderOptions = [
    { value: "all", label: "All Tender Modes" },
    { value: "cash", label: t.dash.cashLabel || "Cash" },
    { value: "upi", label: t.dash.upiLabel || "UPI" },
    { value: "wallet", label: t.dash.walletLabel || "Wallet" },
  ];

  const selectedTenderOption = useMemo(() => {
    return tenderOptions.find((opt) => opt.value === tenderFilter) || tenderOptions[0];
  }, [tenderFilter, t]);

  return (
    <div className="w-full flex-1 min-h-0 flex flex-col space-y-4">
      {/* Interactive Audit Filters Panel */}
      <div className="bg-[#FAFBF6] border border-[#E2E6D8] p-3.5 rounded-2xl flex flex-wrap items-center gap-3 shadow-2xs">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#5F6656] uppercase tracking-wider mr-2 shrink-0">
          <Filter className="w-3.5 h-3.5 text-[#2E7D32]" />
          <span>Filters</span>
        </div>

        {/* Enterprise Dropdown Selection (Lists all by name) */}
        <div className="min-w-[180px] flex-1 md:flex-none text-xs">
          <Select
            instanceId="enterprise-select"
            value={selectedEnterpriseOption}
            options={enterpriseOptions}
            onChange={(val) => val && handleEnterpriseChange(val.value)}
            styles={customStyles}
            placeholder="Select Enterprise..."
            isSearchable={true}
          />
        </div>

        {/* Transaction Direction Filter */}
        <div className="min-w-[150px] flex-1 md:flex-none text-xs">
          <Select
            instanceId="direction-select"
            value={selectedDirectionOption}
            options={directionOptions}
            onChange={(val) => val && setDirectionFilter(val.value)}
            styles={customStyles}
            isSearchable={false}
          />
        </div>

        {/* Tender Mode Filter */}
        <div className="min-w-[150px] flex-1 md:flex-none text-xs">
          <Select
            instanceId="tender-select"
            value={selectedTenderOption}
            options={tenderOptions}
            onChange={(val) => val && handleTenderFilterChange(val.value)}
            styles={customStyles}
            isSearchable={false}
          />
        </div>

        {/* Reset Button */}
        {(directionFilter !== "all" || tenderFilter !== "all") && (
          <button
            type="button"
            onClick={resetFilters}
            className="px-3.5 py-2 text-xs font-bold text-[#C62828] hover:bg-[#FFEBEE] rounded-xl transition-all border border-transparent hover:border-[#C62828]/20 cursor-pointer"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Main Content Area */}
      {!activeEnterpriseId ? (
        <div className="bg-white border border-[#E2E6D8] rounded-2xl p-12 text-center text-[#5F6656] text-xs flex flex-col items-center justify-center gap-3 shadow-2xs flex-1">
          <AlertCircle className="w-10 h-10 text-[#E2E6D8]" />
          <h4 className="font-bold text-[#1A2016] text-sm">{t.dash.txnSelectEnterprise}</h4>
        </div>
      ) : loading ? (
        <div className="bg-white border border-[#E2E6D8] rounded-2xl p-16 text-center text-xs text-[#5F6656] shadow-2xs flex flex-col items-center justify-center gap-2 flex-1">
          <Loader2 className="w-8 h-8 text-[#2E7D32] animate-spin" />
          <span>{t.dash.txnLoading || "Loading Transactions Queue..."}</span>
        </div>
      ) : error ? (
        <div className="bg-[#FFEBEE] border border-[#C62828]/20 rounded-2xl p-6 text-xs text-[#C62828] shadow-2xs flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>Failed to load transaction data: {error}</span>
        </div>
      ) : filteredQueue.length === 0 ? (
        <div className="bg-white border border-[#E2E6D8] rounded-2xl p-12 text-center text-[#5F6656] text-xs flex flex-col items-center justify-center gap-3 shadow-2xs flex-1">
          <CheckCircle2 className="w-10 h-10 text-[#E2E6D8]" />
          <h4 className="font-bold text-[#1A2016] text-sm">No transactions match search criteria</h4>
          <p className="text-[10px] max-w-sm leading-normal">
            Try adjusting your direction, tender mode, or keyword filter settings.
          </p>
          {(directionFilter !== "all" || tenderFilter !== "all") && (
            <button
              type="button"
              onClick={resetFilters}
              className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold px-4 py-2 rounded-xl text-xs shadow-xs transition-all cursor-pointer mt-1"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        /* Audit Table View */
        <div className="bg-white border border-[#E2E6D8] rounded-2xl overflow-hidden shadow-2xs flex flex-col flex-1 min-h-0">
          <div className="overflow-x-auto [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:bg-neutral-400/50 hover:[&::-webkit-scrollbar-thumb]:bg-neutral-400/70 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent [scrollbar-width:thin] [scrollbar-color:rgba(163,163,163,0.5)_transparent]">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-[#FAFBF6] border-b border-[#E2E6D8] text-[9.5px] font-bold text-[#5F6656] uppercase tracking-wider">
                  <th className="px-4 py-3.5">Business Name & ID</th>
                  <th className="px-4 py-3.5">Spoken Transcript</th>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5">Tender</th>
                  <th className="px-4 py-3.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E6D8]/60 text-xs text-[#1A2016]">
                {filteredQueue.map((item, idx) => {
                  const itemId = item.entry_id || item.voice_id || `tx-${idx}`;
                  const isInflow = item.direction === "inflow";
                  const dateStr = item.event_date
                    ? item.event_date.split("T")[0]
                    : item.recorded_at
                      ? item.recorded_at.split("T")[0]
                      : "";
                  const tenderVal = String(item.tender || item.channel || "Unknown");
                  const confidencePct = getConfidencePct(item.confidence);

                  return (
                    <tr key={itemId} className="hover:bg-[#FAFBF6]/45 transition-colors">
                      {/* Business Name & ID */}
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-[#1A2016]">
                          {activeEnterpriseName || "Unknown proprietor"}
                        </div>
                        <div className="text-[10px] text-[#5F6656] font-mono mt-0.5">
                          ID: {item.enterprise_id}
                        </div>
                      </td>

                      {/* Transcript */}
                      <td className="px-4 py-3.5 max-w-[280px]">
                        <div className="text-[11.5px] font-serif italic text-[#1A2016] leading-relaxed break-words">
                          {item.transcript ? `"${item.transcript}"` : "-"}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3.5 whitespace-nowrap font-mono text-[10.5px] text-[#5F6656]">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#5F6656]/70" />
                          <span>{dateStr || "—"}</span>
                        </div>
                      </td>



                      {/* Tender Mode */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-[10.5px] font-semibold text-[#5F6656] capitalize">
                        <div className="flex items-center gap-1.5">
                          {getTenderIcon(tenderVal)}
                          <span>{tenderVal}</span>
                        </div>
                      </td>
                      {/* Amount & Direction */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap font-mono font-bold">
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px]">
                          {isInflow ? (
                            <span className="text-[#2E7D32] flex items-center gap-0.5">
                              <TrendingUp className="w-3.5 h-3.5" />
                              <span>+{formatCurrency(Number(item.amount) || 0)}</span>
                            </span>
                          ) : (
                            <span className="text-[#C62828] flex items-center gap-0.5">
                              <TrendingDown className="w-3.5 h-3.5" />
                              <span>-{formatCurrency(Number(item.amount) || 0)}</span>
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
