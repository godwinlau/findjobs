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
    title: "Your Bigmovv Score",
    desc: "A match percentage for every job. 92% means 92% of required skills match. Not vibes \u2014 math.",
    tag: "Core Feature",
  },
  {
    icon: <CircleDollarSignIcon size={22} />,
    title: "Salary in PHP. Always.",
    desc: "Every job shows real salary ranges in pesos. Know your worth before you apply, not after 3 interviews and a case study.",
    tag: "Always Visible",
  },
  {
    icon: <ChartBarIncreasingIcon size={22} />,
    title: "Skill Intelligence",
    desc: "See which skills boost your score the most. We show the gap, the impact, and free resources to close it. Your career GPS.",
    tag: "Only on bigmovv",
  },
  {
    icon: <EarthIcon size={22} />,
    title: "Remote-First",
    desc: "62% of jobs are remote. Filter by setup. Find companies that actually hire from the Philippines, not just say they do.",
    tag: "62% Remote",
  },
  {
    icon: <ZapIcon size={22} />,
    title: "60-Second Setup",
    desc: "No resume. No 20-field forms. No uploading a PDF you made in 2019. Pick skills, get scored. Done.",
    tag: "Zero Friction",
  },
  {
    icon: <MapPinIcon size={22} />,
    title: "Built for PH. Actually.",
    desc: "PHP salaries. PH market data. Companies that genuinely hire from the Philippines, not just have a Manila office for tax purposes.",
    tag: "Local-First",
  },
];

export function FeaturesSection() {
  return (
    <section className="lp-section" id="features">
      <div className="lp-section-inner">
        <ScrollReveal>
          <div className="lp-section-label">{"// the good stuff"}</div>
          <div className="lp-section-title">
            Built different. And we can prove it.
          </div>
          <div className="lp-section-sub">
            Every feature exists because the current way of finding jobs is
            honestly embarrassing for 2026.
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
