"use client";

import { useState } from "react";

interface CompanyLogoProps {
  letter: string;
  bgColor: string;
  textColor: string;
  logoUrl?: string | null;
  size?: "sm" | "md" | "lg";
}

export function CompanyLogo({ letter, bgColor, textColor, logoUrl, size = "md" }: CompanyLogoProps) {
  const [imgError, setImgError] = useState(false);

  const sizes = {
    sm: { box: 32, fontSize: 12, borderRadius: 8 },
    md: { box: 36, fontSize: 14, borderRadius: 9 },
    lg: { box: 44, fontSize: 18, borderRadius: 11 },
  };

  const s = sizes[size];

  if (logoUrl && !imgError) {
    return (
      <img
        src={logoUrl}
        alt={letter}
        width={s.box}
        height={s.box}
        onError={() => setImgError(true)}
        style={{
          width: s.box,
          height: s.box,
          borderRadius: s.borderRadius,
          objectFit: "contain",
          flexShrink: 0,
          background: "#fff",
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: s.box,
        height: s.box,
        borderRadius: s.borderRadius,
        background: bgColor,
        color: textColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: s.fontSize,
        fontWeight: 800,
        flexShrink: 0,
      }}
    >
      {letter}
    </div>
  );
}
