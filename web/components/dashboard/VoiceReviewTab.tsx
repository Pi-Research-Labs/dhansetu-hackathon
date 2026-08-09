"use client";

import React, { useState, useEffect, useMemo } from "react";
import { getVoiceReviewQueue, VoiceReviewQueueItem } from "@/utils/api-config";
import { formatCurrency } from "@/utils/formatters";
import {
  Calendar,
  Globe,
  Coins,
  TrendingUp,
  TrendingDown,
  Search,
  Loader2,
  Filter,
  CheckCircle2,
  Smartphone,
  CreditCard,
  AlertCircle,
} from "lucide-react";

interface VoiceReviewTabProps {
  initialTenderFilter?: string;
  onTenderFilterChange?: (filter: string) => void;
}

export default function VoiceReviewTab({
  initialTenderFilter = "all",
  onTenderFilterChange,
}: VoiceReviewTabProps) {
  const [queue, setQueue] = useState<VoiceReviewQueueItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [directionFilter, setDirectionFilter] = useState<string>("all");
  const [tenderFilter, setTenderFilter] = useState<string>(initialTenderFilter);
  const [prevInitialFilter, setPrevInitialFilter] = useState<string>(initialTenderFilter);

  // Sync state if initialTenderFilter changes from parent (during render-phase)
  if (initialTenderFilter !== prevInitialFilter) {
    setTenderFilter(initialTenderFilter);
    setPrevInitialFilter(initialTenderFilter);
  }

  const handleTenderFilterChange = (val: string) => {
    setTenderFilter(val);
    if (onTenderFilterChange) {
      onTenderFilterChange(val);
    }
  };

  // Load transactions queue on mount
  useEffect(() => {
    let isMounted = true;
    getVoiceReviewQueue()
      .then((data) => {
        if (!isMounted) return;
        setQueue(data || []);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to load paid transactions");
        setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Filtered Queue
  const filteredQueue = useMemo(() => {
    return queue.filter((item) => {
      // 1. Business Name / Proprietor Name / ID search
      const bizName = (item.proprietor_name || "").toLowerCase();
      const entId = (item.enterprise_id || "").toLowerCase();
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        searchQuery === "" || bizName.includes(q) || entId.includes(q);

      // 2. Direction filter
      const matchesDirection =
        directionFilter === "all" || item.direction === directionFilter;

      // 3. Tender mode filter (checks both tender and channel fields)
      const itemTender = String(item.tender || item.channel || "").toLowerCase();
      const matchesTender =
        tenderFilter === "all" || itemTender === tenderFilter;

      return matchesSearch && matchesDirection && matchesTender;
    });
  }, [queue, searchQuery, directionFilter, tenderFilter]);

  // Clean filters helper
  const resetFilters = () => {
    setSearchQuery("");
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

  return (
    <div className="w-full flex-1 min-h-0 flex flex-col space-y-4">
      {/* Interactive Audit Filters Panel */}
      <div className="bg-[#FAFBF6] border border-[#E2E6D8] p-3.5 rounded-2xl flex flex-wrap items-center gap-3 shadow-2xs">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#5F6656] uppercase tracking-wider mr-2 shrink-0">
          <Filter className="w-3.5 h-3.5 text-[#2E7D32]" />
          <span>Filters</span>
        </div>

        {/* Business Name Filter */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#5F6656]/60" />
          <input
            type="text"
            placeholder="Filter by Business Name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-[#E2E6D8] rounded-xl pl-9 pr-3 py-2 text-xs text-[#1A2016] placeholder-[#5F6656]/50 focus:outline-none focus:ring-1 focus:ring-[#2E7D32] transition-all shadow-2xs"
          />
        </div>

        {/* Transaction Direction Filter */}
        <div className="min-w-[160px] flex-1 md:flex-none">
          <select
            value={directionFilter}
            onChange={(e) => setDirectionFilter(e.target.value)}
            className="w-full bg-white border border-[#E2E6D8] rounded-xl px-3 py-2 text-xs text-[#1A2016] focus:outline-none cursor-pointer shadow-2xs transition-all"
          >
            <option value="all">All Directions</option>
            <option value="inflow">Inflow (Income)</option>
            <option value="outflow">Outflow (Expense)</option>
          </select>
        </div>

        {/* Tender Mode Filter */}
        <div className="min-w-[160px] flex-1 md:flex-none">
          <select
            value={tenderFilter}
            onChange={(e) => handleTenderFilterChange(e.target.value)}
            className="w-full bg-white border border-[#E2E6D8] rounded-xl px-3 py-2 text-xs text-[#1A2016] focus:outline-none cursor-pointer shadow-2xs transition-all"
          >
            <option value="all">All Tender Modes</option>
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
            <option value="wallet">Wallet</option>
          </select>
        </div>

        {/* Reset Button */}
        {(searchQuery !== "" || directionFilter !== "all" || tenderFilter !== "all") && (
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
      {loading ? (
        <div className="bg-white border border-[#E2E6D8] rounded-2xl p-16 text-center text-xs text-[#5F6656] shadow-2xs flex flex-col items-center justify-center gap-2 flex-1">
          <Loader2 className="w-8 h-8 text-[#2E7D32] animate-spin" />
          <span>Loading Transactions Queue...</span>
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
          {(searchQuery !== "" || directionFilter !== "all" || tenderFilter !== "all") && (
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
                  <th className="px-4 py-3">Business Name & ID</th>
                  <th className="px-4 py-3">Spoken Transcript</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Lang</th>
                  <th className="px-4 py-3">Tender</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-center">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E6D8]/60 text-xs text-[#1A2016]">
                {filteredQueue.map((item, idx) => {
                  const itemId = item.extraction_id || item.voice_id || `tx-${idx}`;
                  const isInflow = item.direction === "inflow";
                  const dateStr = item.spoken_at ? item.spoken_at.split("T")[0] : "";
                  const tenderVal = String(item.tender || item.channel || "Unknown");
                  const confidencePct = Math.round((item.confidence || 0) * 100);

                  return (
                    <tr key={itemId} className="hover:bg-[#FAFBF6]/45 transition-colors">
                      {/* Business Name & ID */}
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-[#1A2016]">
                          {item.proprietor_name || "Unknown proprietor"}
                        </div>
                        <div className="text-[10px] text-[#5F6656] font-mono mt-0.5">
                          ID: {item.enterprise_id}
                        </div>
                      </td>

                      {/* Transcript */}
                      <td className="px-4 py-3.5 max-w-[280px]">
                        <div className="text-[11.5px] font-serif italic text-[#1A2016] leading-relaxed break-words">
                          &quot;{item.transcript || "No transcript available"}&quot;
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3.5 whitespace-nowrap font-mono text-[10.5px] text-[#5F6656]">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#5F6656]/70" />
                          <span>{dateStr || "—"}</span>
                        </div>
                      </td>

                      {/* Language */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-[10.5px] font-medium text-[#5F6656]">
                        <div className="flex items-center gap-1 uppercase">
                          <Globe className="w-3.5 h-3.5 text-[#5F6656]/70" />
                          <span>{item.detected_lang || "—"}</span>
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
                              <span>+{formatCurrency(item.amount || 0)}</span>
                            </span>
                          ) : (
                            <span className="text-[#C62828] flex items-center gap-0.5">
                              <TrendingDown className="w-3.5 h-3.5" />
                              <span>-{formatCurrency(item.amount || 0)}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Confidence */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-center">
                        <div className="inline-flex flex-col items-center justify-center">
                          <span className="font-mono font-bold text-[10.5px] text-[#1A2016]">
                            {confidencePct}%
                          </span>
                          {/* Small visual bar */}
                          <div className="w-16 bg-[#E2E6D8] h-1.5 rounded-full overflow-hidden mt-1">
                            <div
                              className={`h-full rounded-full ${confidencePct >= 80
                                  ? "bg-[#2E7D32]"
                                  : confidencePct >= 50
                                    ? "bg-[#E65100]"
                                    : "bg-[#C62828]"
                                }`}
                              style={{ width: `${confidencePct}%` }}
                            />
                          </div>
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
