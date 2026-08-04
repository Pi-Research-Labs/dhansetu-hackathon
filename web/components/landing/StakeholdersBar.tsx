"use client";

import { Sprout, Users, Store, Building2 } from "lucide-react";
import { TranslationDictionary } from "@/utils/translations/dictionary";

interface StakeholdersBarProps {
  t: TranslationDictionary;
}

export default function StakeholdersBar({ t }: StakeholdersBarProps) {
  return (
    <section className="py-12 bg-[#F4F5F0]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-white border border-[#E2E6D8] rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-3">
              <div className="w-10 h-10 mx-auto mb-2.5 rounded-xl bg-[#E8F5E9] flex items-center justify-center text-[#2E7D32]">
                <Sprout className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-[#1A2016] text-sm">{t.land.nodes.farmer}</h4>
              <p className="text-[11px] text-[#5F6656] mt-0.5">FPOs & Agri Collectives</p>
            </div>

            <div className="p-3">
              <div className="w-10 h-10 mx-auto mb-2.5 rounded-xl bg-[#FBE9E7] flex items-center justify-center text-[#D84315]">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-[#1A2016] text-sm">{t.land.nodes.shg}</h4>
              <p className="text-[11px] text-[#5F6656] mt-0.5">Women Rural Enterprises</p>
            </div>

            <div className="p-3">
              <div className="w-10 h-10 mx-auto mb-2.5 rounded-xl bg-[#FFF3E0] flex items-center justify-center text-[#E65100]">
                <Store className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-[#1A2016] text-sm">{t.land.nodes.ent}</h4>
              <p className="text-[11px] text-[#5F6656] mt-0.5">Kirana & Dairy Producers</p>
            </div>

            <div className="p-3">
              <div className="w-10 h-10 mx-auto mb-2.5 rounded-xl bg-[#E3F2FD] flex items-center justify-center text-[#1565C0]">
                <Building2 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-[#1A2016] text-sm">{t.land.nodes.bank}</h4>
              <p className="text-[11px] text-[#5F6656] mt-0.5">Public & Regional Banks</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
