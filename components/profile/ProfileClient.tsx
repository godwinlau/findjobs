"use client";

import { useState } from "react";
import type { Profile } from "@/lib/types";
import { ProfileHero } from "./ProfileHero";
import { SkillsSection } from "./SkillsSection";
import { ExperienceSection } from "./ExperienceSection";
import { EducationSection } from "./EducationSection";
import { PortfolioSection } from "./PortfolioSection";
import { ProfileCompleteness } from "./ProfileCompleteness";
import { JobPreferences } from "./JobPreferences";
import { RecentActivity } from "./RecentActivity";
import { EditProfileDrawer } from "./EditProfileDrawer";

interface ProfileClientProps {
  profile: Profile;
  email: string;
}

export function ProfileClient({ profile, email }: ProfileClientProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<Profile>(profile);

  function handleProfileUpdate(updated: Partial<Profile>) {
    setCurrentProfile((prev) => ({ ...prev, ...updated }));
  }

  return (
    <div className="profile-page">
      <ProfileHero
        profile={currentProfile}
        onEditClick={() => setIsDrawerOpen(true)}
      />

      <div className="profile-main-grid">
        {/* Left column */}
        <div className="profile-content">
          <SkillsSection profile={currentProfile} />
          <ExperienceSection onEditClick={() => setIsDrawerOpen(true)} />
          <EducationSection profile={currentProfile} />
          <PortfolioSection />
        </div>

        {/* Right sidebar */}
        <div className="profile-sidebar">
          <ProfileCompleteness profile={currentProfile} />
          <JobPreferences profile={currentProfile} />
          <RecentActivity />
        </div>
      </div>

      <EditProfileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        profile={currentProfile}
        onProfileUpdate={handleProfileUpdate}
      />
    </div>
  );
}
