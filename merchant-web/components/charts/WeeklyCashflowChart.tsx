"use client";

import React, { useState } from 'react';

interface WeeklyData {
  week: string;
  weekLabel: string;
  dateRange: string;
  inflow: number;
  outflow: number;
  net: number;
}

interface Props {
  data: WeeklyData[];
}

export function WeeklyCashflowChart({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[#E7E5DA] p-10 flex flex-col items-center justify-center text-center mt-2.5">
        <p className="color-[#6F6B5E] text-sm font-bold">
          No cashflow records available yet
        </p>
        <p className="color-[#94A3B8] text-xs mt-1 max-w-xs">
          Add daily entries to generate weekly cashflow analytics.
        </p>
      </div>
    );
  }

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const chartHeight = 190;
  const paddingLeft = 42;
  const paddingRight = 15;
  const paddingTop = 20;
  const paddingBottom = 30;

  const displayData = data.slice(-5); // Last 5 weeks
  const activeItem = selectedIndex !== null ? displayData[selectedIndex] : displayData[displayData.length - 1];

  // Scale calculations (unified scale for inflow, outflow, and net cashflow)
  const allValues = displayData.flatMap((d) => [d.inflow, d.outflow, d.net]);
  const minVal = Math.min(0, ...allValues);
  const maxVal = Math.max(...allValues) || 500000;

  const formatK = (val: number) => {
    if (val === 0) return '0';
    const isNeg = val < 0;
    const absVal = Math.abs(val);
    let formatted = '';
    if (absVal >= 100000) {
      formatted = `${(absVal / 100000).toFixed(1)}L`;
    } else if (absVal >= 1000) {
      formatted = `${(absVal / 1000).toFixed(1)}k`;
    } else {
      formatted = `${Math.round(absVal)}`;
    }
    // Remove trailing .0 if present
    if (formatted.endsWith('.0')) {
      formatted = formatted.slice(0, -2);
    }
    return isNeg ? `-${formatted}` : formatted;
  };

  const chartWidth = 320 - paddingLeft - paddingRight;
  const step = chartWidth / displayData.length;
  const usableH = chartHeight - paddingTop - paddingBottom;

  const getPrefY = (val: number) => {
    const pct = (val - minVal) / (maxVal - minVal || 1);
    return paddingTop + (1 - pct) * usableH;
  };
  const zeroY = getPrefY(0);

  return (
    <div className="bg-white rounded-xl border border-[#E7E5DA] p-3.5 mt-1.5 flex flex-col gap-2">
      {/* Legend Header */}
      <div className="flex justify-center gap-4 text-xs font-semibold">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded bg-[#2E7D32]" />
          <span className="text-[#6F6B5E]">Inflow (₹)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded bg-[#C0392B]" />
          <span className="text-[#6F6B5E]">Outflow (₹)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 border-t-2 border-[#1D261F]" />
          <span className="text-[#6F6B5E]">Net Line</span>
        </div>
      </div>

      {/* SVG Combo Chart */}
      <div className="w-full max-w-[320px] mx-auto relative select-none">
        <svg width="100%" height={chartHeight} viewBox={`0 0 320 ${chartHeight}`} className="block">
          {/* Y Axis Gridlines */}
          {[0, 0.33, 0.66, 1].map((pct, i) => {
            const y = paddingTop + (1 - pct) * usableH;
            const val = minVal + pct * (maxVal - minVal);
            return (
              <g key={i}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={320 - paddingRight}
                  y2={y}
                  stroke="#E7E5DA"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingLeft - 6}
                  y={y + 3}
                  fill="#6F6B5E"
                  fontSize="9"
                  textAnchor="end"
                  className="font-semibold"
                >
                  {formatK(val)}
                </text>
              </g>
            );
          })}

          {/* Zero Baseline Line */}
          <line
            x1={paddingLeft}
            y1={zeroY}
            x2={320 - paddingRight}
            y2={zeroY}
            stroke="#6F6B5E"
            strokeWidth="1.5"
            opacity="0.8"
          />

          {/* Grouped Inflow / Outflow Bars */}
          {displayData.map((item, idx) => {
            const isSelected = selectedIndex === idx;
            const xCenter = paddingLeft + step * idx + step / 2;

            const inflowY = getPrefY(item.inflow);
            const inflowH = Math.max(zeroY - inflowY, 4);
            const inY = zeroY - inflowH;

            const outflowY = getPrefY(item.outflow);
            const outflowH = Math.max(zeroY - outflowY, 4);
            const outY = zeroY - outflowH;

            const barW = 10;
            const inX = xCenter - barW - 1;
            const outX = xCenter + 1;

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
                {/* Inflow Bar */}
                <rect
                  x={inX}
                  y={inY}
                  width={barW}
                  height={inflowH}
                  fill={isSelected ? '#1B5E20' : '#2E7D32'}
                  fillOpacity={isSelected ? 1.0 : 0.45}
                  rx="3"
                />
                {/* Outflow Bar */}
                <rect
                  x={outX}
                  y={outY}
                  width={barW}
                  height={outflowH}
                  fill={isSelected ? '#801A10' : '#C0392B'}
                  fillOpacity={isSelected ? 1.0 : 0.4}
                  rx="3"
                />
                {/* X Axis Label */}
                <text
                  x={xCenter}
                  y={chartHeight - 8}
                  fill={isSelected ? '#1D261F' : '#6F6B5E'}
                  fontSize="10"
                  fontWeight={isSelected ? '700' : '600'}
                  textAnchor="middle"
                >
                  {item.week}
                </text>

                {/* Clickable Area Overlay directly inside SVG */}
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

          {/* Connecting Line for Net Cashflow */}
          {(() => {
            const points = displayData.map((item, idx) => {
              const xCenter = paddingLeft + step * idx + step / 2;
              const netY = getPrefY(item.net);
              return `${xCenter},${netY}`;
            });

            return <path d={`M ${points.join(' L ')}`} fill="none" stroke="#1D261F" strokeWidth="2.5" />;
          })()}

          {/* Net Dots */}
          {displayData.map((item, idx) => {
            const isSelected = selectedIndex === idx;
            const xCenter = paddingLeft + step * idx + step / 2;
            const netY = getPrefY(item.net);

            return (
              <circle
                key={`dot_${idx}`}
                cx={xCenter}
                cy={netY}
                r={isSelected ? '5' : '3.5'}
                fill="#1D261F"
                stroke="#FFFFFF"
                strokeWidth={isSelected ? '2' : '1.5'}
                className="cursor-pointer"
                onClick={() => setSelectedIndex(idx)}
              />
            );
          })}
        </svg>
      </div>

      {/* Selected Week Callout / Active Detail Box */}
      {activeItem && (
        <div className="bg-[#FAFAF5] rounded-lg border border-[#E7E5DA] p-3 text-xs flex flex-col gap-1">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[#1D261F] font-bold">{activeItem.weekLabel}</span>
            <span className="text-[#6F6B5E] font-semibold">{activeItem.dateRange}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#6F6B5E]">Inflow:</span>
            <span className="text-[#2E7D32] font-semibold">
              +₹ {activeItem.inflow.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#6F6B5E]">Outflow:</span>
            <span className="text-[#C0392B] font-semibold">
              -₹ {activeItem.outflow.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex justify-between items-center border-t border-[#E7E5DA] pt-1 mt-0.5">
            <span className="text-[#1D261F] font-bold">Net Cashflow:</span>
            <span className={`font-bold ${activeItem.net >= 0 ? 'text-[#2E7D32]' : 'text-[#C0392B]'}`}>
              {activeItem.net >= 0 ? '+' : ''}₹ {activeItem.net.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
