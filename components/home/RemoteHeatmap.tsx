const MAP_DOTS = [
  { top: "35%", left: "18%", size: "lg", label: "MNL" },
  { top: "38%", left: "22%", size: "md", label: "CEB" },
  { top: "42%", left: "20%", size: "sm", label: "" },
  { top: "30%", left: "52%", size: "lg", label: "SIN" },
  { top: "28%", left: "55%", size: "md", label: "" },
  { top: "32%", left: "48%", size: "sm", label: "" },
  { top: "25%", left: "40%", size: "md", label: "DXB" },
  { top: "35%", left: "30%", size: "sm", label: "" },
  { top: "28%", left: "62%", size: "md", label: "HKG" },
  { top: "48%", left: "78%", size: "lg", label: "SYD" },
  { top: "22%", left: "75%", size: "sm", label: "" },
  { top: "32%", left: "82%", size: "sm", label: "" },
  { top: "45%", left: "15%", size: "sm", label: "" },
  { top: "55%", left: "25%", size: "sm", label: "" },
];

const MAP_STATS = [
  { value: "42%", highlight: true, label: "Remote-Friendly" },
  { value: "12", highlight: false, label: "Countries" },
  { value: "+24%", highlight: true, label: "Remote YoY" },
  { value: "1,240", highlight: false, label: "Total Remote" },
];

export function RemoteHeatmap() {
  return (
    <div className="map-section">
      <div className="map-header">
        <div className="map-header-left">
          <div className="sec-title" style={{ fontSize: 18 }}>Remote Job Heatmap</div>
        </div>
        <div className="map-filters">
          <button className="map-filter active">All</button>
          <button className="map-filter">Tech</button>
          <button className="map-filter">BPO</button>
          <button className="map-filter">Design</button>
        </div>
      </div>
      <div className="map-body">
        {MAP_DOTS.map((dot, i) => (
          <div
            key={i}
            className={`map-dot dot-${dot.size}`}
            style={{ top: dot.top, left: dot.left }}
            data-label={dot.label}
          />
        ))}
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
