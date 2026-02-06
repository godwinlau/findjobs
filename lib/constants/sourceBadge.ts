/**
 * Source badge configuration — brutalist border-only style.
 * Known sources get brand-colored borders, unknown get deterministic colors.
 */

interface SourceBadgeColors {
  /** Border + text color (same in brutalist style) */
  border: string;
  /** Icon fill color (same as border for consistency) */
  icon: string;
}

/**
 * SVG path data for known source brand icons.
 * Each entry is [viewBox, pathData, fill?] where fill defaults to "currentColor".
 */
export const SOURCE_ICONS: Record<string, string> = {
  linkedin:
    "M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z",
  jsearch:
    "M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z",
  glassdoor:
    "M17.14 2H8v2.5h9.14c.47 0 .86.39.86.86v11.78H8V20h10a2 2 0 002-2V4a2 2 0 00-2.86-1.8V2zM6.86 22H16v-2.5H6.86a.86.86 0 01-.86-.86V6.86H16V4H6a2 2 0 00-2 2v14a2 2 0 002.86 1.8V22z",
  wellfound:
    "M12 2L2 19.5h20L12 2zm0 4l6.5 11.5h-13L12 6z",
  indeed:
    "M13.5 2C11 2 9 4 9 6.5V18c0 1.7 1.3 3 3 3s3-1.3 3-3V6.5C15 4 14.3 2 13.5 2z",
  remoteok:
    "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z",
};

/**
 * Brutalist source colors: border-only, no fill backgrounds.
 * On dark cards (hero), use lighter tints; on light cards (std), use deeper tones.
 */
const KNOWN_SOURCES: Record<string, { label: string; colors: SourceBadgeColors; heroColors?: SourceBadgeColors }> = {
  linkedin: {
    label: "LinkedIn",
    colors: { border: "#4338CA", icon: "#4338CA" },
    heroColors: { border: "#818CF8", icon: "#818CF8" },
  },
  jsearch: {
    label: "Google Jobs",
    colors: { border: "#137333", icon: "#34A853" },
    heroColors: { border: "#6EE7B7", icon: "#6EE7B7" },
  },
  indeed: {
    label: "Indeed",
    colors: { border: "#B45309", icon: "#B45309" },
    heroColors: { border: "#FBBF24", icon: "#FBBF24" },
  },
  glassdoor: {
    label: "Glassdoor",
    colors: { border: "#0CAA41", icon: "#0CAA41" },
    heroColors: { border: "#6EE7B7", icon: "#6EE7B7" },
  },
  wellfound: {
    label: "Wellfound",
    colors: { border: "#0A0A0A", icon: "#0A0A0A" },
    heroColors: { border: "#F5F5F0", icon: "#F5F5F0" },
  },
  remoteok: {
    label: "Remote OK",
    colors: { border: "#B45309", icon: "#F59E0B" },
    heroColors: { border: "#FBBF24", icon: "#FBBF24" },
  },
  kalibrr: {
    label: "Kalibrr",
    colors: { border: "#2E7D32", icon: "#2E7D32" },
    heroColors: { border: "#6EE7B7", icon: "#6EE7B7" },
  },
  jobstreet: {
    label: "JobStreet",
    colors: { border: "#1565C0", icon: "#1565C0" },
    heroColors: { border: "#818CF8", icon: "#818CF8" },
  },
  onlinejobs: {
    label: "OnlineJobs.ph",
    colors: { border: "#E65100", icon: "#E65100" },
    heroColors: { border: "#FBBF24", icon: "#FBBF24" },
  },
};

// Hue palette for unknown sources — avoids reds (error-like)
const HUE_PALETTE = [210, 170, 260, 30, 140, 310, 45, 190, 280, 90];

function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = str.charCodeAt(i) + ((h << 5) - h);
  }
  return Math.abs(h);
}

function generateColors(source: string): SourceBadgeColors {
  const hue = HUE_PALETTE[hashString(source) % HUE_PALETTE.length];
  const color = `hsl(${hue}, 55%, 35%)`;
  return { border: color, icon: color };
}

function formatLabel(source: string): string {
  return source
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function getSourceBadge(source: string, variant: "std" | "hero" = "std"): {
  label: string;
  colors: SourceBadgeColors;
} {
  const key = source.toLowerCase().trim();
  const known = KNOWN_SOURCES[key];
  if (known) {
    const c = variant === "hero" && known.heroColors ? known.heroColors : known.colors;
    return { label: known.label, colors: c };
  }
  const fallbackColor = source ? generateColors(key) : { border: "#888", icon: "#888" };
  return {
    label: formatLabel(source || "Direct"),
    colors: fallbackColor,
  };
}
