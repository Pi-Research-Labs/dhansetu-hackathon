"use client";

import React, { useState, useEffect } from "react";
import { EnterpriseCard, fetchMapTileBlobUrl } from "@/utils/api-config";
import { formatCurrency } from "@/utils/formatters";
import { Enterprise } from "@/types/enterprise";
import {
  Building2,
  MapPin,
  ShieldAlert,
  CreditCard,
  Clock,
  Plus,
  Minus,
  RotateCcw,
  Maximize2,
  Minimize2,
  Loader2,
} from "lucide-react";

interface EnterpriseDetailCardProps {
  card?: EnterpriseCard | null;
  enterprise?: Enterprise;
}

export default function EnterpriseDetailCard({
  card,
  enterprise,
}: EnterpriseDetailCardProps) {
  // Extract values prioritizing raw API card properties
  const id = card?.enterprise_id || enterprise?.id || "";
  const name = card?.business_name || card?.proprietor_name || enterprise?.name || "";
  const proprietor = card?.proprietor_name || enterprise?.name || "";
  const district = (card?.district as string) || enterprise?.district || "Gujarat";
  const tier = (card?.risk_tier || enterprise?.tier || "AMBER").toUpperCase();
  const rawScore = card?.score ?? enterprise?.score ?? 0;
  const scorePct = rawScore <= 1 ? (rawScore * 100).toFixed(1) : rawScore.toFixed(1);

  const bufferDays =
    card?.buffer_days ??
    (enterprise?.metrics?.runwayMonths ? Math.round(enterprise.metrics.runwayMonths * 30) : 0);
  const netBufferDays = card?.net_buffer_days ?? -10;
  const creditHeadroom = card?.credit_headroom ?? enterprise?.metrics.creditHeadroom ?? 0;
  const bridgeHeadroom = card?.bridge_headroom ?? enterprise?.metrics.savings ?? 0;
  const marginGap = card?.margin_gap_90d ?? null;

  // Interactive Map State
  const [zoom, setZoom] = useState<number>(15);
  const [mapTileUrl, setMapTileUrl] = useState<string | null>(null);
  const [isLoadingMap, setIsLoadingMap] = useState<boolean>(true);
  const [isExpandedMap, setIsExpandedMap] = useState<boolean>(false);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let isMounted = true;

    async function loadTile() {
      setIsLoadingMap(true);
      setMapError(null);

      try {
        const size = isExpandedMap ? "640x380" : "450x250";
        const url = await fetchMapTileBlobUrl(id, zoom, size);
        if (isMounted) {
          setMapTileUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return url;
          });
        }
      } catch (err) {
        if (isMounted) {
          setMapError(err instanceof Error ? err.message : "Map tile unavailable");
        }
      } finally {
        if (isMounted) {
          setIsLoadingMap(false);
        }
      }
    }

    loadTile();

    return () => {
      isMounted = false;
    };
  }, [id, zoom, isExpandedMap]);

  // Clean up blob URL on unmount
  useEffect(() => {
    return () => {
      if (mapTileUrl) {
        URL.revokeObjectURL(mapTileUrl);
      }
    };
  }, [mapTileUrl]);

  const tierBadge =
    tier === "GREEN"
      ? "bg-[#E8F5E9] border-[#2E7D32]/40 text-[#2E7D32]"
      : tier === "AMBER"
      ? "bg-[#FFF3E0] border-[#E65100]/40 text-[#E65100]"
      : "bg-[#FFEBEE] border-[#C62828]/40 text-[#C62828]";

  return (
    <div className="bg-white border border-[#E2E6D8] p-5 rounded-2xl shadow-2xs space-y-4">
      {/* Main Top Grid: Same row by default, separate line when expanded */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
        {/* Enterprise Details Text Column */}
        <div
          className={`space-y-2.5 ${
            isExpandedMap ? "md:col-span-12" : "md:col-span-7 lg:col-span-8"
          }`}
        >
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-lg font-bold text-[#1A2016] flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#2E7D32]" />
              <span>{name}</span>
            </h2>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${tierBadge}`}>
              {tier} RISK TIER ({scorePct}%)
            </span>
          </div>

          <p className="text-xs text-[#5F6656] flex flex-wrap items-center gap-2">
            <span className="font-mono font-medium">Proprietor: {proprietor}</span>
            <span>·</span>
            <span className="font-mono">ID: {id}</span>
            <span>·</span>
            <span>District: {district}</span>
          </p>

          {/* Quick Metrics Pills */}
          <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
            <div className="bg-[#FAFBF6] border border-[#E2E6D8] px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-mono">
              <Clock className="w-3.5 h-3.5 text-[#E65100]" />
              <span>Net Buffer: </span>
              <strong className={netBufferDays < 0 ? "text-[#C62828]" : "text-[#2E7D32]"}>
                {netBufferDays} days
              </strong>
            </div>

            <div className="bg-[#FAFBF6] border border-[#E2E6D8] px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-mono">
              <CreditCard className="w-3.5 h-3.5 text-[#2E7D32]" />
              <span>Bridge Headroom: </span>
              <strong className="text-[#2E7D32]">{formatCurrency(bridgeHeadroom)}</strong>
            </div>

            {marginGap !== null && (
              <div className="bg-[#FAFBF6] border border-[#E2E6D8] px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-mono">
                <ShieldAlert className="w-3.5 h-3.5 text-[#C62828]" />
                <span>90D Margin Gap: </span>
                <strong className="text-[#C62828]">{marginGap}%</strong>
              </div>
            )}
          </div>
        </div>

        {/* Interactive Map Tile Container */}
        <div
          className={`transition-all duration-300 ${
            isExpandedMap ? "md:col-span-12" : "md:col-span-5 lg:col-span-4"
          }`}
        >
          <div
            className={`relative w-full rounded-xl overflow-hidden border border-[#E2E6D8] bg-[#1A2016] shadow-inner transition-all duration-300 flex items-center justify-center ${
              isExpandedMap ? "h-72 sm:h-80" : "h-36 sm:h-40"
            }`}
          >
            {isLoadingMap && (
              <div className="absolute inset-0 bg-[#1A2016]/70 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center text-white gap-1.5">
                <Loader2 className="w-5 h-5 text-[#4CAF50] animate-spin" />
                <span className="text-[10px] font-mono font-semibold">Updating GCP Tile...</span>
              </div>
            )}

            {mapTileUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={mapTileUrl}
                alt={`Location map for ${name}`}
                className="w-full h-full object-cover transition-all"
              />
            ) : mapError ? (
              <div className="text-center p-2 text-white/70 text-[10px] font-mono flex flex-col items-center gap-1">
                <MapPin className="w-4 h-4 text-[#C62828]" />
                <span>Map Tile Unavailable</span>
              </div>
            ) : null}

            {/* Floating Glassmorphism Map Control Buttons */}
            <div className="absolute top-2 right-2 z-20 flex items-center gap-1 bg-[#1A2016]/85 backdrop-blur-md p-1 rounded-lg border border-white/20 shadow-md">
              <button
                type="button"
                onClick={() => setZoom((prev) => Math.min(prev + 1, 19))}
                disabled={zoom >= 19 || isLoadingMap}
                className="p-1 rounded bg-white/10 hover:bg-white/30 text-white transition-all disabled:opacity-40 cursor-pointer"
                title="Zoom In (+)"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setZoom((prev) => Math.max(prev - 1, 12))}
                disabled={zoom <= 12 || isLoadingMap}
                className="p-1 rounded bg-white/10 hover:bg-white/30 text-white transition-all disabled:opacity-40 cursor-pointer"
                title="Zoom Out (-)"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setZoom(15)}
                disabled={zoom === 15 || isLoadingMap}
                className="p-1 rounded bg-white/10 hover:bg-white/30 text-white transition-all disabled:opacity-40 cursor-pointer"
                title="Reset Zoom (15x)"
              >
                <RotateCcw className="w-3 h-3" />
              </button>

              <div className="w-px h-3.5 bg-white/30 my-auto" />

              <button
                type="button"
                onClick={() => setIsExpandedMap(!isExpandedMap)}
                className="p-1 rounded bg-white/10 hover:bg-white/30 text-white transition-all cursor-pointer"
                title={isExpandedMap ? "Collapse View" : "Expand Map View"}
              >
                {isExpandedMap ? (
                  <Minimize2 className="w-3.5 h-3.5" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Bottom Location Info Badge */}
            <div className="absolute bottom-2 left-2 z-20 bg-[#1A2016]/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20 text-white text-[9.5px] font-mono flex items-center gap-1.5 shadow-md">
              <MapPin className="w-3 h-3 text-[#4CAF50] shrink-0" />
              <span>
                Zoom: <strong>{zoom}x</strong> · GCP Maps
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Core Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2 pt-3 border-t border-[#E2E6D8]">
        <div className="bg-[#FAFBF6] p-2.5 rounded-lg border border-[#E2E6D8]">
          <div className="text-[10px] text-[#5F6656]">Total Buffer Days</div>
          <div className="text-xs font-mono font-bold text-[#1A2016] mt-0.5">
            {bufferDays} Days
          </div>
        </div>

        <div className="bg-[#FAFBF6] p-2.5 rounded-lg border border-[#E2E6D8]">
          <div className="text-[10px] text-[#5F6656]">Net Buffer Days</div>
          <div
            className={`text-xs font-mono font-bold mt-0.5 ${
              netBufferDays < 0 ? "text-[#C62828]" : "text-[#2E7D32]"
            }`}
          >
            {netBufferDays} Days
          </div>
        </div>

        <div className="bg-[#FAFBF6] p-2.5 rounded-lg border border-[#E2E6D8]">
          <div className="text-[10px] text-[#5F6656]">Credit Headroom</div>
          <div className="text-xs font-mono font-bold text-[#1A2016] mt-0.5">
            {formatCurrency(creditHeadroom)}
          </div>
        </div>

        <div className="bg-[#FAFBF6] p-2.5 rounded-lg border border-[#E2E6D8]">
          <div className="text-[10px] text-[#5F6656]">Bridge Headroom</div>
          <div className="text-xs font-mono font-bold text-[#2E7D32] mt-0.5">
            {formatCurrency(bridgeHeadroom)}
          </div>
        </div>

        <div className="bg-[#FAFBF6] p-2.5 rounded-lg border border-[#E2E6D8] col-span-2 sm:col-span-1">
          <div className="text-[10px] text-[#5F6656]">Model Risk Score</div>
          <div className="text-xs font-mono font-bold text-[#C62828] mt-0.5">
            {scorePct}%
          </div>
        </div>
      </div>
    </div>
  );
}
