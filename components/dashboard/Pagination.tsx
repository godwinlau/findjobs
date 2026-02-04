"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { colors } from "@/lib/constants/colors";

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
    minWidth: 32,
    height: 32,
    padding: "0 8px",
    fontSize: 13,
    fontWeight: 500,
    borderRadius: 6,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.border,
    background: colors.surface,
    color: colors.text,
    cursor: "pointer",
  };

  const activeBtnStyle: React.CSSProperties = {
    ...btnBase,
    background: colors.primary,
    color: colors.inv,
    borderColor: colors.primary,
  };

  const disabledBtnStyle: React.CSSProperties = {
    ...btnBase,
    opacity: 0.4,
    cursor: "default",
  };

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        marginTop: 20,
        paddingBottom: 8,
      }}
    >
      <button
        style={page <= 1 ? disabledBtnStyle : btnBase}
        disabled={page <= 1}
        onClick={() => goToPage(page - 1)}
      >
        Prev
      </button>

      {getPageNumbers().map((p, i) =>
        p === "ellipsis" ? (
          <span
            key={`e-${i}`}
            style={{ minWidth: 32, textAlign: "center", color: colors.textMuted, fontSize: 13 }}
          >
            ...
          </span>
        ) : (
          <button
            key={p}
            style={p === page ? activeBtnStyle : btnBase}
            onClick={() => goToPage(p)}
          >
            {p}
          </button>
        )
      )}

      <button
        style={page >= totalPages ? disabledBtnStyle : btnBase}
        disabled={page >= totalPages}
        onClick={() => goToPage(page + 1)}
      >
        Next
      </button>
    </nav>
  );
}
