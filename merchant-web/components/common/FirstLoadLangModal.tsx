"use client";

import React, { useState } from 'react';
import { Globe, CheckCircle2, ArrowRight } from 'lucide-react';
import { useMerchantStore } from '@/store/useMerchantStore';
import { L, SupportedLang } from '@/i18n/translations';

const LANG_OPTIONS: { id: SupportedLang; name: string; nativeName: string; flag: string }[] = [
  { id: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { id: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { id: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { id: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
];

export function FirstLoadLangModal() {
  const { lang, setLang, hasChosenLang, setHasChosenLang } = useMerchantStore();
  const [selectedLang, setSelectedLang] = useState<SupportedLang>(lang);

  if (hasChosenLang) return null;

  const t = L[selectedLang] || L.en;

  const handleApply = () => {
    setLang(selectedLang);
    setHasChosenLang(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl p-5 w-full max-w-sm border border-[#E7E5DA] shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#E7F2E7] flex items-center justify-center border border-[#E7E5DA] shrink-0">
            <Globe className="w-5 h-5 text-[#2E7D32]" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#1D261F]">{t.firstLoadLangTitle}</h3>
            <p className="text-[#6F6B5E] text-[10px] mt-0.5">{t.firstLoadLangSub}</p>
          </div>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-2">
          {LANG_OPTIONS.map((item) => {
            const isSelected = item.id === selectedLang;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedLang(item.id)}
                className={`w-full flex items-center justify-between text-left p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#E7F2E7] border-[#2E7D32] text-[#2E7D32]'
                    : 'bg-white border-[#E7E5DA] text-[#6F6B5E] hover:bg-[#FAFAF5]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{item.flag}</span>
                  <div>
                    <div className={isSelected ? 'text-[#1D261F] font-bold' : 'text-[#6F6B5E] font-medium'}>
                      {item.nativeName}
                    </div>
                    <div className="text-[10px] text-[#6F6B5E] font-semibold">{item.name}</div>
                  </div>
                </div>
                {isSelected && <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />}
              </button>
            );
          })}
        </div>

        {/* Tip Box */}
        <div className="bg-[#FBF0D9] border border-[#C77700]/20 rounded-lg p-2.5 text-[10px] text-[#C77700] leading-relaxed">
          {t.firstLoadLangTip}
        </div>

        {/* Apply Button */}
        <button
          onClick={handleApply}
          className="w-full bg-[#2E7D32] hover:bg-[#225F26] text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
        >
          <span>{t.applyLangBtn}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
