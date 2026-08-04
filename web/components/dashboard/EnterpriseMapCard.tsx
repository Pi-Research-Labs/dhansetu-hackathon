"use client";

import React, { useState, useEffect } from "react";
import { fetchMapTileBlobUrl } from "@/utils/api-config";
import { MapPin, Plus, Minus, RotateCcw, Maximize2, Minimize2, Loader2, Navigation, Layers } from "lucide-react";

interface EnterpriseMapCardProps {
  enterpriseId: string;
  enterpriseName: string;
  district?: string;
}

export default function EnterpriseMapCard({
  enterpriseId,
  enterpriseName,
  district = "Gujarat",
}: EnterpriseMapCardProps) {
  const [zoom, setZoom] = useState<number>(15);
  const [mapTileUrl, setMapTileUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch map tile whenever enterpriseId or zoom level changes
  useEffect(() => {
    if (!enterpriseId) return;

    let isMounted = true;

    async function loadTile() {
      setIsLoading(true);
      setError(null);

      try {
        const size = isExpanded ? "640x400" : "500x300";
        const url = await fetchMapTileBlobUrl(enterpriseId, zoom, size);
        if (isMounted) {
          setMapTileUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return url;
          });
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Map tile unavailable");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadTile();

    return () => {
      isMounted = false;
    };
  }, [enterpriseId, zoom, isExpanded]);

  // Clean up blob URL on unmount
  useEffect(() => {
    return () => {
      if (mapTileUrl) {
        URL.revokeObjectURL(mapTileUrl);
      }
    };
  }, [mapTileUrl]);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 1, 19));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 1, 12));
  };

  const handleResetZoom = () => {
    setZoom(15);
  };

  return (
    <div
      className={`bg-white border border-[#E2E6D8] rounded-2xl shadow-2xs overflow-hidden transition-all duration-300 relative ${
        isExpanded ? "p-5 ring-2 ring-[#2E7D32]" : "p-4"
      }`}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E2E6D8]">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-[#2E7D32]" />
          <h3 className="text-xs font-bold text-[#1A2016] uppercase tracking-wider">
            GCP Server-Side Shop Location Map
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold text-[#2E7D32] bg-[#E8F5E9] px-2 py-0.5 rounded border border-[#2E7D32]/30 flex items-center gap-1">
            <Layers className="w-3 h-3" />
            Zoom: {zoom}x
          </span>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-lg text-[#5F6656] hover:text-[#1A2016] hover:bg-[#FAFBF6] border border-[#E2E6D8] transition-colors cursor-pointer"
            title={isExpanded ? "Collapse View" : "Expand Map View"}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Map Tile Container */}
      <div
        className={`relative w-full rounded-xl overflow-hidden border border-[#E2E6D8] bg-[#1A2016] shadow-inner transition-all duration-300 flex items-center justify-center ${
          isExpanded ? "h-80 sm:h-96" : "h-48 sm:h-56"
        }`}
      >
        {isLoading && (
          <div className="absolute inset-0 bg-[#1A2016]/70 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center text-white gap-2 transition-all">
            <Loader2 className="w-6 h-6 text-[#4CAF50] animate-spin" />
            <span className="text-[11px] font-mono font-semibold">Updating GCP Satellite View...</span>
          </div>
        )}

        {mapTileUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={mapTileUrl}
            alt={`Location map for ${enterpriseName}`}
            className="w-full h-full object-cover transition-all"
          />
        ) : error ? (
          <div className="text-center p-4 text-white/70 text-xs font-mono flex flex-col items-center gap-1.5">
            <MapPin className="w-6 h-6 text-[#C62828]" />
            <span>{error}</span>
          </div>
        ) : null}

        {/* Custom Glassmorphism Map Control Buttons */}
        <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5 bg-[#1A2016]/80 backdrop-blur-md p-1.5 rounded-xl border border-white/20 shadow-md">
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoom >= 19 || isLoading}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/25 text-white transition-all disabled:opacity-40 cursor-pointer"
            title="Zoom In (+)"
          >
            <Plus className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoom <= 12 || isLoading}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/25 text-white transition-all disabled:opacity-40 cursor-pointer"
            title="Zoom Out (-)"
          >
            <Minus className="w-4 h-4" />
          </button>

          <div className="w-full h-px bg-white/20 my-0.5" />

          <button
            type="button"
            onClick={handleResetZoom}
            disabled={zoom === 15 || isLoading}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/25 text-white transition-all disabled:opacity-40 cursor-pointer"
            title="Reset Zoom (15x)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bottom Location Info Badge */}
        <div className="absolute bottom-3 left-3 z-20 bg-[#1A2016]/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-white text-[10.5px] font-mono flex items-center gap-2 shadow-md">
          <MapPin className="w-3.5 h-3.5 text-[#4CAF50] shrink-0" />
          <div>
            <span className="font-bold">{enterpriseName}</span>
            <span className="text-white/70 block text-[9.5px]">{district} Centroid Offset</span>
          </div>
        </div>
      </div>
    </div>
  );
}
