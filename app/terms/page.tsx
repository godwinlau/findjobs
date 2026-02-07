import { colors } from "@/lib/constants/colors";

export const metadata = {
  title: "Terms of Service | bigmovv",
};

export default function TermsPage() {
  return (
    <div
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "48px 24px",
        color: colors.text,
      }}
    >
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>
        Terms of Service
      </h1>
      <p style={{ color: colors.textSec, marginBottom: 16 }}>
        Last updated: February 2025
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
          1. Acceptance of Terms
        </h2>
        <p style={{ lineHeight: 1.7, color: colors.textSec }}>
          By accessing and using bigmovv, you accept and agree to be bound by these
          Terms of Service. If you do not agree to these terms, please do not use our
          service.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
          2. Description of Service
        </h2>
        <p style={{ lineHeight: 1.7, color: colors.textSec }}>
          bigmovv is a job matching platform that connects job seekers with
          employment opportunities in the Philippines. We provide personalized job
          recommendations based on your skills, experience, and preferences.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
          3. User Accounts
        </h2>
        <p style={{ lineHeight: 1.7, color: colors.textSec }}>
          You are responsible for maintaining the confidentiality of your account
          credentials and for all activities that occur under your account. You must
          provide accurate and complete information when creating your account.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
          4. User Conduct
        </h2>
        <p style={{ lineHeight: 1.7, color: colors.textSec }}>
          You agree not to misuse our services, submit false information, or attempt
          to gain unauthorized access to our systems. We reserve the right to suspend
          or terminate accounts that violate these terms.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
          5. Job Listings
        </h2>
        <p style={{ lineHeight: 1.7, color: colors.textSec }}>
          Job listings on bigmovv are aggregated from various sources. We do not
          guarantee the accuracy, completeness, or availability of any job posting.
          Always verify job details directly with the employer.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
          6. Limitation of Liability
        </h2>
        <p style={{ lineHeight: 1.7, color: colors.textSec }}>
          bigmovv is provided &quot;as is&quot; without warranties of any kind. We are not
          liable for any damages arising from your use of our service or reliance on
          job listings displayed on our platform.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
          7. Contact
        </h2>
        <p style={{ lineHeight: 1.7, color: colors.textSec }}>
          If you have questions about these Terms, please contact us at{" "}
          <a href="mailto:support@hanapbuhay.ph" style={{ color: colors.primary }}>
            support@hanapbuhay.ph
          </a>
        </p>
      </section>
    </div>
  );
}
