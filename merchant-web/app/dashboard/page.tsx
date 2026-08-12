"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  AlertTriangle,
  Smartphone,
  CreditCard,
  Banknote,
  BookOpen,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useMerchantStore } from '@/store/useMerchantStore';
import { L } from '@/i18n/translations';
import { WeeklyCashflowChart } from '@/components/charts/WeeklyCashflowChart';

export default function DashboardHome() {
  const {
    lang,
    name,
    net90,
    savings,
    runwayMonths,
    missedEmi,
    loan,
    emi,
    upiShare,
    appShare,
    cashShare,
    weeklyHistory,
    receivables,
    todaysTotals,
    fetchMerchantData,
  } = useMerchantStore();

  const t = L[lang] || L.en;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchMerchantData().finally(() => setLoading(false));
  }, [fetchMerchantData]);

  const formatCurrency = (amount: number) => {
    const isNeg = amount < 0;
    const absVal = Math.abs(amount).toLocaleString('en-IN', { maximumFractionDigits: 0 });
    return isNeg ? `-₹ ${absVal}` : `₹ ${absVal}`;
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* ─── Profile Header ─── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <span className="text-[10px] font-bold text-[#6F6B5E] tracking-widest uppercase">Verified Portfolio</span>
          <h2 className="text-[#1D261F] text-xl font-bold mt-0.5">{name}</h2>
        </div>
        <div className="flex items-center gap-1.5 bg-[#E7F2E7] border border-[#E2E6D8] px-2.5 py-1 rounded-full text-[10px] font-bold text-[#2E7D32]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>GSTIN & Aadhaar Active</span>
        </div>
      </div>

      {/* ─── Missed EMI Alert Banner ─── */}
      {missedEmi >= 1 && (
        <div className="flex items-start gap-3 bg-[#F8E6E2] border border-[#C0392B]/20 rounded-xl p-3.5 text-[#C0392B]">
          <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
          <div className="text-xs">
            <span className="font-bold">Urgent Account Alert:</span>{' '}
            <span>{t.emiBanner(missedEmi)}</span>
          </div>
        </div>
      )}

      {/* ─── 4 Core Financial KPI Grid ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: 90D Net Cashflow */}
        <div className="bg-white border border-[#E7E5DA] rounded-xl p-4 shadow-2xs flex flex-col justify-between min-h-[96px]">
          <span className="text-[#6F6B5E] text-[10px] font-bold tracking-wide uppercase leading-none">{t.last90}</span>
          <div className="mt-2.5">
            <h3 className={`text-lg font-bold ${net90 < 0 ? 'text-[#C0392B]' : 'text-[#2E7D32]'}`}>
              {formatCurrency(net90)}
            </h3>
            <span className="text-[9px] font-semibold text-[#6F6B5E] mt-1 flex items-center gap-1">
              {net90 < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
              {net90 < 0 ? 'Negative Net Trend' : 'Positive Net Trend'}
            </span>
          </div>
        </div>

        {/* Metric 2: Savings Balance */}
        <div className="bg-white border border-[#E7E5DA] rounded-xl p-4 shadow-2xs flex flex-col justify-between min-h-[96px]">
          <span className="text-[#6F6B5E] text-[10px] font-bold tracking-wide uppercase leading-none">{t.savBal}</span>
          <div className="mt-2.5">
            <h3 className="text-[#1D261F] text-lg font-bold">{formatCurrency(savings)}</h3>
            <span className="text-[9px] font-bold text-[#2E7D32] bg-[#E7F2E7] px-1.5 py-0.5 rounded mt-1 inline-block">
              {Number(runwayMonths.toFixed(1))} {t.runwaySuffix}
            </span>
          </div>
        </div>

        {/* Metric 3: Loan Outstanding */}
        <div className="bg-white border border-[#E7E5DA] rounded-xl p-4 shadow-2xs flex flex-col justify-between min-h-[96px]">
          <span className="text-[#6F6B5E] text-[10px] font-bold tracking-wide uppercase leading-none">{t.loanOut}</span>
          <div className="mt-2.5">
            <h3 className="text-[#1D261F] text-lg font-bold">
              {loan ? formatCurrency(loan) : t.noLoan}
            </h3>
            <span className="text-[9px] font-semibold text-[#6F6B5E] mt-1 inline-block">
              {loan ? 'Institutional Nodal Credit' : 'No active debts'}
            </span>
          </div>
        </div>

        {/* Metric 4: Suggested EMI */}
        <div className="bg-white border border-[#E7E5DA] rounded-xl p-4 shadow-2xs flex flex-col justify-between min-h-[96px]">
          <span className="text-[#6F6B5E] text-[10px] font-bold tracking-wide uppercase leading-none">{t.mEmi}</span>
          <div className="mt-2.5">
            <h3 className={`text-lg font-bold ${missedEmi >= 1 ? 'text-[#C0392B]' : 'text-[#1D261F]'}`}>
              {emi ? formatCurrency(emi) : '₹ 0'}
            </h3>
            {missedEmi >= 1 ? (
              <span className="text-[9px] font-bold text-[#C0392B] bg-[#F8E6E2] px-1.5 py-0.5 rounded mt-1 inline-block animate-pulse">
                {missedEmi} {t.missedEmiSuffix}
              </span>
            ) : (
              <span className="text-[9px] font-semibold text-[#6F6B5E] mt-1 inline-block">
                All installments current
              </span>
            )}
          </div>
        </div>

      </div>

      {/* ─── Weekly Chart & Channels Breakdowns ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Cashflow combo-chart */}
        <div className="lg:col-span-2 bg-white border border-[#E7E5DA] rounded-2xl p-5 shadow-xs flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1">
            <div>
              <h3 className="text-[#1D261F] text-sm font-bold">{t.weeklyRecordTitle}</h3>
              <p className="text-[#6F6B5E] text-[11px] font-semibold mt-0.5">{t.weeklyRecordSub}</p>
            </div>
            {loading && (
              <div className="w-4 h-4 border-2 border-[#2E7D32] border-t-transparent rounded-full animate-spin"></div>
            )}
          </div>
          <WeeklyCashflowChart data={weeklyHistory} />
        </div>

        {/* Collection mix breakdown */}
        <div className="bg-white border border-[#E7E5DA] rounded-2xl p-5 shadow-xs flex flex-col justify-between gap-4">
          <div>
            <h3 className="text-[#1D261F] text-sm font-bold">{t.channelsTitle}</h3>
            <p className="text-[#6F6B5E] text-[11px] font-semibold mt-0.5">{t.channelsSub}</p>
          </div>

          <div className="flex flex-col gap-4">
            {/* Visual Bar segment */}
            <div className="w-full h-3.5 bg-[#E7E5DA] rounded-full overflow-hidden flex">
              <div style={{ width: `${upiShare * 100}%` }} className="bg-[#2E7D32] h-full" />
              <div style={{ width: `${appShare * 100}%` }} className="bg-[#1565C0] h-full" />
              <div style={{ width: `${cashShare * 100}%` }} className="bg-[#C9CDBF] h-full" />
            </div>

            {/* List breakdown */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#2E7D32]" />
                  <Smartphone className="w-3.5 h-3.5 text-[#6F6B5E]" />
                  <span className="text-[#6F6B5E]">{t.upiLabel}</span>
                </div>
                <span className="text-[#1D261F]">{Math.round(upiShare * 100)}%</span>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#1565C0]" />
                  <CreditCard className="w-3.5 h-3.5 text-[#6F6B5E]" />
                  <span className="text-[#6F6B5E]">{t.walletLabel}</span>
                </div>
                <span className="text-[#1D261F]">{Math.round(appShare * 100)}%</span>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#C9CDBF]" />
                  <Banknote className="w-3.5 h-3.5 text-[#6F6B5E]" />
                  <span className="text-[#6F6B5E]">{t.cashLabel}</span>
                </div>
                <span className="text-[#1D261F]">{Math.round(cashShare * 100)}%</span>
              </div>
            </div>
          </div>

          <div className="text-[10px] font-semibold text-[#6F6B5E] leading-normal bg-[#FAFAF5] rounded-lg p-2.5 border border-[#E7E5DA]">
            💡 Digital receipts (UPI/Wallet) provide verifiable credit tracking for bankers, boosting loan eligibility.
          </div>
        </div>

      </div>

      {/* ─── Udhaar Book & Today's Summary ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Udhaar Book Receivables ageing */}
        <div className="bg-white border border-[#E7E5DA] rounded-2xl p-5 shadow-xs flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#2E7D32]" />
            <h3 className="text-[#1D261F] text-sm font-bold">Udhaar Book (Receivables Ageing)</h3>
          </div>

          <div className="flex flex-col divide-y divide-[#E7E5DA]">
            {receivables && receivables.length > 0 ? (
              receivables.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center py-3 first:pt-0 last:pb-0">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-[#1D261F]">
                      {item.counterparty_type.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="text-[10px] font-semibold text-[#6F6B5E]">
                      {item.invoices} Invoices · Avg {item.avg_days_to_cash} Days to Cash
                    </span>
                  </div>
                  <div className="text-right flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-[#1D261F]">
                      ₹ {item.total.toLocaleString('en-IN')}
                    </span>
                    {item.written_off > 0 && (
                      <span className="text-[9px] font-bold text-[#C0392B]">
                        Written-Off: ₹ {item.written_off.toLocaleString('en-IN')} ({item.write_off_pct}%)
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs font-semibold text-[#6F6B5E] py-4 italic text-center">
                No credit (udhaar) book entries recorded.
              </p>
            )}
          </div>
        </div>

        {/* Today's totals card */}
        <div className="bg-white border border-[#E7E5DA] rounded-2xl p-5 shadow-xs flex flex-col justify-between gap-4">
          <div className="flex justify-between items-center">
            <h3 className="text-[#1D261F] text-sm font-bold">{t.todaysEntryTitle}</h3>
            <Link
              href="/dashboard/add-entry"
              className="text-[#2E7D32] hover:text-[#225F26] text-xs font-bold flex items-center gap-1"
            >
              <span>{t.addNew}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            
            {/* Money In */}
            <div className="bg-[#FAFAF5] border border-[#E7E5DA] rounded-xl p-3 flex flex-col gap-1.5">
              <span className="text-[#6F6B5E] text-[10px] font-bold tracking-wide uppercase">{t.inflowLabel}</span>
              <h4 className="text-[#2E7D32] text-base font-extrabold">
                +₹ {(todaysTotals?.total_inflow ?? 0).toLocaleString('en-IN')}
              </h4>
              <p className="text-[#6F6B5E] text-[9px] font-medium leading-tight">
                {t.todayTotalLabel(
                  `₹ ${(todaysTotals?.total_inflow ?? 0).toLocaleString('en-IN')}`,
                  `₹ ${(todaysTotals?.live_inflow ?? 0).toLocaleString('en-IN')}`
                )}
              </p>
            </div>

            {/* Money Out */}
            <div className="bg-[#FAFAF5] border border-[#E7E5DA] rounded-xl p-3 flex flex-col gap-1.5">
              <span className="text-[#6F6B5E] text-[10px] font-bold tracking-wide uppercase">{t.outflowLabel}</span>
              <h4 className="text-[#C0392B] text-base font-extrabold">
                -₹ {(todaysTotals?.total_outflow ?? 0).toLocaleString('en-IN')}
              </h4>
              <p className="text-[#6F6B5E] text-[9px] font-medium leading-tight">
                {t.todayTotalLabel(
                  `₹ ${(todaysTotals?.total_outflow ?? 0).toLocaleString('en-IN')}`,
                  `₹ ${(todaysTotals?.live_outflow ?? 0).toLocaleString('en-IN')}`
                )}
              </p>
            </div>

          </div>

          <div className="text-[10px] font-semibold text-[#6F6B5E] leading-normal bg-[#FAFAF5] rounded-lg p-2.5 border border-[#E7E5DA] text-center">
            All manual entries recorded locally are instantly synchronized on server reconnection.
          </div>
        </div>

      </div>

    </div>
  );
}
