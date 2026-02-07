"use client";

import { useState } from "react";
import { ScrollReveal } from "./ScrollReveal";

const faqs = [
  {
    q: "Is this actually free?",
    a: "Yes. Completely free for job seekers. No hidden fees, no premium tier, no credit card required. We make money from employers who pay to post jobs and access our matching platform. You\u2019ll never pay a single peso.",
  },
  {
    q: "How is this different from JobStreet or LinkedIn?",
    a: "Those platforms show you everything and let you sort through thousands of listings. We do the opposite \u2014 we analyze your skills and only show you jobs where you\u2019re a strong match. Plus we show salaries in PHP upfront, give you a match score for every job, and tell you exactly which skills to learn to unlock more opportunities.",
  },
  {
    q: "Are these real jobs from real companies?",
    a: "Every job on our platform is verified. We aggregate from company career pages, partner APIs, and direct employer postings. No fake listings, no duplicates, no expired roles. If a job is on HanapBuhay, you can apply to it today.",
  },
  {
    q: "I\u2019m outside Manila. Will this work for me?",
    a: "Absolutely. 62% of our jobs are remote-friendly, so it doesn\u2019t matter if you\u2019re in Cebu, Davao, Iloilo, or anywhere else. We\u2019ve had users hired from across the Philippines. Our community section shows real people from cities all over the country.",
  },
  {
    q: "What if I don\u2019t have many skills yet?",
    a: "That\u2019s exactly who our Skills Intelligence feature is for. We\u2019ll show you which skills are in demand, which ones would unlock the most jobs for you, and link you to free resources to learn them. Start with what you have \u2014 we\u2019ll help you grow.",
  },
];

export function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section className="lp-section" style={{ paddingTop: 0 }}>
      <div className="lp-section-inner">
        <ScrollReveal>
          <div className="lp-section-label">{"// honest answers"}</div>
          <div className="lp-section-title">Still not sure?</div>
          <div className="lp-section-sub">
            Fair. Here are the questions everyone asks before signing up.
          </div>
          <div className="lp-faq-list">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className={`lp-faq-item${openIdx === i ? " lp-open" : ""}`}
              >
                <button
                  className="lp-faq-q"
                  onClick={() => setOpenIdx(openIdx === i ? null : i)}
                  type="button"
                >
                  <div className="lp-faq-q-text">{faq.q}</div>
                  <div className="lp-faq-toggle">+</div>
                </button>
                <div className="lp-faq-a">
                  <div className="lp-faq-a-inner">{faq.a}</div>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
