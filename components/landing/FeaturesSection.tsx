import { ScrollReveal } from "./ScrollReveal";
import { FeatureCard } from "./FeatureCard";
import { CompassIcon } from "@/components/ui/compass";
import { CircleDollarSignIcon } from "@/components/ui/circle-dollar-sign";
import { ChartBarIncreasingIcon } from "@/components/ui/chart-bar-increasing";
import { EarthIcon } from "@/components/ui/earth";
import { ZapIcon } from "@/components/ui/zap";
import { MapPinIcon } from "@/components/ui/map-pin";

const features = [
  {
    icon: <CompassIcon size={22} />,
    title: "Skill-Based Matching",
    desc: "We map your skills to job requirements and give you a real match percentage. 92% means 92%.",
    tag: "Core Feature",
  },
  {
    icon: <CircleDollarSignIcon size={22} />,
    title: "Salary in PHP",
    desc: "Every job shows salary ranges in pesos. Plus market data so you know your worth before you apply.",
    tag: "Always Visible",
  },
  {
    icon: <ChartBarIncreasingIcon size={22} />,
    title: "Skill Intelligence",
    desc: "See what skills the market wants, what you\u2019re missing, and exactly how many jobs they\u2019d unlock.",
    tag: "Unique to bigmovv",
  },
  {
    icon: <EarthIcon size={22} />,
    title: "Remote-First",
    desc: "62% of our jobs are remote. Filter by setup, see which companies truly hire from the Philippines.",
    tag: "62% Remote",
  },
  {
    icon: <ZapIcon size={22} />,
    title: "60-Second Setup",
    desc: "No resume upload. No 20-field forms. Pick skills, set preferences, see matches. Under a minute.",
    tag: "Zero Friction",
  },
  {
    icon: <MapPinIcon size={22} />,
    title: "Built for Filipinos",
    desc: "PHP salaries, PH market data, roles popular here, companies that actually hire remotely from PH.",
    tag: "Local-First",
  },
];

export function FeaturesSection() {
  return (
    <section className="lp-section" id="features">
      <div className="lp-section-inner">
        <ScrollReveal>
          <div className="lp-section-label">{"// what you get"}</div>
          <div className="lp-section-title">Built different. On purpose.</div>
          <div className="lp-section-sub">
            Every feature exists because we asked: does this help someone get
            hired faster?
          </div>
          <div className="lp-feat-grid">
            {features.map((f) => (
              <FeatureCard
                key={f.title}
                icon={f.icon}
                title={f.title}
                desc={f.desc}
                tag={f.tag}
              />
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
