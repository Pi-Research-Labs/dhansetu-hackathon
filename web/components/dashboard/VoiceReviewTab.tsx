"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  getVoiceReviewQueue,
  postVoiceReview,
  VoiceReviewQueueItem,
  PostVoiceReviewPayload,
} from "@/utils/api-config";
import { formatCurrency } from "@/utils/formatters";
import {
  Mic,
  Calendar,
  Globe,
  Loader2,
  CheckCircle2,
  Play,
  Check,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

export default function VoiceReviewTab() {
  const [queue, setQueue] = useState<VoiceReviewQueueItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Selected voice note details
  const [selectedId, setSelectedId] = useState<string>("");
  
  // Form State
  const [reviewedAmount, setReviewedAmount] = useState<string>("");
  const [direction, setDirection] = useState<string>("inflow");
  const [category, setCategory] = useState<string>("milk_sale");
  const [isHousehold, setIsHousehold] = useState<boolean>(false);
  const [tender, setTender] = useState<string>("cash");
  
  // Submission States
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // selectItem callback (defined before useEffect to avoid hoisting issues)
  const selectItem = useCallback((item: VoiceReviewQueueItem) => {
    const id = item.extraction_id || item.voice_id || "";
    setSelectedId(id);
    setReviewedAmount(item.amount ? String(item.amount) : "");
    setDirection(item.direction || "inflow");
    setCategory("milk_sale");
    setIsHousehold(false);
    setTender("cash");
    setSuccessMsg(null);
  }, []);

  // Load review queue on mount
  useEffect(() => {
    let isMounted = true;
    getVoiceReviewQueue()
      .then((data) => {
        if (!isMounted) return;
        const activeQueue = (data || []).filter((item) => item.needs_review !== false);
        setQueue(activeQueue);
        if (activeQueue.length > 0) {
          selectItem(activeQueue[0]);
        } else {
          setSelectedId("");
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to load voice review queue");
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectItem]);

  const selectedItem = queue.find(
    (item) => (item.extraction_id || item.voice_id) === selectedId
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    const extractionId = selectedItem.extraction_id || selectedItem.voice_id;
    if (!extractionId) return;

    setSubmitting(true);
    setSuccessMsg(null);

    const payload: PostVoiceReviewPayload = {
      reviewed_amount: parseFloat(reviewedAmount) || 0,
      direction,
      category,
      is_household: isHousehold,
      tender,
    };

    try {
      await postVoiceReview(extractionId, payload);
      setSuccessMsg("Transaction committed successfully to ledger!");
      
      // Remove item from queue list
      const updatedQueue = queue.filter(
        (item) => (item.extraction_id || item.voice_id) !== selectedId
      );
      setQueue(updatedQueue);
      
      // Auto-select next item
      if (updatedQueue.length > 0) {
        setTimeout(() => {
          selectItem(updatedQueue[0]);
        }, 1200);
      } else {
        setSelectedId("");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to post voice review");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex-1 flex flex-col items-center justify-center bg-white border border-[#E2E6D8] rounded-2xl shadow-2xs p-12 text-center text-xs text-[#5F6656] gap-3">
        <Loader2 className="w-8 h-8 text-[#2E7D32] animate-spin" />
        <div>
          <h4 className="text-xs font-bold text-[#1A2016] uppercase tracking-wider">
            Loading Spoken Ledger Voice Notes...
          </h4>
          <p className="text-[10px] text-[#5F6656] mt-1 font-mono">
            Calling Sarvam AI extraction pipeline queue
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-5 overflow-visible lg:overflow-hidden">
      {/* Left panel: Queue list (Master) */}
      <div className="lg:col-span-5 flex flex-col lg:h-full min-h-0 overflow-visible lg:overflow-hidden space-y-3 shrink-0">
        <div className="bg-[#FAFBF6] border border-[#E2E6D8] px-3.5 py-2 rounded-xl flex items-center justify-between shrink-0">
          <div className="text-xs font-bold text-[#1A2016] flex items-center gap-1.5 uppercase tracking-wider">
            <Mic className="w-4 h-4 text-[#2E7D32]" />
            <span>Voice Review Queue</span>
          </div>
          <span className="font-mono text-[10px] font-bold bg-[#E2E6D8]/60 text-[#1A2016] px-2 py-0.5 rounded-full">
            {queue.length} Pending
          </span>
        </div>

        {error && (
          <div className="bg-[#FFEBEE] border border-[#C62828]/30 px-3.5 py-2 rounded-xl text-[10px] font-mono font-bold text-[#C62828]">
            Error: {error}
          </div>
        )}

        {queue.length === 0 ? (
          <div className="flex-1 bg-white border border-[#E2E6D8] rounded-xl flex flex-col items-center justify-center p-6 text-center text-xs text-[#5F6656] space-y-1.5 shadow-3xs">
            <CheckCircle2 className="w-8 h-8 text-[#2E7D32]" />
            <h4 className="font-bold text-[#1A2016]">Queue Fully Cleared!</h4>
            <p className="text-[10px] leading-tight">
              All merchant spoken IVR and app voice notes have been reviewed and posted.
            </p>
          </div>
        ) : (
          <div className="max-h-[40vh] lg:max-h-none lg:flex-1 min-h-0 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-[#2E7D32]/15 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent [scrollbar-width:thin] space-y-2">
            {queue.map((item) => {
              const itemId = item.extraction_id || item.voice_id || "";
              const isActive = itemId === selectedId;
              const hasAmount = item.amount !== null && item.amount !== undefined;
              const dateStr = item.spoken_at ? item.spoken_at.split("T")[0] : "";

              return (
                <button
                  key={itemId}
                  onClick={() => selectItem(item)}
                  className={`w-full text-left bg-white border p-3 rounded-xl transition-all cursor-pointer shadow-3xs flex items-center justify-between gap-3 ${
                    isActive
                      ? "border-[#2E7D32] ring-1 ring-[#2E7D32]"
                      : "border-[#E2E6D8] hover:border-[#2E7D32]/40"
                  }`}
                >
                  <div className="min-w-0 space-y-1">
                    <div className="text-[11px] font-bold text-[#1A2016] truncate">
                      {item.proprietor_name || `Merchant ID: ${item.enterprise_id}`}
                    </div>
                    <div className="text-[10px] text-[#5F6656] truncate italic font-serif">
                      &quot;{item.transcript}&quot;
                    </div>
                    <div className="flex items-center gap-2 text-[9px] font-mono text-[#757575] pt-0.5">
                      <span className="flex items-center gap-0.5">
                        <Calendar className="w-2.5 h-2.5" /> {dateStr}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-0.5">
                        <Globe className="w-2.5 h-2.5" /> {item.detected_lang || "unknown"}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    {hasAmount ? (
                      <div
                        className={`text-xs font-mono font-bold flex items-center gap-0.5 ${
                          item.direction === "inflow" ? "text-[#2E7D32]" : "text-[#C62828]"
                        }`}
                      >
                        {item.direction === "inflow" ? "+" : "-"}
                        {formatCurrency(item.amount || 0)}
                      </div>
                    ) : (
                      <span className="text-[9.5px] font-mono bg-amber-50 border border-amber-200 text-amber-700 px-1.5 py-0.5 rounded">
                        No extraction
                      </span>
                    )}
                    <span className="text-[8.5px] font-mono text-[#9E9E9E] block mt-0.5">
                      Conf: {Math.round((item.confidence || 0) * 100)}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Right panel: Detail Review Form (Detail) */}
      <div className="lg:col-span-7 lg:h-full min-h-0 overflow-visible lg:overflow-y-auto pr-1 lg:[&::-webkit-scrollbar]:w-1.5 lg:[&::-webkit-scrollbar-thumb]:bg-[#2E7D32]/15 lg:[&::-webkit-scrollbar-thumb]:rounded-full lg:[&::-webkit-scrollbar-track]:bg-transparent lg:[scrollbar-width:thin] space-y-4">
        {!selectedItem ? (
          <div className="bg-white border border-[#E2E6D8] p-12 rounded-2xl text-center text-[#5F6656] text-xs h-full flex flex-col items-center justify-center gap-2 shadow-3xs">
            <Mic className="w-8 h-8 text-[#E2E6D8]" />
            <h4 className="font-bold text-[#1A2016]">No voice note selected</h4>
            <p className="text-[10px] max-w-sm">
              Please pick a recorded entry from the pending list on the left to verify and commit to ledger.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-[#E2E6D8] p-5 rounded-2xl shadow-3xs space-y-4">
            <div className="border-b border-[#E2E6D8] pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-[#1A2016] uppercase tracking-wider">
                  Review & Verification Panel
                </h3>
                <p className="text-[10px] text-[#5F6656] font-mono mt-0.5">
                  Confirm Spoken Transaction for <strong>{selectedItem.proprietor_name || selectedItem.enterprise_id}</strong>
                </p>
              </div>
            </div>

            {/* Audio Transcript & Details Card */}
            <div className="bg-[#FAFBF6] border border-[#E2E6D8] p-3.5 rounded-xl space-y-3 relative overflow-hidden">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#E8F5E9] border border-[#2E7D32]/20 flex items-center justify-center shrink-0">
                  <Play className="w-3.5 h-3.5 text-[#2E7D32]" />
                </div>
                <div className="space-y-1 flex-1 min-w-0">
                  <span className="text-[9px] font-bold text-[#2E7D32] uppercase tracking-wider block">Spoken Transcript</span>
                  <p className="text-sm font-serif italic font-medium text-[#1A2016] leading-snug break-words">
                    &quot;{selectedItem.transcript}&quot;
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[10px] font-mono border-t border-[#E2E6D8]/60 pt-3">
                <div>
                  <span className="text-[#757575] block">Detected Language:</span>
                  <strong className="text-[#1A2016]">{selectedItem.detected_lang || "unknown"}</strong>
                </div>
                <div>
                  <span className="text-[#757575] block">Confidence:</span>
                  <strong className="text-[#1A2016]">{Math.round((selectedItem.confidence || 0) * 100)}%</strong>
                </div>
              </div>
            </div>

            {/* Verification Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Reviewed Amount */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#5F6656] uppercase tracking-wider block">
                    Reviewed Amount (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={reviewedAmount}
                    onChange={(e) => setReviewedAmount(e.target.value)}
                    placeholder="Enter confirmed amount"
                    className="w-full bg-[#FAFBF6] border border-[#E2E6D8] rounded-lg p-2 text-xs text-[#1A2016] focus:outline-none focus:ring-1 focus:ring-[#2E7D32] font-mono font-bold"
                  />
                </div>

                {/* Category selection */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#5F6656] uppercase tracking-wider block">
                    Category Type
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#FAFBF6] border border-[#E2E6D8] rounded-lg p-2 text-xs text-[#1A2016] focus:outline-none cursor-pointer"
                  >
                    <option value="milk_sale">Milk Sale (Dairy)</option>
                    <option value="feed_purchase">Feed / Fodder Purchase</option>
                    <option value="store_sale">Retail Store Sale</option>
                    <option value="groceries">Groceries / Consumables</option>
                    <option value="vendor_payment">Vendor Payment</option>
                    <option value="loan_repayment">Loan Repayment</option>
                    <option value="other">Other Transaction</option>
                  </select>
                </div>
              </div>

              {/* Direction selector */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#5F6656] uppercase tracking-wider block">
                  Direction
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDirection("inflow")}
                    className={`p-2 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      direction === "inflow"
                        ? "bg-[#E8F5E9] border-[#2E7D32] text-[#2E7D32]"
                        : "bg-[#FAFBF6] border-[#E2E6D8] text-[#5F6656] hover:bg-[#FAFBF6]"
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Inflow (Income)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDirection("outflow")}
                    className={`p-2 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      direction === "outflow"
                        ? "bg-[#FFEBEE] border-[#C62828] text-[#C62828]"
                        : "bg-[#FAFBF6] border-[#E2E6D8] text-[#5F6656] hover:bg-[#FAFBF6]"
                    }`}
                  >
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>Outflow (Expense)</span>
                  </button>
                </div>
              </div>

              {/* Tender selector */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#5F6656] uppercase tracking-wider block">
                  Tender Mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["cash", "upi", "wallet"].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setTender(mode)}
                      className={`p-1.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer capitalize text-center ${
                        tender === mode
                          ? "bg-[#E8F5E9] border-[#2E7D32] text-[#2E7D32]"
                          : "bg-[#FAFBF6] border-[#E2E6D8] text-[#5F6656]"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Household checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="household"
                  checked={isHousehold}
                  onChange={(e) => setIsHousehold(e.target.checked)}
                  className="rounded border-[#E2E6D8] text-[#2E7D32] focus:ring-[#2E7D32] w-4 h-4 cursor-pointer"
                />
                <label htmlFor="household" className="text-xs text-[#5F6656] select-none cursor-pointer">
                  Household / Personal (Not related to Business Operations)
                </label>
              </div>

              {/* Status or Submission Message */}
              {successMsg && (
                <div className="bg-[#E8F5E9] border border-[#2E7D32]/30 p-2.5 rounded-lg text-[10.5px] font-bold text-[#2E7D32] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#2E7D32] hover:bg-[#1B5E20] disabled:bg-[#FAFBF6] text-white disabled:text-[#9E9E9E] border border-transparent disabled:border-[#E2E6D8] py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Verifying & Posting Entry...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Confirm & Post Entry</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
