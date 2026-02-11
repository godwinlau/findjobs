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
import { ClaimUsernameCard } from "./ClaimUsernameCard";
import { PrivacySettingsDrawer } from "./PrivacySettingsDrawer";
import { ShareProfileModal } from "./ShareProfileModal";

interface ProfileClientProps {
  profile: Profile;
  email: string;
}

export function ProfileClient({ profile, email }: ProfileClientProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<Profile>(profile);

  function handleProfileUpdate(updated: Partial<Profile>) {
    setCurrentProfile((prev) => ({ ...prev, ...updated }));
  }

  return (
    <div className="profile-page">
      <ProfileHero
        profile={currentProfile}
        onEditClick={() => setIsDrawerOpen(true)}
        onPrivacyClick={() => setIsPrivacyOpen(true)}
        onShareClick={() => setIsShareOpen(true)}
      />

      {!currentProfile.username && (
        <ClaimUsernameCard
          onClaimed={(username) =>
            setCurrentProfile((prev) => ({
              ...prev,
              username,
              is_profile_public: true,
            }))
          }
        />
      )}

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

      <PrivacySettingsDrawer
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
        profile={currentProfile}
        onProfileUpdate={handleProfileUpdate}
      />

      {currentProfile.username && currentProfile.is_profile_public && (
        <ShareProfileModal
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          username={currentProfile.username}
        />
      )}
    </div>
  );
}
