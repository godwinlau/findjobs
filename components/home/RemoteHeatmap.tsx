"use client";

import { useRef, useEffect, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "@vnedyalk0v/react19-simple-maps";
import type { Coordinates, ProjectionConfig } from "@vnedyalk0v/react19-simple-maps";
import topology from "../../public/data/countries-110m.json";

const coord = (lng: number, lat: number) => [lng, lat] as unknown as Coordinates;

type Category = "tech" | "bpo" | "design";

const HOTSPOTS: {
  coords: Coordinates;
  size: "lg" | "md" | "sm";
  label: string;
  categories: Category[];
}[] = [
  { coords: coord(120.98, 14.6), size: "lg", label: "MNL", categories: ["tech", "bpo"] },
  { coords: coord(123.9, 10.3), size: "md", label: "CEB", categories: ["bpo"] },
  { coords: coord(121.0, 11.0), size: "sm", label: "", categories: ["bpo"] },
  { coords: coord(103.85, 1.35), size: "lg", label: "SIN", categories: ["tech", "design"] },
  { coords: coord(104.0, 2.5), size: "md", label: "", categories: ["tech"] },
  { coords: coord(100.5, 3.0), size: "sm", label: "", categories: ["tech", "bpo"] },
  { coords: coord(55.27, 25.2), size: "md", label: "DXB", categories: ["bpo", "tech"] },
  { coords: coord(72.88, 19.08), size: "sm", label: "", categories: ["tech", "bpo"] },
  { coords: coord(114.17, 22.32), size: "md", label: "HKG", categories: ["tech"] },
  { coords: coord(151.21, -33.87), size: "lg", label: "SYD", categories: ["tech", "design"] },
  { coords: coord(139.69, 35.69), size: "sm", label: "", categories: ["tech", "design"] },
  { coords: coord(174.76, -36.85), size: "sm", label: "", categories: ["tech"] },
  { coords: coord(106.85, 10.76), size: "sm", label: "", categories: ["tech", "bpo"] },
  { coords: coord(100.49, 13.76), size: "sm", label: "", categories: ["bpo", "design"] },
];

const FILTERS = [
  { key: "all", label: "All" },
  { key: "tech", label: "Tech" },
  { key: "bpo", label: "BPO" },
  { key: "design", label: "Design" },
] as const;

const DOT_RADIUS = { lg: 5, md: 3.5, sm: 2 };
const PULSE_RADIUS = { lg: 12, md: 9, sm: 0 };

const MAP_STATS = [
  { value: "42%", highlight: true, label: "Remote-Friendly" },
  { value: "12", highlight: false, label: "Countries" },
  { value: "+24%", highlight: true, label: "Remote YoY" },
  { value: "1,240", highlight: false, label: "Total Remote" },
];

const MAP_W = 800;
const MAP_H = 400;

export function RemoteHeatmap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const state = useRef({ zoom: 1, panX: 0, panY: 0, dragging: false, lastX: 0, lastY: 0 });
  const [activeFilter, setActiveFilter] = useState("all");

  const applyTransform = () => {
    const g = gRef.current;
    if (!g) return;
    const { zoom, panX, panY } = state.current;
    g.setAttribute(
      "transform",
      `translate(${MAP_W / 2 + panX} ${MAP_H / 2 + panY}) scale(${zoom}) translate(${-MAP_W / 2} ${-MAP_H / 2})`
    );
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const s = state.current;
      s.zoom = Math.min(6, Math.max(1, s.zoom - e.deltaY * 0.002));
      applyTransform();
    };

    const onPointerDown = (e: PointerEvent) => {
      const s = state.current;
      s.dragging = true;
      s.lastX = e.clientX;
      s.lastY = e.clientY;
      el.setPointerCapture(e.pointerId);
      el.style.cursor = "grabbing";
    };

    const onPointerMove = (e: PointerEvent) => {
      const s = state.current;
      if (!s.dragging) return;
      s.panX += (e.clientX - s.lastX) / s.zoom;
      s.panY += (e.clientY - s.lastY) / s.zoom;
      s.lastX = e.clientX;
      s.lastY = e.clientY;
      applyTransform();
    };

    const onPointerUp = () => {
      state.current.dragging = false;
      el.style.cursor = "grab";
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointerleave", onPointerUp);

    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointerleave", onPointerUp);
    };
  }, []);

  const visibleSpots = activeFilter === "all"
    ? HOTSPOTS
    : HOTSPOTS.filter((s) => s.categories.includes(activeFilter as Category));

  return (
    <div className="map-section">
      <div className="map-header">
        <div className="map-header-left">
          <div className="sec-title" style={{ fontSize: 18 }}>
            Remote Job Heatmap
          </div>
        </div>
        <div className="map-filters">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={`map-filter${activeFilter === f.key ? " active" : ""}`}
              onClick={() => setActiveFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <div
        ref={containerRef}
        className="map-body"
        style={{ cursor: "grab", touchAction: "none" }}
      >
        <ComposableMap
          projection="geoEqualEarth"
          projectionConfig={{ center: coord(100, 5), scale: 280 } as ProjectionConfig}
          width={MAP_W}
          height={MAP_H}
          style={{ width: "100%", height: "100%" }}
        >
          <g ref={gRef}>
            <Geographies geography={topology}>
              {({ geographies }) =>
                geographies.map((geo, i) => (
                  <Geography
                    key={i}
                    geography={geo}
                    className="map-country"
                    tabIndex={-1}
                    style={{
                      default: { outline: "none" },
                      hover: { outline: "none" },
                      pressed: { outline: "none" },
                    }}
                  />
                ))
              }
            </Geographies>
            {visibleSpots.map((spot, i) => (
              <Marker key={i} coordinates={spot.coords}>
                {spot.size !== "sm" && (
                  <circle
                    r={PULSE_RADIUS[spot.size]}
                    className="map-marker-pulse"
                    style={{ animationDelay: `${i * 0.3}s` }}
                  />
                )}
                <circle
                  r={DOT_RADIUS[spot.size]}
                  className={`map-marker-dot dot-${spot.size}`}
                />
                {spot.label && (
                  <text className="map-marker-label" dy={16} textAnchor="middle">
                    {spot.label}
                  </text>
                )}
              </Marker>
            ))}
          </g>
        </ComposableMap>
      </div>
      <div className="map-stats">
        {MAP_STATS.map((stat) => (
          <div key={stat.label} className="map-stat">
            <div className="map-stat-val">
              {stat.highlight ? <span>{stat.value}</span> : stat.value}
            </div>
            <div className="map-stat-label">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
