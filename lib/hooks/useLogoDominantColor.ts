"use client";

import { useEffect, useState } from "react";

/**
 * Extracts the dominant color from a logo image URL and returns
 * a softened (pastel) version suitable for a background.
 * Falls back to the provided fallback color if extraction fails.
 */
export function useLogoDominantColor(
  logoUrl: string | null | undefined,
  fallback: string
): string {
  const [bg, setBg] = useState(fallback);

  useEffect(() => {
    if (!logoUrl) return;

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const size = 32; // sample at small size for speed
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(img, 0, 0, size, size);
        const data = ctx.getImageData(0, 0, size, size).data;

        let rTotal = 0;
        let gTotal = 0;
        let bTotal = 0;
        let count = 0;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          // Skip transparent and near-white/near-black pixels
          if (a < 128) continue;
          if (r > 240 && g > 240 && b > 240) continue;
          if (r < 15 && g < 15 && b < 15) continue;

          rTotal += r;
          gTotal += g;
          bTotal += b;
          count++;
        }

        if (count === 0) return; // all transparent/white/black — keep fallback

        const rAvg = Math.round(rTotal / count);
        const gAvg = Math.round(gTotal / count);
        const bAvg = Math.round(bTotal / count);

        // Soften to pastel: blend 75% toward white
        const rSoft = Math.round(rAvg + (255 - rAvg) * 0.78);
        const gSoft = Math.round(gAvg + (255 - gAvg) * 0.78);
        const bSoft = Math.round(bAvg + (255 - bAvg) * 0.78);

        setBg(`rgb(${rSoft}, ${gSoft}, ${bSoft})`);
      } catch {
        // CORS or canvas error — keep fallback
      }
    };

    img.src = logoUrl;
  }, [logoUrl, fallback]);

  return bg;
}
