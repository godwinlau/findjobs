"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface PaginationProps {
  page: number;
  totalPages: number;
  basePath?: string;
  onPageChange?: (page: number) => void;
}

export function Pagination({ page, totalPages, basePath = "/", onPageChange }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function goToPage(p: number) {
    if (onPageChange) {
      onPageChange(p);
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    if (p <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(p));
    }
    router.push(`${basePath}?${params.toString()}`);
  }

  function getPageNumbers(): (number | "ellipsis")[] {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);
    if (page > 3) pages.push("ellipsis");

    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    if (page < totalPages - 2) pages.push("ellipsis");
    pages.push(totalPages);

    return pages;
  }

  const btnBase: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 36,
    height: 36,
    padding: "0 12px",
    fontSize: 11,
    fontWeight: 700,
    fontFamily: "var(--font-mono)",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    border: "2px solid #0A0A0A",
    background: "transparent",
    color: "#0A0A0A",
    cursor: "pointer",
    transition: "all 0.15s ease",
  };

  const activeBtnStyle: React.CSSProperties = {
    ...btnBase,
    background: "#0A0A0A",
    color: "#FBBF24",
    border: "2px solid #0A0A0A",
  };

  const disabledBtnStyle: React.CSSProperties = {
    ...btnBase,
    opacity: 0.3,
    cursor: "default",
  };

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
        marginTop: 20,
        paddingBottom: 8,
      }}
    >
      <button
        style={page <= 1 ? disabledBtnStyle : { ...btnBase, marginRight: -2 }}
        disabled={page <= 1}
        onClick={() => goToPage(page - 1)}
      >
        Prev
      </button>

      {getPageNumbers().map((p, i) =>
        p === "ellipsis" ? (
          <span
            key={`e-${i}`}
            style={{
              minWidth: 36,
              height: 36,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #0A0A0A",
              marginLeft: -2,
              color: "#888",
              fontSize: 13,
              fontFamily: "var(--font-mono)",
            }}
          >
            ...
          </span>
        ) : (
          <button
            key={p}
            style={{
              ...(p === page ? activeBtnStyle : btnBase),
              marginLeft: -2,
            }}
            onClick={() => goToPage(p)}
          >
            {p}
          </button>
        )
      )}

      <button
        style={page >= totalPages ? { ...disabledBtnStyle, marginLeft: -2 } : { ...btnBase, marginLeft: -2 }}
        disabled={page >= totalPages}
        onClick={() => goToPage(page + 1)}
      >
        Next
      </button>
    </nav>
  );
}
