"use client";

import { ActivityFeed } from "./ActivityFeed";
import { ApplicationsTracker } from "./ApplicationsTracker";
import { InterviewAlert } from "./InterviewAlert";
import { MarketInsight } from "./MarketInsight";
import { Activity, Application } from "@/lib/types";

interface SidebarProps {
  activities: Activity[];
  applications: Application[];
}

export function Sidebar({ activities, applications }: SidebarProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <ActivityFeed activities={activities} />
      <ApplicationsTracker applications={applications} />
      <InterviewAlert
        company="Accenture"
        role="Customer Support"
        date="Feb 6"
        time="2:00 PM"
        format="Video call"
        daysUntil={2}
      />
      <MarketInsight message="Customer Support roles in BGC average ₱19K/mo. You're targeting the right range." />
    </div>
  );
}
