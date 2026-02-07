"use client";

import { useRef, useState, useCallback } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "@vnedyalk0v/react19-simple-maps";
import type { Coordinates, ProjectionConfig } from "@vnedyalk0v/react19-simple-maps";
import topology from "../../public/data/countries-110m.json";

const coord = (lng: number, lat: number) => [lng, lat] as unknown as Coordinates;

const HOTSPOTS: {
  coords: Coordinates;
  size: "lg" | "md" | "sm";
  label: string;
}[] = [
  { coords: coord(120.98, 14.6), size: "lg", label: "MNL" },
  { coords: coord(123.9, 10.3), size: "md", label: "CEB" },
  { coords: coord(121.0, 11.0), size: "sm", label: "" },
  { coords: coord(103.85, 1.35), size: "lg", label: "SIN" },
  { coords: coord(104.0, 2.5), size: "md", label: "" },
  { coords: coord(100.5, 3.0), size: "sm", label: "" },
  { coords: coord(55.27, 25.2), size: "md", label: "DXB" },
  { coords: coord(72.88, 19.08), size: "sm", label: "" },
  { coords: coord(114.17, 22.32), size: "md", label: "HKG" },
  { coords: coord(151.21, -33.87), size: "lg", label: "SYD" },
  { coords: coord(139.69, 35.69), size: "sm", label: "" },
  { coords: coord(174.76, -36.85), size: "sm", label: "" },
  { coords: coord(106.85, 10.76), size: "sm", label: "" },
  { coords: coord(100.49, 13.76), size: "sm", label: "" },
];

const DOT_RADIUS = { lg: 5, md: 3.5, sm: 2 };
const PULSE_RADIUS = { lg: 12, md: 9, sm: 0 };

const MAP_STATS = [
  { value: "42%", highlight: true, label: "Remote-Friendly" },
  { value: "12", highlight: false, label: "Countries" },
  { value: "+24%", highlight: true, label: "Remote YoY" },
  { value: "1,240", highlight: false, label: "Total Remote" },
];

const MIN_ZOOM = 1;
const MAX_ZOOM = 6;
const MAP_W = 800;
const MAP_H = 400;

export function RemoteHeatmap() {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z - e.deltaY * 0.002)));
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setPan((p) => ({ x: p.x + dx / zoom, y: p.y + dy / zoom }));
  }, [zoom]);

  const onPointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  return (
    <div className="map-section">
      <div className="map-header">
        <div className="map-header-left">
          <div className="sec-title" style={{ fontSize: 18 }}>
            Remote Job Heatmap
          </div>
        </div>
        <div className="map-filters">
          <button className="map-filter active">All</button>
          <button className="map-filter">Tech</button>
          <button className="map-filter">BPO</button>
          <button className="map-filter">Design</button>
        </div>
      </div>
      <div
        className="map-body"
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        style={{ cursor: dragging.current ? "grabbing" : "grab", touchAction: "none" }}
      >
        <ComposableMap
          projection="geoEqualEarth"
          projectionConfig={{ center: coord(100, 5), scale: 280 } as ProjectionConfig}
          width={MAP_W}
          height={MAP_H}
          style={{ width: "100%", height: "100%" }}
        >
          <g transform={`translate(${MAP_W / 2 + pan.x} ${MAP_H / 2 + pan.y}) scale(${zoom}) translate(${-MAP_W / 2} ${-MAP_H / 2})`}>
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
            {HOTSPOTS.map((spot, i) => (
              <Marker key={i} coordinates={spot.coords}>
                {spot.size !== "sm" && (
                  <circle
                    r={PULSE_RADIUS[spot.size] / zoom}
                    className="map-marker-pulse"
                    style={{ animationDelay: `${i * 0.3}s` }}
                  />
                )}
                <circle
                  r={DOT_RADIUS[spot.size] / zoom}
                  className={`map-marker-dot dot-${spot.size}`}
                />
                {spot.label && (
                  <text
                    className="map-marker-label"
                    dy={16 / zoom}
                    textAnchor="middle"
                    style={{ fontSize: `${7 / zoom}px` }}
                  >
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
