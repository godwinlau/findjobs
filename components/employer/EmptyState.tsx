"use client";

import Link from "next/link";
import { colors } from "@/lib/constants/colors";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function EmptyState() {
  return (
    <Card padding="lg" style={{ textAlign: "center", padding: "48px 24px" }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>📋</div>
      <div
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: colors.text,
          marginBottom: 8,
        }}
      >
        No jobs posted yet
      </div>
      <div
        style={{
          fontSize: 13,
          color: colors.textMuted,
          marginBottom: 24,
          maxWidth: 320,
          margin: "0 auto 24px",
        }}
      >
        Create your first job posting and start finding the right candidates.
      </div>
      <Link href="/employer/post" style={{ textDecoration: "none" }}>
        <Button variant="primary" size="lg">
          Post Your First Job
        </Button>
      </Link>
    </Card>
  );
}
