"use client";

import React, { useEffect, useState } from "react";
import { LatestAlert, OfficerTask, getOfficerTasks, postTaskOutcome } from "@/utils/api-config";
import { Enterprise } from "@/types/enterprise";
import { TranslationDictionary } from "@/utils/translations/dictionary";
import { formatCurrency } from "@/utils/formatters";
import { Send, CheckCircle2, ClipboardCheck, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

interface OfficerVisitOutcomeBarProps {
  enterprise: Enterprise;
  latestAlert?: LatestAlert | null;
  t: TranslationDictionary;
}

export default function OfficerVisitOutcomeBar({
  enterprise,
  latestAlert,
  t,
}: OfficerVisitOutcomeBarProps) {
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [outcome, setOutcome] = useState<"stress_confirmed" | "false_positive" | "unreachable">(
    "stress_confirmed"
  );
  const [intervention, setIntervention] = useState<string>("request_bridge_loan");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedOutcomeId, setSubmittedOutcomeId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // The task has to be fetched, not constructed. task_ids are sequential
  // (TK00004), so the old `TK-${alert_id}` guess never matched a row and every
  // submission came back 400 "unknown task_id".
  const [task, setTask] = useState<OfficerTask | null>(null);
  // The full open queue, not just the head: a bare task id gave no sense of
  // how much was waiting, so closing the last one looked like the form had
  // broken rather than the work being finished.
  const [openTasks, setOpenTasks] = useState<OfficerTask[]>([]);
  const [loadingTask, setLoadingTask] = useState(false);

  const loadTask = React.useCallback(async (entId: string) => {
    setLoadingTask(true);
    try {
      const tasks = await getOfficerTasks({ status: "open", enterprise_id: entId });
      setOpenTasks(tasks);
      const firstTask = tasks.length > 0 ? tasks[0] : null;
      setTask(firstTask);
      if (!firstTask) {
        setIsChecked(false);
      }
    } catch {
      setOpenTasks([]);
      setTask(null);
      setIsChecked(false);
    } finally {
      setLoadingTask(false);
    }
  }, []);

  useEffect(() => {
    if (!enterprise?.id || enterprise.id === "N/A") {
      setTask(null);
      return;
    }
    setTask(null);
    setOpenTasks([]);
    setSubmittedOutcomeId(null);
    setSubmitError(null);
    void loadTask(enterprise.id);
  }, [enterprise?.id, loadTask]);

  const handleSubmitOutcome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await postTaskOutcome({
        task_id: task.task_id,
        outcome,
        intervention,
        note_lang: "gu",
      });
      setSubmittedOutcomeId(res.outcome_id);
      // Re-read the queue: the task just closed, so without this the stale
      // task stayed in state with the button enabled and a second click sent
      // the same task_id again. The backend now rejects that, but the button
      // should not invite it -- and if the enterprise has another open visit,
      // this surfaces it instead of looking finished.
      setTask(null);
      void loadTask(enterprise.id);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to record outcome");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasOpenTasks = !!task || !!submittedOutcomeId;
  const isExpanded = isChecked && hasOpenTasks;

  const toggleDropdown = () => {
    if (!hasOpenTasks) {
      setIsChecked(false);
      return;
    }
    setIsChecked((prev) => !prev);
  };

  return (
    <div className="bg-white border border-[#E2E6D8] rounded-2xl shadow-2xs overflow-hidden transition-all">
      {/* Top Banner / Checkbox Header */}
      <div
        onClick={toggleDropdown}
        className={`p-4 flex items-center justify-between border-b border-[#E2E6D8] select-none transition-all duration-200 ${
          hasOpenTasks
            ? "bg-[#FAFBF6] cursor-pointer hover:bg-[#F2F4EC] active:bg-[#E8EBE0] active:scale-[0.99]"
            : "bg-[#F5F5F5] cursor-not-allowed opacity-60"
        }`}
      >
        <div className="flex items-center gap-3 select-none pointer-events-none">
          <input
            type="checkbox"
            checked={isExpanded}
            disabled={!hasOpenTasks}
            readOnly
            className="w-4 h-4 text-[#2E7D32] bg-white border-[#E2E6D8] rounded focus:ring-[#2E7D32] accent-[#2E7D32] disabled:opacity-50"
          />
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-4.5 h-4.5 text-[#2E7D32]" />
            <span className="text-xs font-bold text-[#1A2016] uppercase tracking-wider">
              Log Officer Field Visit Outcome
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 pointer-events-none">
          {submittedOutcomeId && (
            <span className="bg-[#E8F5E9] border border-[#2E7D32]/30 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold text-[#2E7D32] flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Recorded: {submittedOutcomeId}
            </span>
          )}

          {!hasOpenTasks ? (
            <span className="text-xs font-semibold text-[#5F6656] uppercase tracking-wide bg-[#FAFBF6] px-2 py-0.5 rounded border border-[#E2E6D8]">
              no visit scheduled
            </span>
          ) : (
            <div className="text-[#5F6656] hover:text-[#1A2016] p-1 rounded-lg transition-colors">
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          )}
        </div>
      </div>

      {/* Expandable Form Body */}
      {isExpanded && (
        <div className="p-4.5 bg-white border-t border-[#E2E6D8]/60 space-y-3 animate-in fade-in duration-200">
          {/* Why this visit is on the list. A task is always raised off an
              alert, so the alert's reasons and figures are the task's
              justification -- without them the officer is asked to close a
              bare task id and has to guess what it was for. */}
          {task && (task.alert_reason_1 || task.projected_shortfall) && (
            <div className="bg-[#FAFBF6] border border-[#E2E6D8] rounded-lg p-2.5 space-y-1.5">
              <div className="text-[9.5px] font-bold text-[#5F6656] uppercase tracking-wider">
                Why this visit was raised
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {[task.alert_reason_1, task.alert_reason_2, task.alert_reason_3]
                  .filter(Boolean)
                  .map((r) => (
                    <span
                      key={r as string}
                      className="text-[10px] font-semibold text-[#C62828] bg-[#FFEBEE] border border-[#C62828]/20 px-1.5 py-0.5 rounded-full"
                    >
                      {t.mechanisms?.[r as string] || (r as string).replace(/_/g, " ")}
                    </span>
                  ))}
                {task.alert_risk_tier && (
                  <span className="text-[10px] font-semibold text-[#5F6656] border border-[#E2E6D8] px-1.5 py-0.5 rounded-full">
                    {t.tiers?.[task.alert_risk_tier as "GREEN" | "AMBER" | "RED"] || task.alert_risk_tier}
                  </span>
                )}
              </div>
              <div className="text-[10px] text-[#5F6656] font-mono">
                {task.alert_id ? `Alert ${task.alert_id}` : ""}
                {task.alert_raised_at ? ` raised ${task.alert_raised_at}` : ""}
                {task.projected_shortfall
                  ? ` · shortfall ${formatCurrency(Number(task.projected_shortfall))}`
                  : ""}
                {task.shortfall_week_of ? ` expected week of ${task.shortfall_week_of}` : ""}
                {task.alert_live === false ? " · alert has since expired" : ""}
              </div>
            </div>
          )}

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

            <div className="sm:col-span-3 flex flex-col justify-end gap-1.5">
              {task && (
                <p className="text-[9.5px] text-[#5F6656] text-center font-mono uppercase tracking-wider mb-0.5">
                  Task {task.task_id}
                  {task.assigned_on ? ` · assigned ${task.assigned_on}` : ""}
                  {openTasks.length > 1 ? ` · 1 of ${openTasks.length} open` : ""}
                </p>
              )}
              {/* Disabled without a task rather than submitting and failing:
                  an outcome must attach to a real visit task, so there is
                  nothing to record for an enterprise with none open. */}
              <button
                type="submit"
                disabled={isSubmitting || loadingTask || !task || !!submittedOutcomeId}
                title={!task && !loadingTask ? "No open visit task for this enterprise" : undefined}
                className="w-full bg-[#2E7D32] hover:bg-[#1b4d1f] text-white text-xs font-bold py-2 px-3 rounded-lg transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : loadingTask ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Finding task...</span>
                  </>
                ) : submittedOutcomeId ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Visit Logged</span>
                  </>
                ) : !task ? (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>No open task</span>
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

          {submittedOutcomeId && (
            <div className="text-[11px] text-[#2E7D32] bg-[#E8F5E9] p-3 rounded-lg border border-[#2E7D32]/20 font-medium flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#2E7D32]" />
              <span>Officer field visit outcome has been successfully logged. The merchant risk tier has been updated in real-time.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
