"use client";

import { useEffect, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Mic, Receipt } from "lucide-react";
import { getTransactions, LedgerTransaction } from "@/utils/api-config";
import { TranslationDictionary } from "@/utils/translations/dictionary";
import { formatCurrency } from "@/utils/formatters";

interface TransactionsTabProps {
  enterpriseId?: string | null;
  enterpriseName?: string | null;
  initialTenderFilter?: string;
  onTenderFilterChange?: (filter: string) => void;
  t: TranslationDictionary;
}

const PAGE_SIZE = 50;

// Matches the swatches the payment-mix card uses for the same tenders, so a
// click on that legend lands on rows tinted the colour that was clicked.
const TENDER_COLOR: Record<string, string> = {
  upi: "#2E7D32",
  wallet: "#1565C0",
  cash: "#E65100",
  bank: "#5F6656",
  credit: "#6A1B9A",
};

export default function TransactionsTab({
  enterpriseId,
  enterpriseName,
  initialTenderFilter = "all",
  onTenderFilterChange,
  t,
}: TransactionsTabProps) {
  const [rows, setRows] = useState<LedgerTransaction[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tender, setTender] = useState(initialTenderFilter);
  const [prevInitial, setPrevInitial] = useState(initialTenderFilter);

  // Adopt a filter chosen elsewhere (the payment-mix legend) without an
  // effect, the same render-phase sync the old queue tab used.
  if (initialTenderFilter !== prevInitial) {
    setTender(initialTenderFilter);
    setPrevInitial(initialTenderFilter);
  }

  const selectTender = (val: string) => {
    setTender(val);
    onTenderFilterChange?.(val);
  };

  useEffect(() => {
    if (!enterpriseId) {
      setRows([]);
      setTotal(0);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    getTransactions(enterpriseId, { limit: PAGE_SIZE, tender })
      .then((page) => {
        if (cancelled) return;
        setRows(page.transactions);
        setTotal(page.total);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : String(e));
        setRows([]);
        setTotal(0);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    // Re-fetch on tender rather than filtering in place: `total` and paging
    // have to describe the filtered set, not the page in hand.
    return () => {
      cancelled = true;
    };
  }, [enterpriseId, tender]);

  const tenderPills = [
    { key: "all", label: t.dash.txnAll },
    { key: "upi", label: t.dash.upiLabel },
    { key: "wallet", label: t.dash.walletLabel },
    { key: "cash", label: t.dash.cashLabel },
  ];

  return (
    <div className="bg-white border border-[#E2E6D8] rounded-2xl shadow-2xs flex flex-col min-h-0 flex-1 overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border-b border-[#E2E6D8] p-4 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Receipt className="w-4 h-4 text-[#2E7D32] shrink-0" />
          <h3 className="text-xs font-bold text-[#1A2016] uppercase tracking-wider truncate">
            {t.dash.transactionsTitle}
          </h3>
          {enterpriseName && (
            <span className="text-[10.5px] text-[#5F6656] truncate hidden sm:inline">· {enterpriseName}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {tenderPills.map((p) => {
            const active = tender === p.key;
            const color = TENDER_COLOR[p.key] ?? "#1A2016";
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => selectTender(p.key)}
                className="px-2 py-0.5 rounded border text-[10px] font-semibold cursor-pointer transition-all"
                style={{
                  borderColor: active ? color : "#E2E6D8",
                  backgroundColor: active ? `${color}14` : "#FFFFFF",
                  color: active ? color : "#5F6656",
                }}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {!enterpriseId ? (
          <div className="p-8 text-center text-[11px] text-[#5F6656]">{t.dash.txnSelectEnterprise}</div>
        ) : loading ? (
          <div className="p-8 text-center text-[11px] text-[#5F6656]">{t.dash.txnLoading}</div>
        ) : error ? (
          <div className="p-8 text-center text-[11px] text-[#C62828]">{error}</div>
        ) : rows.length === 0 ? (
          // The panel's simulated history has no itemised rows behind it, so
          // an enterprise nobody has recorded against is genuinely empty here
          // rather than failing -- say so, instead of showing a blank box.
          <div className="p-8 text-center space-y-1">
            <div className="text-[11px] font-semibold text-[#1A2016]">{t.dash.txnEmptyTitle}</div>
            <div className="text-[10.5px] text-[#5F6656]">{t.dash.txnEmptyHint}</div>
          </div>
        ) : (
          <ul className="divide-y divide-[#E2E6D8]">
            {rows.map((r) => {
              const isIn = r.direction === "inflow";
              const color = isIn ? "#2E7D32" : "#C62828";
              const tenderKey = (r.tender || "").toLowerCase();
              return (
                <li key={r.entry_id} className="px-4 py-2.5 flex items-start gap-3 hover:bg-[#FAFBF6]">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ backgroundColor: `${color}14` }}
                  >
                    {isIn ? (
                      <ArrowDownLeft className="w-3.5 h-3.5" style={{ color }} />
                    ) : (
                      <ArrowUpRight className="w-3.5 h-3.5" style={{ color }} />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-[11.5px] font-semibold text-[#1A2016] truncate">
                        {r.category || t.dash.txnUncategorised}
                      </span>
                      <strong className="text-[11.5px] font-mono shrink-0" style={{ color }}>
                        {isIn ? "+" : "−"}
                        {formatCurrency(Number(r.amount))}
                      </strong>
                    </div>

                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <span className="text-[10px] text-[#5F6656] font-mono">{r.event_date}</span>
                      {r.tender && (
                        <span
                          className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded-full border"
                          style={{
                            color: TENDER_COLOR[tenderKey] ?? "#5F6656",
                            borderColor: `${TENDER_COLOR[tenderKey] ?? "#5F6656"}33`,
                          }}
                        >
                          {r.tender.toUpperCase()}
                        </span>
                      )}
                      {r.is_household && (
                        <span className="text-[9.5px] text-[#5F6656] border border-[#E2E6D8] px-1.5 py-0.5 rounded-full">
                          {t.dash.txnHousehold}
                        </span>
                      )}
                    </div>

                    {r.transcript && (
                      <div className="flex items-start gap-1 mt-1 text-[10px] text-[#5F6656] italic">
                        <Mic className="w-3 h-3 shrink-0 mt-0.5" />
                        <span className="min-w-0">“{r.transcript}”</span>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {rows.length > 0 && (
        <div className="border-t border-[#E2E6D8] px-4 py-2 text-[10px] text-[#5F6656] shrink-0">
          {t.dash.txnShowing(rows.length, total)}
        </div>
      )}
    </div>
  );
}
