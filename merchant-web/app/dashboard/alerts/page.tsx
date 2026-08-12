"use client";

import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  TrendingDown,
  Info,
  CheckCircle,
} from 'lucide-react';
import { useMerchantStore } from '@/store/useMerchantStore';
import { L } from '@/i18n/translations';
import { translateText } from '@/utils/translator';

export default function AlertsScreen() {
  const {
    lang,
    tier,
    score,
    flags,
    advice,
    hasUnreadAlerts,
    markAlertsAsRead,
  } = useMerchantStore();

  const t = L[lang] || L.en;

  const [translatedAdvice, setTranslatedAdvice] = useState<string[]>(advice || []);

  // Clear unread indicator on mount
  useEffect(() => {
    if (hasUnreadAlerts) {
      markAlertsAsRead();
    }
  }, [hasUnreadAlerts, markAlertsAsRead]);

  // Translate advice on change
  useEffect(() => {
    let isMounted = true;
    async function performTranslation() {
      if (!advice || advice.length === 0) {
        setTranslatedAdvice([]);
        return;
      }
      if (lang === 'en') {
        setTranslatedAdvice(advice);
        return;
      }
      try {
        const promises = advice.map(item => translateText(item, lang));
        const results = await Promise.all(promises);
        if (isMounted) {
          setTranslatedAdvice(results);
        }
      } catch (err) {
        console.warn('Failed to translate advice:', err);
        if (isMounted) {
          setTranslatedAdvice(advice);
        }
      }
    }
    performTranslation();
    return () => {
      isMounted = false;
    };
  }, [advice, lang]);

  // Color mapping functions
  const getTierColor = (tVal: string) => {
    switch (tVal) {
      case 'RED':
        return '#C0392B';
      case 'AMBER':
        return '#D97706';
      default:
        return '#2E7D32';
    }
  };

  const getTierBg = (tVal: string) => {
    switch (tVal) {
      case 'RED':
        return 'bg-[#F8E6E2]';
      case 'AMBER':
        return 'bg-[#FBF0D9]';
      default:
        return 'bg-[#E7F2E7]';
    }
  };

  const getTierBorder = (tVal: string) => {
    switch (tVal) {
      case 'RED':
        return 'border-[#C0392B]/20';
      case 'AMBER':
        return 'border-[#D97706]/20';
      default:
        return 'border-[#2E7D32]/20';
    }
  };

  const getTierBadgeText = (tVal: string) => {
    const tierMap = t.tiers || {};
    return tierMap[tVal] || tVal;
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header */}
      <div>
        <h2 className="text-[#1D261F] text-xl font-bold">{t.alertsTitle}</h2>
        <p className="text-[#6F6B5E] text-xs leading-normal mt-1">{t.alertsSub}</p>
      </div>

      <div className="flex flex-col gap-6">
        
        {/* Active Flags List */}
        <div className="bg-white border border-[#E7E5DA] rounded-2xl p-5 shadow-xs flex flex-col gap-3">
          <h3 className="text-[#1D261F] text-sm font-bold">
            {t.activeFlagsTitle(flags.length)}
          </h3>

          {flags.length > 0 ? (
            <div className="flex flex-col gap-3">
              {flags.map((flag) => (
                <div
                  key={flag.key}
                  className="flex gap-3 bg-[#FAFAF5] border border-[#E7E5DA] rounded-xl p-3.5"
                >
                  <TrendingDown className="w-4 h-4 text-[#C0392B] shrink-0 mt-0.5" />
                  <div className="flex-1 flex flex-col gap-1">
                    <span className="text-xs font-bold text-[#1D261F]">{t.mechanisms[flag.key] || flag.tag}</span>
                    <span className="text-[11px] font-medium text-[#6F6B5E] leading-relaxed">
                      {t.flagDetails[flag.key] ? t.flagDetails[flag.key](flag.params || {}) : flag.detail}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-[#E7E5DA] rounded-xl bg-[#FAFAF5]">
              <CheckCircle className="w-8 h-8 text-[#2E7D32] mb-2" />
              <p className="text-xs font-bold text-[#2E7D32]">Perfect Standings</p>
              <p className="text-[10px] text-[#6F6B5E] mt-0.5 max-w-[200px]">No liquidity stress or repayment alerts detected on your account.</p>
            </div>
          )}
        </div>

        {/* Actionable Recommendations */}
        <div className="bg-white border border-[#E7E5DA] rounded-2xl p-5 shadow-xs flex flex-col gap-3">
          <h3 className="text-[#1D261F] text-sm font-bold">
            {t.suggestedActionsTitle}
          </h3>

          <div className="flex flex-col gap-3.5">
            {translatedAdvice.map((item, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-5 h-5 rounded-full bg-[#E7F2E7] border border-[#E2E6D8] text-[#2E7D32] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <div className="flex-1 flex flex-col gap-0.5">
                  <span className="text-[11px] font-bold text-[#1D261F]">{t.recNumber(i + 1)}</span>
                  <span className="text-[11px] font-medium text-[#6F6B5E] leading-relaxed">{item}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
