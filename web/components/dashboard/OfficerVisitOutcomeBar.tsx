"use client";

import React, { useState } from "react";
import { LatestAlert, postTaskOutcome } from "@/utils/api-config";
import { Enterprise } from "@/utils/mockData";
import { Send, CheckCircle2, ClipboardCheck, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

interface OfficerVisitOutcomeBarProps {
  enterprise: Enterprise;
  latestAlert?: LatestAlert | null;
}

export default function OfficerVisitOutcomeBar({
  enterprise,
  latestAlert,
}: OfficerVisitOutcomeBarProps) {
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [outcome, setOutcome] = useState<"stress_confirmed" | "false_positive" | "unreachable">(
    "stress_confirmed"
  );
  const [intervention, setIntervention] = useState<string>("request_bridge_loan");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedOutcomeId, setSubmittedOutcomeId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmitOutcome = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    const taskId = latestAlert?.alert_id ? `TK-${latestAlert.alert_id}` : `TK-${enterprise.id}`;

    try {
      const res = await postTaskOutcome({
        task_id: taskId,
        outcome,
        intervention,
        note_lang: "gu",
      });
      setSubmittedOutcomeId(res.outcome_id);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to record outcome");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-[#E2E6D8] rounded-2xl shadow-2xs overflow-hidden transition-all">
      {/* Top Banner / Checkbox Header */}
      <div className="p-4 flex items-center justify-between bg-[#FAFBF6] border-b border-[#E2E6D8]">
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={(e) => setIsChecked(e.target.checked)}
            className="w-4 h-4 text-[#2E7D32] bg-white border-[#E2E6D8] rounded focus:ring-[#2E7D32] accent-[#2E7D32] cursor-pointer"
          />
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-4.5 h-4.5 text-[#2E7D32]" />
            <span className="text-xs font-bold text-[#1A2016] uppercase tracking-wider">
              Log Officer Field Visit Outcome
            </span>
          </div>
        </label>

        <div className="flex items-center gap-3">
          {submittedOutcomeId && (
            <span className="bg-[#E8F5E9] border border-[#2E7D32]/30 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold text-[#2E7D32] flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Recorded: {submittedOutcomeId}
            </span>
          )}

          <button
            type="button"
            onClick={() => setIsChecked(!isChecked)}
            className="text-[#5F6656] hover:text-[#1A2016] p-1 rounded-lg transition-colors cursor-pointer"
          >
            {isChecked ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Form Body */}
      {isChecked && (
        <div className="p-4.5 bg-white border-t border-[#E2E6D8]/60 space-y-3 animate-in fade-in duration-200">
          <p className="text-[11px] text-[#5F6656]">
            Record field visit findings for <strong>{enterprise.name}</strong> ({enterprise.id}). This outcome updates backend risk models in real-time.
          </p>

          <form onSubmit={handleSubmitOutcome} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-5 space-y-1">
              <label className="text-[10px] font-bold text-[#5F6656] uppercase">Visit Outcome</label>
              <select
                value={outcome}
                onChange={(e) => setOutcome(e.target.value as "stress_confirmed" | "false_positive" | "unreachable")}
                className="w-full bg-[#FAFBF6] border border-[#E2E6D8] text-xs text-[#1A2016] rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-[#2E7D32]"
              >
                <option value="stress_confirmed">stress_confirmed (Stress Verified)</option>
                <option value="false_positive">false_positive (False Alarm)</option>
                <option value="unreachable">unreachable (Merchant Unreachable)</option>
              </select>
            </div>

            <div className="sm:col-span-4 space-y-1">
              <label className="text-[10px] font-bold text-[#5F6656] uppercase">Recommended Action</label>
              <select
                value={intervention}
                onChange={(e) => setIntervention(e.target.value)}
                className="w-full bg-[#FAFBF6] border border-[#E2E6D8] text-xs text-[#1A2016] rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-[#2E7D32]"
              >
                <option value="request_bridge_loan">request_bridge_loan (Bridge Loan Support)</option>
                <option value="prebook_input">prebook_input (Input Prebooking)</option>
                <option value="restructure_emi">restructure_emi (EMI Restructuring)</option>
                <option value="no_action">no_action (No Action Required)</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#2E7D32] hover:bg-[#1b4d1f] text-white text-xs font-bold py-2 px-3 rounded-lg transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Outcome</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {submitError && (
            <div className="text-[11px] text-[#C62828] bg-[#FFEBEE] p-2 rounded-lg border border-[#C62828]/20 font-mono">
              {submitError}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
