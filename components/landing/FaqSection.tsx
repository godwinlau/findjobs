"use client";

import { useState } from "react";
import { ScrollReveal } from "./ScrollReveal";

const faqs = [
  {
    q: "Wait, this is actually free?",
    a: "Free as in \u201Cfree free.\u201D Not free-trial-free or free-but-we\u2019ll-upsell-you-free. 100% free for job seekers, forever. Employers pay to post and access our matching. You\u2019ll never pay a single peso. We promise. Pinky swear.",
  },
  {
    q: "How is this different from JobStreet or LinkedIn?",
    a: "They throw 500 listings at you and wish you luck. We score your skills against every job and only show matches where you\u2019d actually get hired. Plus transparent PHP salaries (not \u201Ccompetitive\u201D) and a skill gap feature that tells you exactly what to learn next. It\u2019s like going from Google Maps to a personal driver.",
  },
  {
    q: "Are these real jobs or are you catfishing me?",
    a: "Every single job is verified. We pull from company career pages, partner APIs, and direct employer postings. No fake listings, no duplicates, no expired roles from 2023 that somehow still appear (looking at you, every other platform). If it\u2019s on bigmovv, you can apply today.",
  },
  {
    q: "I\u2019m not in Manila. Am I invisible here too?",
    a: "Absolutely not. 62% of our jobs are remote. We have people hired from Cebu, Davao, Iloilo, Cagayan de Oro, and everywhere in between. Your location doesn\u2019t determine your talent. Your score does.",
  },
  {
    q: "What does my score actually mean?",
    a: "It\u2019s the percentage of a job\u2019s required and preferred skills that match your profile. Score 92% and you match 92% of what the employer wants. Above 85% and you\u2019re a strong candidate. We also show you which skills would bump your score higher \u2014 so you know exactly what to learn next, not just what you\u2019re missing.",
  },
];

export function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section className="lp-section" style={{ paddingTop: 0 }}>
      <div className="lp-section-inner">
        <ScrollReveal>
          <div className="lp-section-label">
            {"// the fine print (there isn\u2019t any)"}
          </div>
          <div className="lp-section-title">
            You have questions. We have answers.
          </div>
          <div className="lp-section-sub">
            Here&apos;s what everyone asks right before they realize they
            should&apos;ve signed up 5 minutes ago.
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
