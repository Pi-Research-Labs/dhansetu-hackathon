"use client";

import React from "react";
import { Sprout, Users, Store, Building2, ShoppingBag, Cog, Palette, Droplets, Egg } from "lucide-react";
import { TranslationDictionary } from "@/utils/translations/dictionary";

interface StakeholdersBarProps {
  t: TranslationDictionary;
  lang?: string;
}

const CAROUSEL_TRANSLATIONS: Record<string, Record<string, { title: string; desc: string }>> = {
  en: {
    farmer: { title: "Farmers", desc: "FPOs & Agri Collectives" },
    shg: { title: "Women SHGs", desc: "Women Rural Enterprises" },
    ent: { title: "Rural Enterprises", desc: "Kirana & Dairy Producers" },
    bank: { title: "Banks & MFIs", desc: "Public & Regional Banks" },
    retail: { title: "Retail", desc: "Kirana & Local Shops" },
    foodproc: { title: "Food Processing", desc: "Agri-Processors & Mills" },
    handicraft: { title: "Handicrafts", desc: "Artisans & Weavers" },
    dairy: { title: "Dairy", desc: "Milk Cooperatives" },
    poultry: { title: "Poultry", desc: "Layer & Broiler Farms" }
  },
  hi: {
    farmer: { title: "किसान", desc: "FPO और कृषि संघ" },
    shg: { title: "महिला SHG", desc: "महिला ग्रामीण उद्यम" },
    ent: { title: "ग्रामीण उद्यम", desc: "किराना और डेयरी उत्पादक" },
    bank: { title: "बैंक और MFI", desc: "सार्वजनिक और क्षेत्रीय बैंक" },
    retail: { title: "खुदरा", desc: "किराना और स्थानीय दुकानें" },
    foodproc: { title: "खाद्य प्रसंस्करण", desc: "कृषि प्रोसेसर और मिलें" },
    handicraft: { title: "हस्तशिल्प", desc: "कारीगर और बुनकर" },
    dairy: { title: "डेयरी", desc: "दूध सहकारी समितियां" },
    poultry: { title: "पोल्ट्री", desc: "अंडा और ब्रॉयलर फार्म" }
  },
  mr: {
    farmer: { title: "शेतकरी", desc: "FPO आणि कृषी गट" },
    shg: { title: "महिला बचत गट", desc: "महिला ग्रामीण उद्योग" },
    ent: { title: "ग्रामीण उद्योजक", desc: "किराणा आणि दुग्ध उत्पादक" },
    bank: { title: "बँका व MFI", desc: "सार्वजनिक आणि प्रादेशिक बँका" },
    retail: { title: "किरकोळ विक्री", desc: "किराणा आणि स्थानिक दुकाने" },
    foodproc: { title: "अन्न प्रक्रिया", desc: "कृषी-प्रक्रिया आणि गिरण्या" },
    handicraft: { title: "हस्तकला", desc: "कलाकार आणि विणकर" },
    dairy: { title: "दुग्ध व्यवसाय", desc: "दूध सहकारी संस्था" },
    poultry: { title: "कुक्कुटपालन", desc: "अंडी आणि ब्रॉयलर फार्म" }
  },
  te: {
    farmer: { title: "రైతులు", desc: "FPOలు & వ్యవసాయ సంఘాలు" },
    shg: { title: "మహిళా SHGలు", desc: "మహిళా గ్రామీణ పరిశ్రమలు" },
    ent: { title: "గ్రామీణ సంస్థలు", desc: "కిరాణా & డైరీ నిర్మాతలు" },
    bank: { title: "బ్యాంకులు & MFIలు", desc: "ప్రభుత్వ & ప్రాంతీయ బ్యాంకులు" },
    retail: { title: "చిల్లర వ్యాపారం", desc: "కిరాణా & స్థానిక కాంప్లెక్స్" },
    foodproc: { title: "ఆహార ప్రాసెసింగ్", desc: "అగ్రి-ప్రాసెసర్లు & మిల్లులు" },
    handicraft: { title: "హస్తకళలు", desc: "కళాకారులు & చేనేత కార్మికులు" },
    dairy: { title: "డైరీ", desc: "పాల సహకార సంఘాలు" },
    poultry: { title: "పౌల్ట్రీ", desc: "కోళ్ల ఫారాలు" }
  }
};

export default function StakeholdersBar({ t, lang = "en" }: StakeholdersBarProps) {
  const currentLang = CAROUSEL_TRANSLATIONS[lang] ? lang : "en";
  const dict = CAROUSEL_TRANSLATIONS[currentLang];

  const items = [
    { id: "farmer", icon: Sprout, bg: "bg-[#E8F5E9]", text: "text-[#2E7D32]" },
    { id: "shg", icon: Users, bg: "bg-[#FBE9E7]", text: "text-[#D84315]" },
    { id: "ent", icon: Store, bg: "bg-[#FFF3E0]", text: "text-[#E65100]" },
    { id: "bank", icon: Building2, bg: "bg-[#E3F2FD]", text: "text-[#1565C0]" },
    { id: "retail", icon: ShoppingBag, bg: "bg-[#F3E5F5]", text: "text-[#8E24AA]" },
    { id: "foodproc", icon: Cog, bg: "bg-[#E0F2F1]", text: "text-[#00695C]" },
    { id: "handicraft", icon: Palette, bg: "bg-[#EFEBE9]", text: "text-[#4E342E]" },
    { id: "dairy", icon: Droplets, bg: "bg-[#E0F7FA]", text: "text-[#00838F]" },
    { id: "poultry", icon: Egg, bg: "bg-[#FFFDE7]", text: "text-[#F57F17]" },
  ];

  // Duplicate items array to make the infinite scroll seamless
  const doubledItems = [...items, ...items];

  return (
    <section className="py-12 bg-[#F4F5F0]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-white border border-[#E2E6D8] rounded-2xl p-6 sm:p-8 shadow-xs overflow-hidden relative">
          
          {/* Custom style tag for marquee keyframes */}
          <style>{`
            @keyframes marquee {
              0% { transform: translateX(0%); }
              100% { transform: translateX(-50%); }
            }
            .animate-marquee {
              animation: marquee 30s linear infinite;
            }
          `}</style>

          {/* Scrolling wrapper */}
          <div className="flex w-full overflow-hidden">
            <div className="flex gap-12 animate-marquee whitespace-nowrap">
              {doubledItems.map((item, idx) => {
                const Icon = item.icon;
                const info = dict[item.id] || CAROUSEL_TRANSLATIONS.en[item.id];
                return (
                  <div
                    key={`${item.id}-${idx}`}
                    className="p-3 text-center shrink-0 w-[180px] select-none"
                  >
                    <div className={`w-10 h-10 mx-auto mb-2.5 rounded-xl ${item.bg} flex items-center justify-center ${item.text}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-[#1A2016] text-sm">{info.title}</h4>
                    <p className="text-[11px] text-[#5F6656] mt-0.5">{info.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
