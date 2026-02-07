import { LandingNav } from "./LandingNav";
import { Ticker } from "./Ticker";
import { HeroSection } from "./HeroSection";
import { LogoStrip } from "./LogoStrip";
import { SkillDemo } from "./SkillDemo";
import { BeforeAfter } from "./BeforeAfter";
import { HowItWorks } from "./HowItWorks";
import { CommunitySection } from "./CommunitySection";
import { FeaturesSection } from "./FeaturesSection";
import { FaqSection } from "./FaqSection";
import { FinalCta } from "./FinalCta";
import { StickyCta } from "./StickyCta";
import { LandingFooter } from "./LandingFooter";

export function LandingPage() {
  return (
    <div style={{ background: "#F5F5F0", color: "#0A0A0A", overflowX: "hidden" }}>
      <LandingNav />
      <Ticker />
      <HeroSection />
      <LogoStrip />
      <SkillDemo />
      <BeforeAfter />
      <HowItWorks />
      <CommunitySection />
      <FeaturesSection />
      <FaqSection />
      <FinalCta />
      <StickyCta />
      <LandingFooter />
    </div>
  );
}
