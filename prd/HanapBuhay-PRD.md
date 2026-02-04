# HanapBuhay - Product Requirements Document

## Overview

**Product Name:** HanapBuhay
**Tagline:** Job matching for Filipino professionals
**Target Market:** Entry-level to mid-level job seekers in the Philippines

HanapBuhay is a job search platform that uses intelligent matching to connect Filipino job seekers with relevant opportunities. The platform emphasizes skill-based matching, engagement tracking, and actionable insights to help users land jobs faster.

---

## Problem Statement

Filipino job seekers, especially fresh graduates and early-career professionals, face:
- Overwhelming job boards with irrelevant listings
- No visibility into application status or employer interest
- Lack of guidance on improving employability
- Difficulty tracking job search progress and staying motivated

---

## Solution

A curated job platform that:
1. **Matches jobs to users** based on skills, not just keywords
2. **Shows match percentages** so users prioritize high-fit opportunities
3. **Tracks engagement** (profile views, application status, employer responses)
4. **Gamifies the job search** with streaks, progress indicators, and milestones
5. **Provides contextual insights** (market data, response times, deadlines)

---

## Target Users

### Primary Persona: Juan (Fresh Graduate)
- 22 years old, just graduated with a Communications degree
- Looking for first full-time job in customer service, marketing, or admin
- Salary expectation: ₱18K-25K/month
- Location preference: Metro Manila (BGC, Makati, Pasig)
- Pain points: Doesn't know which jobs fit his skills, loses track of applications

### Secondary Persona: Maria (Career Shifter)
- 28 years old, 3 years in retail, wants to move to corporate
- Interested in data entry, coordination, or support roles
- Willing to take skill assessments to prove capability
- Pain points: Gets rejected for "lack of experience" despite transferable skills

---

## Core Features

### 1. Smart Job Matching
| Attribute | Description |
|-----------|-------------|
| Match Score | 0-100% based on skills, experience, location, salary fit |
| Visual Indicator | Color-coded dots (green ≥75%, blue ≥65%, gray <65%) |
| Match Explanation | "3 of your skills match this role's top requirements" |
| Sorting | Best matches surfaced first |

### 2. Job Cards
Each job listing displays:
- Company name + verification badge
- Job title
- Salary range (monthly, in PHP)
- Location
- Work type (Full-time/Part-time, Onsite/Hybrid/Remote)
- Number of applicants
- Closing date (if applicable)
- Employer response time
- Expandable description

**Hero Card:** The top match gets prominent placement with:
- "Best match" badge
- Skill match highlight
- Primary CTA: "Apply now"

### 3. Weekly Progress Tracker
| Element | Purpose |
|---------|---------|
| Streak Counter | Days in a row with job search activity |
| Activity Grid | Visual heatmap of daily actions (M-S) |
| Action Count | Total actions this week |
| Motivation Copy | "Keep it up!" encouragement |

**Activity Types:**
- Applying to jobs
- Saving jobs
- Completing profile sections
- Taking skill assessments
- Viewing job details

### 4. Profile Completion
- Circular progress indicator (0-100%)
- Contextual prompt: "add a skill assessment to unlock 12 more matches"
- CTA to complete next high-impact section

### 5. Activity Feed (Real-time)
Live updates showing:
| Type | Example |
|------|---------|
| Profile View | "Accenture viewed your profile" |
| New Match | "New 92% match: Customer Support Rep" |
| Tip | "Complete a skill test to stand out" |
| Application Status | "Canva PH opened your application" |
| Milestone | "You've applied to 4 jobs this week!" |

### 6. Application Tracker
Status pipeline:
```
Applied → Viewed → Interview → Offer
```

Each application shows:
- Company + role
- Current status (color-coded)
- Status detail (date/time context)
- Urgency indicator (pulsing dot for upcoming interviews)

### 7. Interview Preparation
When interview is scheduled:
- Countdown alert ("Interview in 2 days")
- Company + role reminder
- Date/time + format (video call, onsite)
- CTA: "Practice for this interview"

### 8. Market Insights
Contextual data snippets:
- Average salary for role/location
- How user's target compares to market
- Application velocity recommendations

---

## Information Architecture

```
HanapBuhay
├── Home (current view)
│   ├── Weekly Progress Strip
│   ├── Profile Completion Prompt
│   ├── Job Feed
│   │   ├── Hero Card (Best Match)
│   │   └── More Matches (expandable cards)
│   └── Sidebar
│       ├── Activity Feed
│       ├── Applications Tracker
│       ├── Interview Alert
│       └── Market Insight
├── Explore
│   └── Browse all jobs with filters
├── Applications
│   └── Full application management
└── Learn
    └── Skill assessments + courses
```

---

## Navigation

| Element | Behavior |
|---------|----------|
| Logo | Returns to Home |
| Home | Active state, current dashboard |
| Explore | Browse/search all jobs |
| Applications | Full pipeline view (has notification dot) |
| Learn | Skill assessments and upskilling |
| Search (⌘K) | Global search overlay |
| Notifications | Bell icon, unread count |
| Profile | Avatar, dropdown menu |

---

## Design System

### Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `bg` | #F8F8F6 | Page background |
| `surface` | #FFFFFF | Cards, modals |
| `surfaceAlt` | #F2F1EE | Secondary surfaces |
| `border` | #E6E5E1 | Default borders |
| `borderHover` | #CDCCC7 | Hover state borders |
| `primary` | #1A7F48 | Primary actions, success |
| `primarySoft` | #22A85C | Primary hover |
| `primaryBg` | #EDF8F2 | Primary tint backgrounds |
| `primaryBorder` | #C2E8D3 | Primary bordered elements |
| `accent` | #1D4ED8 | Secondary actions, links |
| `accentBg` | #EEF3FF | Accent tint backgrounds |
| `warning` | #B45309 | Deadlines, urgency |
| `warningBg` | #FEF9EC | Warning backgrounds |
| `text` | #171714 | Primary text |
| `textSec` | #64645E | Secondary text |
| `textMuted` | #9E9E96 | Muted/helper text |
| `live` | #EF4444 | Live indicators |

### Typography
- **Font Family:** DM Sans (UI), Source Serif 4 (optional editorial)
- **Weights:** 400 (regular), 500 (medium), 600 (semibold), 700 (bold), 800 (extrabold)
- **Scale:** 9px, 10px, 11px, 12px, 13px, 14px, 18px

### Spacing
- Card padding: 16-24px
- Card gap: 6-12px
- Border radius: 5-14px (contextual)

### Animation
| Animation | Duration | Usage |
|-----------|----------|-------|
| fadeUp | 0.3s ease | Card entrance |
| slideIn | 0.25s ease | List item entrance |
| pulse | 2s infinite | Live indicators |

---

## User Flows

### Flow 1: Apply to Job
```
1. User sees job card with match %
2. User clicks "Apply" or "Apply now"
3. [Future] Review/customize application
4. [Future] Submit application
5. Application appears in tracker as "Applied"
```

### Flow 2: Expand Job Details
```
1. User clicks on job card (not Apply button)
2. Card expands to show description
3. Additional context: applicant count, response time
4. Secondary actions: "Save for later", "Full details"
```

### Flow 3: Complete Profile
```
1. User sees "72% ready" prompt
2. User clicks "Take assessment"
3. [Future] Skill assessment flow
4. Profile % increases
5. New matches unlocked
```

---

## Success Metrics

### Engagement
- Daily Active Users (DAU)
- Average session duration
- Jobs viewed per session
- Applications submitted per week

### Matching Quality
- Apply rate on 80%+ matches vs <80%
- Interview rate by match score
- User-reported match accuracy

### Retention
- Day 1, Day 7, Day 30 retention
- Streak length distribution
- Profile completion rate

### Outcomes
- Time to first interview
- Time to offer
- Successful placements

---

## Technical Requirements

### Frontend
- React 18+
- CSS-in-JS (inline styles currently, consider styled-components)
- Responsive design (current: desktop-first, 1000px max-width)

### Performance
- First Contentful Paint < 1.5s
- Time to Interactive < 3s
- Staggered animations to prevent jank

### Accessibility (TODO)
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- Color contrast ratios

---

## Future Roadmap

### Phase 2: Enhanced Matching
- [ ] Skill assessment integration
- [ ] Resume parsing for auto-profile
- [ ] Salary negotiation insights

### Phase 3: Application Management
- [ ] In-app application submission
- [ ] Application templates
- [ ] Follow-up reminders

### Phase 4: Interview Prep
- [ ] AI mock interviews
- [ ] Company research summaries
- [ ] Common questions by role

### Phase 5: Mobile
- [ ] Responsive mobile web
- [ ] Native iOS/Android apps
- [ ] Push notifications

---

## Appendix

### Sample Data Structure

```typescript
interface Job {
  company: string;
  verified: boolean;
  logo: string;
  logoBg: string;
  logoColor: string;
  role: string;
  salary: string;
  location: string;
  type: string;
  match: number;
  posted: string;
  applicants: number;
  closing: string | null;
  responseTime: string | null;
  highlight: string | null;
  isTop: boolean;
  desc: string;
}

interface Activity {
  type: 'view' | 'match' | 'tip' | 'status' | 'milestone';
  text: string;
  time: string;
  icon: string;
}

interface Application {
  company: string;
  role: string;
  status: 'Applied' | 'Viewed' | 'Interview' | 'Offer' | 'Rejected';
  color: string;
  bg: string;
  detail: string;
  urgent: boolean;
}
```

---

*Document Version: 1.0*
*Last Updated: February 2026*
*Author: Product Team*
