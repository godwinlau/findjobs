import { colors } from "@/lib/constants/colors";

export const metadata = {
  title: "Privacy Policy | bigmovv",
};

export default function PrivacyPage() {
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
        Privacy Policy
      </h1>
      <p style={{ color: colors.textSec, marginBottom: 16 }}>
        Last updated: February 2025
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
          1. Information We Collect
        </h2>
        <p style={{ lineHeight: 1.7, color: colors.textSec }}>
          We collect information you provide directly, including your name, email
          address, skills, work preferences, salary expectations, and employment
          history. This information helps us match you with relevant job opportunities.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
          2. How We Use Your Information
        </h2>
        <p style={{ lineHeight: 1.7, color: colors.textSec }}>
          We use your information to provide personalized job recommendations, improve
          our matching algorithms, track your learning progress, and communicate
          service updates. We do not sell your personal information to third parties.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
          3. Data Storage and Security
        </h2>
        <p style={{ lineHeight: 1.7, color: colors.textSec }}>
          Your data is stored securely using industry-standard encryption. We use
          Supabase for data storage with row-level security policies to ensure only
          you can access your personal information.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
          4. Cookies and Tracking
        </h2>
        <p style={{ lineHeight: 1.7, color: colors.textSec }}>
          We use essential cookies to maintain your session and preferences. We may
          use analytics to understand how users interact with our platform and improve
          our services.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
          5. Your Rights
        </h2>
        <p style={{ lineHeight: 1.7, color: colors.textSec }}>
          You have the right to access, update, or delete your personal information at
          any time through your profile settings. You may also request a complete
          export of your data.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
          6. Data Retention
        </h2>
        <p style={{ lineHeight: 1.7, color: colors.textSec }}>
          We retain your data as long as your account is active. If you delete your
          account, we will remove your personal information within 30 days, except
          where retention is required by law.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
          7. Changes to This Policy
        </h2>
        <p style={{ lineHeight: 1.7, color: colors.textSec }}>
          We may update this Privacy Policy from time to time. We will notify you of
          significant changes via email or through a notice on our platform.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
          8. Contact
        </h2>
        <p style={{ lineHeight: 1.7, color: colors.textSec }}>
          If you have questions about this Privacy Policy, please contact us at{" "}
          <a href="mailto:privacy@hanapbuhay.ph" style={{ color: colors.primary }}>
            privacy@hanapbuhay.ph
          </a>
        </p>
      </section>
    </div>
  );
}
