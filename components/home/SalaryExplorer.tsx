const SALARY_ROWS = [
  { label: "Software Dev", left: 18, width: 48, avg: 46, range: "\u20B125K \u2013 \u20B180K" },
  { label: "UI/UX Designer", left: 15, width: 42, avg: 38, range: "\u20B120K \u2013 \u20B165K" },
  { label: "Data Analyst", left: 20, width: 44, avg: 42, range: "\u20B122K \u2013 \u20B170K" },
  { label: "BPO Agent", left: 10, width: 30, avg: 25, range: "\u20B115K \u2013 \u20B135K" },
  { label: "VA / Admin", left: 12, width: 28, avg: 26, range: "\u20B115K \u2013 \u20B140K" },
  { label: "Marketing", left: 16, width: 40, avg: 36, range: "\u20B118K \u2013 \u20B160K" },
];

export function SalaryExplorer() {
  return (
    <div className="salary-full">
      <div className="sal-left">
        <span className="sec-label" style={{ color: "rgba(255,255,255,.25)" }}>// market data</span>
        <div className="sec-title" style={{ color: "var(--hb-inv)", fontSize: 22 }}>Salary Explorer</div>
        <p className="sal-desc">Median salaries based on active job postings across the Philippines.</p>
        <div className="sal-big">
          <div className="sal-big-val">{"\u20B1"}35K</div>
          <div className="sal-big-label">Median Monthly Salary</div>
        </div>
      </div>
      <div className="sal-right">
        {SALARY_ROWS.map((row) => (
          <div key={row.label} className="sal-row">
            <span className="sal-row-label">{row.label}</span>
            <div className="sal-row-track">
              <div className="sal-row-fill" style={{ left: `${row.left}%`, width: `${row.width}%` }} />
              <div className="sal-row-avg" style={{ left: `${row.avg}%` }} />
            </div>
            <span className="sal-row-val">{row.range}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
