"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  X,
  Navigation,
  Clock,
  ShieldCheck,
  MapPin,
  Truck,
  Phone,
  CheckCircle2,
  Radio,
  Share2,
  Check,
  Zap,
  RotateCcw,
} from "lucide-react";
import { OrderTrackingInfo } from "@/lib/types";

function CrosshairIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="8" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v4m0 12v4M2 12h4m12 0h4" />
    </svg>
  );
}

function BatteryChargingIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="2" y="6" width="16" height="12" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M22 10v4M10 9l-2 3h4l-2 3" />
    </svg>
  );
}

function GaugeIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 10l3-3m-7 5a4 4 0 018 0" />
    </svg>
  );
}

function PlayIcon({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M5 3l14 9-14 9V3z" />
    </svg>
  );
}

function PauseIcon({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
    </svg>
  );
}

interface SatelliteGpsModalProps {
  isOpen: boolean;
  onClose: () => void;
  trackingInfo?: OrderTrackingInfo | null;
  orderId?: string | number;
  productName?: string;
  carrier?: string;
  estimatedArrival?: string;
}

// Map layer modes
type MapLayerStyle = "dark" | "satellite" | "streets";

// Geographic coordinates type
interface LatLng {
  lat: number;
  lng: number;
}

// Sample authentic metro delivery path (e.g., Koramangala Hub to Bellandur Delivery Point)
const DEFAULT_ROUTE_WAYPOINTS: LatLng[] = [
  { lat: 12.9279, lng: 77.6271 }, // Hub: CartWise Micro-Fulfillment Center
  { lat: 12.9295, lng: 77.6285 },
  { lat: 12.9312, lng: 77.6302 },
  { lat: 12.9328, lng: 77.6291 },
  { lat: 12.9345, lng: 77.6274 },
  { lat: 12.9362, lng: 77.6261 },
  { lat: 12.9378, lng: 77.6248 }, // Customer Doorstep
];

// Helper to convert lat/lng to tile x/y in Web Mercator
function projectToMercator(lat: number, lng: number, zoom: number, tileSize = 256) {
  const scale = tileSize * Math.pow(2, zoom);
  const x = ((lng + 180) / 360) * scale;
  const sinLat = Math.sin((lat * Math.PI) / 180);
  const y = (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * scale;
  return { x, y };
}

// Helper to calculate bearing between two points
function calculateBearing(p1: LatLng, p2: LatLng): number {
  const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
  const lat1 = (p1.lat * Math.PI) / 180;
  const lat2 = (p2.lat * Math.PI) / 180;

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

  let brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

// Helper to interpolate along route
function interpolateRoute(
  waypoints: LatLng[],
  progress: number
): { point: LatLng; bearing: number; segmentIndex: number } {
  if (waypoints.length < 2) {
    return { point: waypoints[0], bearing: 0, segmentIndex: 0 };
  }

  const clampedProgress = Math.max(0, Math.min(1, progress));
  const totalSegments = waypoints.length - 1;
  const scaled = clampedProgress * totalSegments;
  const segmentIndex = Math.min(Math.floor(scaled), totalSegments - 1);
  const segmentFraction = scaled - segmentIndex;

  const p1 = waypoints[segmentIndex];
  const p2 = waypoints[segmentIndex + 1];

  const lat = p1.lat + (p2.lat - p1.lat) * segmentFraction;
  const lng = p1.lng + (p2.lng - p1.lng) * segmentFraction;
  const bearing = calculateBearing(p1, p2);

  return { point: { lat, lng }, bearing, segmentIndex };
}

export function SatelliteGpsModal({
  isOpen,
  onClose,
  trackingInfo,
  orderId = "#1040",
  productName = "Organic Raw Forest Honey (Cold-Extracted, 500g Jar)",
  carrier = "CartWise FastFleet Rider (Ramesh Kumar - Ather 450X EV)",
  estimatedArrival = "Today by 3:45 PM",
}: SatelliteGpsModalProps) {
  // Mapbox token from environment (or graceful high-res fallback)
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

  // View state
  const [mapLayer, setMapLayer] = useState<MapLayerStyle>("dark");
  const [zoom, setZoom] = useState(15);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isCallingRider, setIsCallingRider] = useState(false);

  // Telemetry simulation state
  const [routeProgress, setRouteProgress] = useState(0.42); // start mid-way
  const [isAutoSimulating, setIsAutoSimulating] = useState(true);
  const [speedKmh, setSpeedKmh] = useState(31);
  const [batteryLevel, setBatteryLevel] = useState(84);
  const [satelliteCount, setSatelliteCount] = useState(9);

  // Map panning offset relative to center point
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Container dimensions
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewSize, setViewSize] = useState({ width: 640, height: 340 });

  // Waypoints for the route
  const waypoints = useMemo(() => {
    if (trackingInfo?.originCoords && trackingInfo?.destinationCoords) {
      return [
        trackingInfo.originCoords,
        {
          lat: (trackingInfo.originCoords.lat + trackingInfo.destinationCoords.lat) / 2 + 0.002,
          lng: (trackingInfo.originCoords.lng + trackingInfo.destinationCoords.lng) / 2 - 0.001,
        },
        trackingInfo.destinationCoords,
      ];
    }
    return DEFAULT_ROUTE_WAYPOINTS;
  }, [trackingInfo]);

  // Interpolated position and bearing
  const { point: riderCoord, bearing } = useMemo(
    () => interpolateRoute(waypoints, routeProgress),
    [waypoints, routeProgress]
  );

  // Center coordinate (focused around rider by default)
  const centerCoord = useMemo(() => {
    return {
      lat: (waypoints[0].lat + waypoints[waypoints.length - 1].lat) / 2,
      lng: (waypoints[0].lng + waypoints[waypoints.length - 1].lng) / 2,
    };
  }, [waypoints]);

  // Update container size on resize
  useEffect(() => {
    if (!isOpen) return;
    const updateSize = () => {
      if (containerRef.current) {
        setViewSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [isOpen]);

  // Continuous live rider telemetry simulation
  useEffect(() => {
    if (!isOpen || !isAutoSimulating) return;

    const interval = setInterval(() => {
      setRouteProgress((prev) => {
        if (prev >= 0.98) return 0.98; // Arrived
        return prev + 0.006;
      });

      // Realistic speed fluctuation (24-38 km/h)
      setSpeedKmh(Math.floor(26 + Math.random() * 12));

      // Occasional satellite fluctuation
      if (Math.random() > 0.7) {
        setSatelliteCount(Math.random() > 0.5 ? 9 : 8);
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [isOpen, isAutoSimulating]);

  // Project point to screen coordinates
  const projectPointToScreen = useCallback(
    (coord: LatLng) => {
      const centerProj = projectToMercator(centerCoord.lat, centerCoord.lng, zoom);
      const targetProj = projectToMercator(coord.lat, coord.lng, zoom);

      return {
        x: viewSize.width / 2 + (targetProj.x - centerProj.x) + panOffset.x,
        y: viewSize.height / 2 + (targetProj.y - centerProj.y) + panOffset.y,
      };
    },
    [centerCoord, zoom, viewSize, panOffset]
  );

  // Route screen path string for SVG
  const routePathSvg = useMemo(() => {
    if (waypoints.length === 0) return "";
    return waypoints
      .map((wp, idx) => {
        const pt = projectPointToScreen(wp);
        return `${idx === 0 ? "M" : "L"} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
      })
      .join(" ");
  }, [waypoints, projectPointToScreen]);

  // Traveled portion of route
  const riderScreenPt = useMemo(
    () => projectPointToScreen(riderCoord),
    [riderCoord, projectPointToScreen]
  );
  const originScreenPt = useMemo(
    () => projectPointToScreen(waypoints[0]),
    [waypoints, projectPointToScreen]
  );
  const destScreenPt = useMemo(
    () => projectPointToScreen(waypoints[waypoints.length - 1]),
    [waypoints, projectPointToScreen]
  );

  // Recenter on rider
  const handleRecenterOnRider = () => {
    const centerProj = projectToMercator(centerCoord.lat, centerCoord.lng, zoom);
    const riderProj = projectToMercator(riderCoord.lat, riderCoord.lng, zoom);

    setPanOffset({
      x: -(riderProj.x - centerProj.x),
      y: -(riderProj.y - centerProj.y),
    });
  };

  // Drag / Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Copy share link
  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(
        `${window.location.origin}/?track=${String(orderId).replace("#", "")}`
      );
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Distance remaining computation
  const totalKm = 2.1;
  const remainingKm = Math.max(0.1, Number((totalKm * (1 - routeProgress)).toFixed(1)));
  const remainingMins = Math.max(1, Math.round(12 * (1 - routeProgress)));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-950 border border-amber-500/30 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col text-slate-100 relative">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/4 right-1/4 h-1 bg-linear-to-r from-transparent via-amber-400 to-transparent opacity-80" />

        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-xs">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-white tracking-tight flex items-center gap-1.5">
                  <span>Live Mapbox Telemetry</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-950 border border-emerald-500/40 text-emerald-300">
                  {routeProgress >= 0.95 ? "ARRIVING NOW" : "DISPATCH IN-TRANSIT"}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Order {orderId} • Ather 450X EV Telemetry Connected
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              title="Share Live Tracking Link"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[11px] text-emerald-400 font-semibold hidden sm:inline">
                    Copied
                  </span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="text-[11px] hidden sm:inline">Share</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Interactive Mapbox Canvas & Telemetry HUD */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={`relative h-72 sm:h-96 w-full overflow-hidden select-none cursor-grab active:cursor-grabbing border-b border-slate-800 ${
            mapLayer === "satellite"
              ? "bg-[#0b1320]"
              : mapLayer === "streets"
              ? "bg-[#1e293b]"
              : "bg-[#090d16]"
          }`}
        >
          {/* Simulated High-Res Vector Map Tiles Pattern */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity"
            style={{
              backgroundImage:
                mapLayer === "satellite"
                  ? "radial-gradient(circle, rgba(16, 185, 129, 0.12) 1px, transparent 1px), linear-gradient(to right, rgba(51, 65, 85, 0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(51, 65, 85, 0.4) 1px, transparent 1px)"
                  : "radial-gradient(circle, rgba(245, 158, 11, 0.15) 1px, transparent 1px), linear-gradient(to right, rgba(30, 41, 59, 0.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(30, 41, 59, 0.6) 1px, transparent 1px)",
              backgroundSize: "24px 24px, 48px 48px, 48px 48px",
              backgroundPosition: `${panOffset.x}px ${panOffset.y}px`,
            }}
          />

          {/* SVG Map Routes & Pins Overlay */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>

              {/* Glowing filter */}
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Background Planned Route (Glow) */}
            <path
              d={routePathSvg}
              fill="none"
              stroke="#0f172a"
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.8"
            />
            <path
              d={routePathSvg}
              fill="none"
              stroke="#334155"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Glowing Active Trajectory Line */}
            <path
              d={routePathSvg}
              fill="none"
              stroke="url(#routeGradient)"
              strokeWidth="3.5"
              strokeDasharray="8 4"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow)"
              className="animate-pulse"
            />
          </svg>

          {/* Store Origin Pin */}
          <div
            className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-75"
            style={{ left: originScreenPt.x, top: originScreenPt.y }}
          >
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/90 text-emerald-300 border border-emerald-500/30 whitespace-nowrap shadow-md">
                Hub Bellandur
              </span>
            </div>
          </div>

          {/* Customer Destination Pin */}
          <div
            className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-75"
            style={{ left: destScreenPt.x, top: destScreenPt.y }}
          >
            <div className="flex flex-col items-center">
              <div className="relative">
                <span className="absolute -inset-1 rounded-full bg-amber-500/30 animate-ping" />
                <div className="w-8 h-8 rounded-full bg-amber-500 border-2 border-white text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/40 relative z-10">
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                </div>
              </div>
              <span className="mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/90 text-amber-300 border border-amber-500/30 whitespace-nowrap shadow-md">
                Your Doorstep
              </span>
            </div>
          </div>

          {/* Real-time Moving Ather 450X EV Scooter Rider */}
          <div
            className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-300 ease-out"
            style={{ left: riderScreenPt.x, top: riderScreenPt.y }}
          >
            <div className="relative flex items-center justify-center">
              {/* Radar waves pulsing from vehicle */}
              <span className="absolute w-14 h-14 rounded-full bg-amber-400/20 border border-amber-400/40 animate-ping" />
              <span className="absolute w-10 h-10 rounded-full bg-emerald-400/20 animate-pulse" />

              {/* Vehicle Indicator with Dynamic Compass Heading Rotation */}
              <div
                className="w-10 h-10 rounded-full bg-slate-950 border-2 border-amber-400 text-amber-300 flex items-center justify-center shadow-2xl relative z-10 transition-transform duration-500"
                style={{ transform: `rotate(${Math.round(bearing)}deg)` }}
                title={`Heading: ${Math.round(bearing)}°`}
              >
                <Navigation className="w-5 h-5 fill-amber-400 text-amber-400" />
              </div>

              {/* Rider Tag Badge */}
              <div className="absolute -top-7 whitespace-nowrap bg-slate-950/95 border border-amber-500/40 px-2 py-0.5 rounded-full text-[10px] font-bold text-amber-300 shadow-md flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Rider #412 • {speedKmh} km/h</span>
              </div>
            </div>
          </div>

          {/* Top Left: Live HUD Telemetry Widget */}
          <div className="absolute top-3 left-3 bg-slate-950/90 backdrop-blur-md border border-slate-800 p-2.5 rounded-xl shadow-xl text-xs space-y-1.5 z-20 pointer-events-auto max-w-[210px] sm:max-w-xs">
            <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-1.5">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>RTK GPS LOCKED</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {satelliteCount} Sats
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-0.5">
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-bold">Speed</span>
                <span className="text-white font-mono font-bold flex items-center gap-1">
                  <GaugeIcon className="w-3 h-3 text-amber-400" />
                  {speedKmh} km/h
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-bold">Battery</span>
                <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                  <BatteryChargingIcon className="w-3 h-3 text-emerald-400" />
                  {batteryLevel}% EV
                </span>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-800/80 truncate">
              {riderCoord.lat.toFixed(4)}°N, {riderCoord.lng.toFixed(4)}°E
            </div>
          </div>

          {/* Top Right: Layer Switcher & Map Controls */}
          <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-20 pointer-events-auto">
            {/* Map Layer Switcher */}
            <div className="flex items-center bg-slate-950/90 backdrop-blur-md border border-slate-800 p-1 rounded-xl shadow-lg">
              <button
                onClick={() => setMapLayer("dark")}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  mapLayer === "dark"
                    ? "bg-amber-500 text-slate-950 shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Dark
              </button>
              <button
                onClick={() => setMapLayer("satellite")}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  mapLayer === "satellite"
                    ? "bg-amber-500 text-slate-950 shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Satellite
              </button>
              <button
                onClick={() => setMapLayer("streets")}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  mapLayer === "streets"
                    ? "bg-amber-500 text-slate-950 shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Street
              </button>
            </div>

            {/* Recenter & Zoom Controls */}
            <div className="flex items-center justify-end gap-1">
              <button
                onClick={handleRecenterOnRider}
                className="p-2 rounded-xl bg-slate-950/90 hover:bg-slate-800 text-amber-400 border border-slate-800 shadow-md transition-colors cursor-pointer"
                title="Recenter on Rider"
              >
                <CrosshairIcon className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center bg-slate-950/90 border border-slate-800 rounded-xl overflow-hidden shadow-md">
                <button
                  onClick={() => setZoom((z) => Math.min(18, z + 1))}
                  className="px-2 py-1 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Zoom In"
                >
                  +
                </button>
                <button
                  onClick={() => setZoom((z) => Math.max(13, z - 1))}
                  className="px-2 py-1 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Zoom Out"
                >
                  -
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Left: Live ETA Card */}
          <div className="absolute bottom-3 left-3 bg-slate-950/90 backdrop-blur-md border border-amber-500/30 px-3 py-2 rounded-xl shadow-xl z-20 pointer-events-auto">
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
              Doorstep Arrival
            </div>
            <div className="text-sm sm:text-base font-black text-amber-400 font-mono flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>{remainingMins} mins ({remainingKm} km away)</span>
            </div>
          </div>

          {/* Bottom Right: Simulation Speed Controls for Testing */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-slate-950/90 backdrop-blur-md border border-slate-800 p-1 rounded-xl z-20 pointer-events-auto">
            <button
              onClick={() => setIsAutoSimulating(!isAutoSimulating)}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
              title={isAutoSimulating ? "Pause Simulation" : "Resume Simulation"}
            >
              {isAutoSimulating ? <PauseIcon className="w-3 h-3 text-amber-400" /> : <PlayIcon className="w-3 h-3 text-emerald-400" />}
              <span className="hidden sm:inline">{isAutoSimulating ? "Pause" : "Play"}</span>
            </button>

            <button
              onClick={() => setRouteProgress(0.96)}
              className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold transition-all cursor-pointer"
              title="Fast-forward rider to arrival"
            >
              Fast-Forward Arrival
            </button>
          </div>
        </div>

        {/* Order Details & Courier Partner Section */}
        <div className="p-4 sm:p-5 space-y-4 bg-slate-950">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl gap-3">
            <div className="space-y-0.5 min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Current Package Dispatched
              </span>
              <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                {productName}
              </h4>
              <p className="text-xs text-slate-400 font-mono">
                Order Tracking ID: {orderId}
              </p>
            </div>

            <div className="sm:text-right shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                Logistics Dispatch Status
              </span>
              <span className="text-xs sm:text-sm font-black text-amber-400 font-mono">
                {routeProgress >= 0.95 ? "Arrived at Doorstep" : "Out for 15-Min Delivery"}
              </span>
            </div>
          </div>

          {/* Assigned Courier Rider Details Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-1 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-linear-to-tr from-amber-500 to-amber-300 text-slate-950 font-black flex items-center justify-center text-sm shadow-md">
                RK
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">Ramesh Kumar</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-500/40">
                    ★ 4.9 (1,240 deliveries)
                  </span>
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  Vehicle: Ather 450X EV (KA-03-HA-8821)
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCallingRider(true)}
                className="px-3.5 py-2 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-950 active:scale-98"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Courier (+91 98451 22890)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:px-5 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Encrypted Satellite Telemetry • Contactless Verification</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors cursor-pointer text-center"
          >
            Close Tracking Map
          </button>
        </div>
      </div>

      {/* Rider Call Dialog Simulation */}
      {isCallingRider && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
          <div className="bg-slate-900 border border-emerald-500/40 p-5 rounded-2xl max-w-sm w-full text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto animate-pulse">
              <Phone className="w-7 h-7" />
            </div>

            <div>
              <h4 className="font-bold text-white text-base">Calling Ramesh Kumar...</h4>
              <p className="text-xs text-slate-400 mt-1">FastFleet Delivery Executive (KA-03-HA-8821)</p>
              <p className="text-sm font-mono text-emerald-400 mt-2 font-bold">+91 98451 22890</p>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-400">
              Rider is currently on EV transit (Speed: {speedKmh} km/h). Hands-free helmet intercom connected.
            </div>

            <button
              onClick={() => setIsCallingRider(false)}
              className="w-full py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              End Call
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
