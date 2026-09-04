/**
 * Decision Ledger - Terms of Service
 * Architect & Developer: Pinaki Roy
 * LinkedIn: https://www.linkedin.com/in/pinakiroysocial/
 * © 2026 Pinaki Roy. All Rights Reserved.
 */
import Head from "next/head";
import Link from "next/link";

export default function TermsOfService() {
  return (
    <>
      <Head>
        <title>Terms of Service – Decision Ledger</title>
        <meta name="description" content="Terms of Service for Decision Ledger by Pinaki Roy." />
      </Head>

      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#008080",
          padding: "24px 16px",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          fontFamily: "var(--font-system, 'MS Sans Serif', Tahoma, sans-serif)",
        }}
      >
        <div
          className="w95-window"
          style={{
            maxWidth: "860px",
            width: "100%",
            boxShadow: "2px 2px 10px rgba(0,0,0,0.5)",
          }}
        >
          {/* Title Bar */}
          <div className="w95-title-bar">
            <div className="w95-title-text">
              <img
                src="/icons/app-d.png"
                alt="Decision Ledger"
                style={{ width: 16, height: 16, marginRight: 6, imageRendering: "pixelated" }}
              />
              <span>Decision Ledger – Terms of Service</span>
            </div>
            <div className="w95-title-controls">
              <Link href="/" legacyBehavior>
                <a className="w95-title-btn" style={{ textDecoration: "none", color: "#000" }}>✕</a>
              </Link>
            </div>
          </div>

          {/* Window Menu Bar */}
          <div className="w95-menubar">
            <Link href="/" legacyBehavior>
              <a className="w95-menu-item" style={{ textDecoration: "none", color: "inherit" }}>
                ← <u>B</u>ack to Application
              </a>
            </Link>
            <Link href="/privacy" legacyBehavior>
              <a className="w95-menu-item" style={{ textDecoration: "none", color: "inherit" }}>
                <u>P</u>rivacy Policy
              </a>
            </Link>
          </div>

          {/* Document Content */}
          <div className="p-3">
            <div
              className="w95-inset p-4 bg-white"
              style={{
                maxHeight: "75vh",
                overflowY: "auto",
                fontSize: "14px",
                lineHeight: "1.6",
                color: "#111",
              }}
            >
              <div className="border-bottom pb-3 mb-4">
                <h2 style={{ fontSize: "22px", fontWeight: "bold", margin: "0 0 6px 0", color: "#000080" }}>
                  Terms of Service
                </h2>
                <div style={{ fontSize: "12px", color: "#555" }}>
                  <strong>Effective Date:</strong> September 4, 2026 | <strong>Lead Architect & Developer:</strong>{" "}
                  <a
                    href="https://www.linkedin.com/in/pinakiroysocial/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#000080", textDecoration: "underline" }}
                  >
                    Pinaki Roy
                  </a>
                </div>
                <div style={{ fontSize: "12px", color: "#555", marginTop: "2px" }}>
                  <strong>Live Application:</strong>{" "}
                  <a
                    href="https://roy-decisionledger.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#000080", textDecoration: "underline" }}
                  >
                    https://roy-decisionledger.vercel.app/
                  </a>
                </div>
              </div>

              <section className="mb-4">
                <h4 style={{ fontSize: "16px", fontWeight: "bold", color: "#000080", marginBottom: "8px" }}>
                  1. Acceptance of Terms
                </h4>
                <p>
                  By accessing or using Decision Ledger (&quot;the Service&quot;), hosted at https://roy-decisionledger.vercel.app, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not use the Service.
                </p>
              </section>

              <section className="mb-4">
                <h4 style={{ fontSize: "16px", fontWeight: "bold", color: "#000080", marginBottom: "8px" }}>
                  2. Description of Service
                </h4>
                <p>
                  Decision Ledger is a specialized repository designed to structure, document, and analyze Architectural Decision Records (ADRs) with AI synthesis powered by Google Gemini.
                </p>
              </section>

              <section className="mb-4">
                <h4 style={{ fontSize: "16px", fontWeight: "bold", color: "#000080", marginBottom: "8px" }}>
                  3. User Accounts & Google Authentication
                </h4>
                <p>
                  You may use the service anonymously via Guest Mode or authenticate securely through your Google account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
                </p>
              </section>

              <section className="mb-4">
                <h4 style={{ fontSize: "16px", fontWeight: "bold", color: "#000080", marginBottom: "8px" }}>
                  4. Intellectual Property & User Data Ownership
                </h4>
                <p>
                  You retain all intellectual property rights and ownership of the architectural decisions, notes, and rationales that you input into Decision Ledger. The application source code, UI design, branding, and aesthetics are the intellectual property of Pinaki Roy.
                </p>
              </section>

              <section className="mb-4">
                <h4 style={{ fontSize: "16px", fontWeight: "bold", color: "#000080", marginBottom: "8px" }}>
                  5. Acceptable Use
                </h4>
                <p>
                  You agree not to use the Service to transmit unlawful, harmful, or abusive content, attempt to bypass access controls or security filters, or overload the underlying AI inference and serverless endpoints.
                </p>
              </section>

              <section className="mb-4">
                <h4 style={{ fontSize: "16px", fontWeight: "bold", color: "#000080", marginBottom: "8px" }}>
                  6. Disclaimer of Warranties & Limitation of Liability
                </h4>
                <p>
                  The Service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. Pinaki Roy makes no representations or warranties of any kind regarding accuracy or availability, and shall not be liable for any indirect, incidental, or consequential damages resulting from your use of the Service.
                </p>
              </section>

              <section>
                <h4 style={{ fontSize: "16px", fontWeight: "bold", color: "#000080", marginBottom: "8px" }}>
                  7. Contact
                </h4>
                <p>
                  For any legal inquiries or questions regarding these Terms, contact Pinaki Roy via{" "}
                  <a
                    href="https://www.linkedin.com/in/pinakiroysocial/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#000080", textDecoration: "underline" }}
                  >
                    LinkedIn
                  </a>
                  .
                </p>
              </section>
            </div>

            {/* Bottom Actions */}
            <div className="d-flex justify-content-between align-items-center mt-3">
              <span className="text-muted small">© 2026 Pinaki Roy. All Rights Reserved.</span>
              <div className="d-flex gap-2">
                <Link href="/privacy" legacyBehavior>
                  <a className="w95-btn" style={{ textDecoration: "none", color: "inherit", padding: "4px 14px" }}>
                    Privacy Policy
                  </a>
                </Link>
                <Link href="/" legacyBehavior>
                  <a className="w95-btn w95-btn-primary" style={{ textDecoration: "none", padding: "4px 18px" }}>
                    Back to Decision Ledger
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
