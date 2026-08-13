import React, { useState, useEffect } from 'react';
import { MarketChartPoint } from '@/utils/api-config';
import { useMerchantStore } from '@/store/useMerchantStore';
import { L } from '@/i18n/translations';
import { translateText } from '@/utils/translator';
import { Translate } from '@/components/common/Translate';

interface MarketPriceChartProps {
  chartData?: MarketChartPoint[];
}

export function MarketPriceChart({ chartData }: MarketPriceChartProps) {
  const { lang } = useMerchantStore();
  const t = L[lang] || L.en;

  const rawMonths = chartData && chartData.length > 0
    ? chartData.map((d) => d.month)
    : ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

  const [translatedMonths, setTranslatedMonths] = useState<string[]>(rawMonths);

  useEffect(() => {
    let isMounted = true;
    async function translateMonths() {
      if (lang === 'en') {
        setTranslatedMonths(rawMonths);
        return;
      }
      try {
        const translated = await Promise.all(rawMonths.map((m) => translateText(m, lang)));
        if (isMounted) {
          setTranslatedMonths(translated);
        }
      } catch (err) {
        console.error('Error translating months:', err);
        if (isMounted) {
          setTranslatedMonths(rawMonths);
        }
      }
    }
    translateMonths();
    return () => {
      isMounted = false;
    };
  }, [lang, chartData]);

  const months = translatedMonths;

  // Rainfall in mm
  const rainfallData = chartData && chartData.length > 0
    ? chartData.map((d) => d.rainfall_mm)
    : [185, 210, 145, 60, 15, 5, 0, 10, 25, 40, 85, 160];

  // Price Index (100 base)
  const priceIndexData = chartData && chartData.length > 0
    ? chartData.map((d) => d.price_index)
    : [102, 104, 107, 112, 118, 122, 120, 119, 123, 125, 128, 131];

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const chartHeight = 170;
  const paddingLeft = 32;
  const paddingRight = 32;
  const paddingTop = 15;
  const paddingBottom = 25;

  const maxRain = chartData && chartData.length > 0
    ? Math.max(...rainfallData, 50)
    : 250;

  const minPrice = chartData && chartData.length > 0
    ? Math.max(0, Math.min(...priceIndexData) - 5)
    : 90;

  const maxPrice = chartData && chartData.length > 0
    ? Math.max(...priceIndexData) + 5
    : 140;

  const activeItem = selectedIndex !== null
    ? { month: months[selectedIndex], price: priceIndexData[selectedIndex], rain: rainfallData[selectedIndex] }
    : { month: months[months.length - 1], price: priceIndexData[priceIndexData.length - 1], rain: rainfallData[rainfallData.length - 1] };

  const chartWidth = 600 - paddingLeft - paddingRight;
  const step = chartWidth / months.length;
  const usableH = chartHeight - paddingTop - paddingBottom;

  return (
    <div className="bg-white rounded-xl border border-[#E7E5DA] p-3.5 mt-3 flex flex-col gap-2">
      <h4 className="text-[#1D261F] text-xs font-bold">
        <Translate>12-Month Commodity Price Index & Rainfall</Translate>
      </h4>
      
      {/* Legend */}
      <div className="flex gap-4 text-[10px] font-semibold">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded bg-[#1565C0] opacity-35" />
          <span className="text-[#6F6B5E]">
            <Translate>Rainfall (mm)</Translate>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-0.5 border-t-2 border-[#2E7D32]" />
          <span className="text-[#6F6B5E]">
            <Translate>Price Index (Base 100)</Translate>
          </span>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="w-full relative select-none">
        <svg width="100%" height={chartHeight} viewBox={`0 0 600 ${chartHeight}`} className="block">
          {/* Gridlines */}
          {[0, 0.5, 1].map((pct, i) => {
            const y = paddingTop + (1 - pct) * usableH;
            return (
              <g key={i}>
                <line x1={paddingLeft} y1={y} x2={600 - paddingRight} y2={y} stroke="#E7E5DA" strokeWidth="1" />
                <text x={paddingLeft - 4} y={y + 3} fill="#6F6B5E" fontSize="8" textAnchor="end" className="font-semibold">
                  {Math.round(pct * maxRain)}
                </text>
                <text x={600 - paddingRight + 4} y={y + 3} fill="#6F6B5E" fontSize="8" textAnchor="start" className="font-semibold">
                  {Math.round(minPrice + pct * (maxPrice - minPrice))}
                </text>
              </g>
            );
          })}

          {/* Rainfall Bars & Selection Column highlights */}
          {months.map((m, idx) => {
            const isSelected = selectedIndex === idx;
            const x = paddingLeft + step * idx + 2;
            const barW = Math.max(step - 4, 4);

            const rainH = (rainfallData[idx] / maxRain) * usableH;
            const rainY = paddingTop + usableH - rainH;

            return (
              <g key={idx}>
                {/* Active Selection Highlight Column */}
                {isSelected && (
                  <rect
                    x={paddingLeft + step * idx}
                    y={paddingTop}
                    width={step}
                    height={usableH}
                    fill="#E7F2E7"
                    rx="4"
                    opacity="0.6"
                  />
                )}

                {/* Rainfall Bar */}
                <rect
                  x={x}
                  y={rainY}
                  width={barW}
                  height={rainH}
                  fill={isSelected ? '#0D47A1' : '#1565C0'}
                  fillOpacity={isSelected ? 0.9 : 0.25}
                  rx="1"
                />

                {/* X Axis Label */}
                <text
                  x={x + barW / 2}
                  y={chartHeight - 6}
                  fill={isSelected ? '#1D261F' : '#6F6B5E'}
                  fontSize="8"
                  fontWeight={isSelected ? '700' : '600'}
                  textAnchor="middle"
                >
                  {m}
                </text>

                {/* Clickable Area Overlay */}
                <rect
                  x={paddingLeft + step * idx}
                  y={paddingTop}
                  width={step}
                  height={usableH}
                  fill="transparent"
                  className="cursor-pointer"
                  onClick={() => setSelectedIndex(idx)}
                />
              </g>
            );
          })}

          {/* Price Index Line */}
          {(() => {
            const points = priceIndexData.map((val, idx) => {
              const x = paddingLeft + step * idx + step / 2;
              const norm = (val - minPrice) / (maxPrice - minPrice);
              const y = paddingTop + (1 - norm) * usableH;
              return `${x},${y}`;
            });

            return (
              <g>
                <path d={`M ${points.join(' L ')}`} fill="none" stroke="#2E7D32" strokeWidth="2" />
                {priceIndexData.map((val, idx) => {
                  const isSelected = selectedIndex === idx;
                  const x = paddingLeft + step * idx + step / 2;
                  const norm = (val - minPrice) / (maxPrice - minPrice);
                  const y = paddingTop + (1 - norm) * usableH;
                  return (
                    <circle
                      key={idx}
                      cx={x}
                      cy={y}
                      r={isSelected ? '4.5' : '2.5'}
                      fill="#2E7D32"
                      stroke="#FFFFFF"
                      strokeWidth={isSelected ? '1.5' : '1'}
                      className="cursor-pointer"
                      onClick={() => setSelectedIndex(idx)}
                    />
                  );
                })}
              </g>
            );
          })()}
        </svg>
      </div>

      {/* Selected Month Callout / Active Detail Box */}
      {activeItem && (
        <div className="bg-[#FAFAF5] rounded-lg border border-[#E7E5DA] p-3 text-xs flex flex-col gap-1 mt-2.5 animate-in fade-in duration-200">
          <div className="flex justify-between items-center mb-1 border-b border-[#E7E5DA] pb-1">
            <span className="text-[#1D261F] font-bold">
              {activeItem.month} <Translate>Forecast & Trends</Translate>
            </span>
            <span className="text-[10px] font-bold text-[#2E7D32] bg-[#E7F2E7] px-2 py-0.5 rounded">
              <Translate>Active Detail</Translate>
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#6F6B5E]">
              <Translate>Price Index:</Translate>
            </span>
            <span className="text-[#2E7D32] font-semibold">{activeItem.price.toFixed(1)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#6F6B5E]">
              <Translate>Rainfall:</Translate>
            </span>
            <span className="text-[#1565C0] font-semibold">{activeItem.rain.toFixed(1)} mm</span>
          </div>
        </div>
      )}
    </div>
  );
}
