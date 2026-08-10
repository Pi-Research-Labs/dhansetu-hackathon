"use client";

import React from "react";
import { ReceivableItem } from "@/utils/api-config";
import { formatCurrency } from "@/utils/formatters";
import { TranslationDictionary } from "@/utils/translations/dictionary";
import { Receipt, AlertCircle, CheckCircle2, Clock, Info } from "lucide-react";

interface ReceivablesCardProps {
  items: ReceivableItem[];
  isLoading?: boolean;
  t?: TranslationDictionary;
}

export default function ReceivablesCard({ items, isLoading = false, t }: ReceivablesCardProps) {
  const tReceivables = t?.dash;

  if (isLoading) {
    return (
      <div className="bg-white border border-[#E2E6D8] p-5 rounded-2xl shadow-2xs text-center text-xs text-[#5F6656]">
        {tReceivables?.loadingReceivables || "Loading Udhaar Book (Receivables)..."}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white border border-[#E2E6D8] p-4.5 rounded-2xl shadow-2xs">
        <div className="flex items-center gap-2 mb-2">
          <Receipt className="w-4 h-4 text-[#2E7D32]" />
          <h3 className="text-xs font-bold text-[#1A2016] uppercase tracking-wider">
            {tReceivables?.receivablesTitle ? tReceivables.receivablesTitle.split("&")[0].trim() : "Udhaar Book"}
          </h3>
          <span className="group relative cursor-help flex items-center">
            <Info className="w-3.5 h-3.5 text-[#5F6656] shrink-0" />
            <span className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-64 p-2 bg-[#1A2016] text-white text-[10px] font-sans font-normal normal-case tracking-normal leading-normal rounded-lg shadow-lg z-50 text-left">
              {tReceivables?.receivablesTooltip ||
                "The udhaar book: money buyers still owe this business. Grouped by who owes it, showing how much is still unpaid, how much has been given up as bad debt, and how many days payment usually takes to arrive."}
              <span className="absolute top-full left-3 border-[5px] border-transparent border-t-[#1A2016]"></span>
            </span>
          </span>
        </div>
        <div className="text-xs text-[#5F6656] p-3 bg-[#FAFBF6] rounded-xl border border-[#E2E6D8] text-center flex items-center justify-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
          <span>{tReceivables?.noReceivables || "No recorded receivables or bad debts for this enterprise."}</span>
        </div>
      </div>
    );
  }

  // Calculate totals
  const totalReceivables = items.reduce((acc, curr) => acc + (curr.total || 0), 0);
  const totalOutstanding = items.reduce((acc, curr) => acc + (curr.outstanding || 0), 0);
  const totalWrittenOff = items.reduce((acc, curr) => acc + (curr.written_off || 0), 0);
  const maxWriteOffPct = Math.max(...items.map((i) => i.write_off_pct || 0));

  return (
    <div className="bg-white border border-[#E2E6D8] p-5 rounded-2xl shadow-2xs space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E6D8] pb-3">
        <div className="flex items-center gap-2">
          <Receipt className="w-4 h-4 text-[#2E7D32]" />
          <h3 className="text-xs font-bold text-[#1A2016] uppercase tracking-wider">
            {tReceivables?.receivablesTitle || "Udhaar Book & Receivables Ageing"}
          </h3>
          <span className="group relative cursor-help flex items-center">
            <Info className="w-3.5 h-3.5 text-[#5F6656] shrink-0" />
            <span className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-64 p-2 bg-[#1A2016] text-white text-[10px] font-sans font-normal normal-case tracking-normal leading-normal rounded-lg shadow-lg z-50 text-left">
              {tReceivables?.receivablesTooltip ||
                "The udhaar book: money buyers still owe this business. Grouped by who owes it, showing how much is still unpaid, how much has been given up as bad debt, and how many days payment usually takes to arrive."}
              <span className="absolute top-full left-3 border-[5px] border-transparent border-t-[#1A2016]"></span>
            </span>
          </span>
        </div>

        {maxWriteOffPct > 10 && (
          <div className="bg-[#FFEBEE] border border-[#C62828]/30 px-2.5 py-1 rounded-lg text-[10.5px] font-bold text-[#C62828] flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>
              {tReceivables?.highWriteOffBleed
                ? tReceivables.highWriteOffBleed(maxWriteOffPct)
                : `High Write-Off Bleed Detected (${maxWriteOffPct}%)`}
            </span>
          </div>
        )}
      </div>

      {/* Overview stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
        <div className="bg-[#FAFBF6] p-2 rounded-lg border border-[#E2E6D8]">
          <div className="text-[10px] text-[#5F6656] truncate">
            {tReceivables?.totalBookValue || "Total Book Value"}
          </div>
          <div className="font-mono font-bold text-[#1A2016] mt-0.5">
            {formatCurrency(totalReceivables)}
          </div>
        </div>
        <div className="bg-[#FAFBF6] p-2 rounded-lg border border-[#E2E6D8]">
          <div className="text-[10px] text-[#5F6656] truncate">
            {tReceivables?.outstandingBookValue || "Outstanding Book Value"}
          </div>
          <div className="font-mono font-bold text-[#E65100] mt-0.5">
            {formatCurrency(totalOutstanding)}
          </div>
        </div>
        <div className="bg-[#FAFBF6] p-2 rounded-lg border border-[#E2E6D8]">
          <div className="text-[10px] text-[#5F6656] truncate">
            {tReceivables?.writtenOff || "Written Off"}
          </div>
          <div className="font-mono font-bold text-[#C62828] mt-0.5">
            {formatCurrency(totalWrittenOff)}
          </div>
        </div>
        <div className="bg-[#FAFBF6] p-2 rounded-lg border border-[#E2E6D8]">
          <div className="text-[10px] text-[#5F6656] truncate">
            {tReceivables?.writeOffRatio || "Write-Off Ratio"}
          </div>
          <div className="font-mono font-bold text-[#C62828] mt-0.5">
            {maxWriteOffPct}%
          </div>
        </div>
      </div>

      {/* Receivables Breakdown Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-[11px]">
          <thead>
            <tr className="bg-[#FAFBF6] border-y border-[#E2E6D8] text-[#5F6656] font-semibold">
              <th className="py-2 px-2.5">{tReceivables?.colCounterparty || "Counterparty Type"}</th>
              <th className="py-2 px-2.5">{tReceivables?.colInvoices || "Invoices"}</th>
              <th className="py-2 px-2.5">{tReceivables?.colTotal || "Total Amount"}</th>
              <th className="py-2 px-2.5">{tReceivables?.colOutstanding || "Outstanding"}</th>
              <th className="py-2 px-2.5">{tReceivables?.colWrittenOff || "Written Off"}</th>
              <th className="py-2 px-2.5">{tReceivables?.colAvgDays || "Avg Days to Cash"}</th>
              <th className="py-2 px-2.5">{tReceivables?.colWorstDelay || "Worst Delay"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E6D8]/60 font-mono">
            {items.map((row, idx) => (
              <tr key={idx} className="hover:bg-[#FAFBF6]">
                <td className="py-2 px-2.5 font-sans font-medium text-[#1A2016] capitalize">
                  {t?.counterpartyTypes?.[row.counterparty_type] || row.counterparty_type.replace(/_/g, " ")}
                </td>
                <td className="py-2 px-2.5 text-[#5F6656]">{row.invoices}</td>
                <td className="py-2 px-2.5 font-bold text-[#1A2016]">
                  {formatCurrency(row.total)}
                </td>
                <td className="py-2 px-2.5 font-bold text-[#E65100]">
                  {row.outstanding !== null && row.outstanding !== undefined ? formatCurrency(row.outstanding) : "-"}
                </td>
                <td className="py-2 px-2.5 font-bold text-[#C62828]">
                  {formatCurrency(row.written_off)} ({row.write_off_pct}%)
                </td>
                <td className="py-2 px-2.5 text-[#5F6656] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#E65100]" />
                  {row.avg_days_to_cash}d
                </td>
                <td className="py-2 px-2.5 font-bold text-[#C62828]">
                  {row.worst_days_to_cash}d
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
