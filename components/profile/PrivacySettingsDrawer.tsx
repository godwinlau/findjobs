"use client";

import { useState, useEffect } from "react";
import type { Profile, PublicSections } from "@/lib/types";
import { updateProfile } from "@/app/profile/actions";

const SECTION_LABELS: Record<keyof PublicSections, string> = {
  headline: "Headline",
  skills: "Skills",
  experience_level: "Experience Level",
  education: "Education",
  preferred_industries: "Preferred Industries",
  employment_type: "Employment Type",
  salary: "Salary Expectations",
  city: "Preferred City",
  work_preference: "Work Preference",
};

const DEFAULT_SECTIONS: PublicSections = {
  headline: true,
  skills: true,
  experience_level: true,
  education: true,
  preferred_industries: true,
  employment_type: true,
  salary: false,
  city: false,
  work_preference: false,
};

interface PrivacySettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
  onProfileUpdate: (updated: Partial<Profile>) => void;
}

export function PrivacySettingsDrawer({
  isOpen,
  onClose,
  profile,
  onProfileUpdate,
}: PrivacySettingsDrawerProps) {
  const [isPublic, setIsPublic] = useState(profile.is_profile_public);
  const [sections, setSections] = useState<PublicSections>(
    profile.public_sections || DEFAULT_SECTIONS
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setIsPublic(profile.is_profile_public);
      setSections(profile.public_sections || DEFAULT_SECTIONS);
      setError("");
    }
  }, [isOpen, profile]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  function toggleSection(key: keyof PublicSections) {
    setSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleSave() {
    setSaving(true);
    setError("");

    const result = await updateProfile({
      is_profile_public: isPublic,
      public_sections: sections,
    } as Partial<Profile>);

    if (result.error) {
      setError(result.error);
      setSaving(false);
      return;
    }

    onProfileUpdate({ is_profile_public: isPublic, public_sections: sections });
    setSaving(false);
    onClose();
  }

  return (
    <>
      <div
        className={`drawer-overlay${isOpen ? " open" : ""}`}
        onClick={onClose}
      />
      <div className={`drawer-panel${isOpen ? " open" : ""}`}>
        <div className="drawer-header">
          <span className="drawer-title">Privacy Settings</span>
          <button className="drawer-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="drawer-body">
          {error && <div className="drawer-error">{error}</div>}

          {/* Public URL display */}
          {profile.username && (
            <div className="privacy-url-preview">
              <span className="privacy-url-label">Your public URL</span>
              <span className="privacy-url-value">
                bigmovv.com/u/{profile.username}
              </span>
            </div>
          )}

          {/* Global toggle */}
          <div className="drawer-section">
            <div className="drawer-section-title">Visibility</div>
            <label className="privacy-toggle-row">
              <span className="privacy-toggle-label">
                Make profile public
              </span>
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                style={{ accentColor: "#FBBF24", width: 18, height: 18 }}
              />
            </label>
            <p className="privacy-toggle-desc">
              When enabled, anyone with your link can view the sections you choose below.
              Your full name is always visible on your public profile.
            </p>
          </div>

          {/* Per-section toggles */}
          <div className="drawer-section">
            <div className="drawer-section-title">Visible Sections</div>
            {(Object.keys(SECTION_LABELS) as (keyof PublicSections)[]).map(
              (key) => (
                <label key={key} className="privacy-toggle-row">
                  <span className="privacy-toggle-label">
                    {SECTION_LABELS[key]}
                  </span>
                  <input
                    type="checkbox"
                    checked={sections[key]}
                    onChange={() => toggleSection(key)}
                    disabled={!isPublic}
                    style={{ accentColor: "#FBBF24", width: 18, height: 18 }}
                  />
                </label>
              )
            )}
          </div>
        </div>

        <div className="drawer-footer">
          <button
            className="drawer-cancel"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            className="drawer-save"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </>
  );
}
