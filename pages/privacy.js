/**
 * Decision Ledger – Privacy Policy
 * Architect & Developer: Pinaki Roy
 * LinkedIn: https://www.linkedin.com/in/pinakiroysocial/
 * © 2026 Pinaki Roy. All Rights Reserved.
 */
import Head from "next/head";
import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>Privacy Policy – Decision Ledger</title>
        <meta name="description" content="Privacy Policy for Decision Ledger by Pinaki Roy." />
      </Head>

      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#008080",
          padding: "24px 16px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          boxSizing: "border-box",
          fontFamily: "'Windows 95', 'MS Sans Serif', Tahoma, Geneva, Verdana, sans-serif",
        }}
      >
        <div
          className="w95-window"
          style={{
            maxWidth: "860px",
            width: "100%",
          }}
        >
          {/* Title Bar - No fake close button, authentic icon */}
          <div className="w95-title-bar">
            <div className="w95-title-text">
              <img
                src="/icons/app-d.png"
                alt="Decision Ledger"
                style={{ width: 16, height: 16, marginRight: 6, imageRendering: "pixelated" }}
              />
              <span>Decision Ledger – Privacy Policy</span>
            </div>
          </div>

          {/* Document Content */}
          <div className="p-3">
            <div
              className="w95-inset p-4 bg-white"
                style={{
                  maxHeight: "70vh",
                  overflowY: "auto",
                  fontSize: "13px",
                  lineHeight: "1.65",
                  color: "#111111",
                  fontFamily: "'Windows 95', 'MS Sans Serif', Tahoma, Geneva, Verdana, sans-serif",
                }}
              >
                <div className="border-bottom pb-3 mb-4">
                  <h2 style={{ fontSize: "20px", fontWeight: "bold", margin: "0 0 6px 0", color: "#000080", fontFamily: "inherit" }}>
                    Privacy Policy for Decision Ledger
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
                  <h4 style={{ fontSize: "15px", fontWeight: "bold", color: "#000080", marginBottom: "8px", fontFamily: "inherit" }}>
                    1. Overview
                  </h4>
                  <p>
                    Decision Ledger (&quot;we,&quot; &quot;our,&quot; or &quot;the Service&quot;) is an architectural decision management repository architected and maintained by Pinaki Roy. We are committed to safeguarding your privacy and ensuring the security of your technical decisions and personal data.
                  </p>
                  <p>
                    This Privacy Policy outlines how your information is collected, utilized, and protected when you access or sign in to Decision Ledger using Google OAuth authentication or Guest mode.
                  </p>
                </section>

                <section className="mb-4">
                  <h4 style={{ fontSize: "15px", fontWeight: "bold", color: "#000080", marginBottom: "8px", fontFamily: "inherit" }}>
                    2. Information We Collect
                  </h4>
                  <p>
                    We only request and collect the minimal information necessary to provide authentication, access control, and architectural record storage:
                  </p>
                  <ul>
                    <li>
                      <strong>Google Account Information (Google OAuth):</strong> When you sign in using your Google account via Firebase Authentication, we receive your standard public profile data:
                      <ul>
                        <li>Google User ID (UID)</li>
                        <li>Email address</li>
                        <li>Display name</li>
                        <li>Profile photo avatar URL (optional display)</li>
                      </ul>
                      <em>We do NOT request access to your Google Drive, Gmail, Google Contacts, Calendar, or any sensitive scopes.</em>
                    </li>
                    <li>
                      <strong>Architectural Decision Content:</strong> Notes, decision titles, evaluated alternatives, rationale summaries, and categorical tags that you voluntarily compose or save within the application.
                    </li>
                    <li>
                      <strong>Usage Data & Session Storage:</strong> Client preferences (such as active filters and transient guest ledger data) stored locally in your browser&apos;s localStorage.
                    </li>
                  </ul>
                </section>

                <section className="mb-4">
                  <h4 style={{ fontSize: "15px", fontWeight: "bold", color: "#000080", marginBottom: "8px", fontFamily: "inherit" }}>
                    3. How We Use Your Information
                  </h4>
                  <p>Your information is used strictly for the following purposes:</p>
                  <ul>
                    <li><strong>Authentication & Security:</strong> Verifying your identity with Firebase Authentication and issuing secure JSON Web Tokens (JWT) to authorize your requests.</li>
                    <li><strong>Data Isolation (Multi-Tenancy):</strong> Ensuring that your Architectural Decision Records are strictly isolated by your user ID (<code>ownerUid</code>) so that only you can view, edit, or delete your records.</li>
                    <li><strong>AI Synthesis & Analysis:</strong> Processing your unstructured architectural notes through Google Gemini 3.5 Flash API to extract trade-offs, rationale, and metadata. Your notes are transmitted securely via server-side API routes and are <em>never</em> used to train public AI models.</li>
                  </ul>
                </section>

                <section className="mb-4">
                  <h4 style={{ fontSize: "15px", fontWeight: "bold", color: "#000080", marginBottom: "8px", fontFamily: "inherit" }}>
                    4. Google API Services User Data Policy Compliance
                  </h4>
                  <p>
                    Decision Ledger complies with the{" "}
                    <a
                      href="https://developers.google.com/terms/api-services-user-data-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#000080", textDecoration: "underline" }}
                    >
                      Google API Services User Data Policy
                    </a>
                    , including the Limited Use requirements:
                  </p>
                  <ul>
                    <li>We do not sell, rent, or lease your Google user data to third parties under any circumstances.</li>
                    <li>We do not use or transfer your user data for serving personalized, retargeted, or interest-based advertising.</li>
                    <li>We do not permit humans to read your private decision records unless required by applicable law or with your explicit consent for support.</li>
                  </ul>
                </section>

                <section className="mb-4">
                  <h4 style={{ fontSize: "15px", fontWeight: "bold", color: "#000080", marginBottom: "8px", fontFamily: "inherit" }}>
                    5. Third-Party Infrastructure & Sub-processors
                  </h4>
                  <p>We leverage industry-standard cloud infrastructure providers to securely host and operate Decision Ledger:</p>
                  <ul>
                    <li><strong>Vercel Inc.:</strong> Hosting platform and Edge serverless execution.</li>
                    <li><strong>Firebase / Google Cloud:</strong> Firebase Authentication (OAuth identity) and Cloud Firestore (encrypted NoSQL document database).</li>
                    <li><strong>Google AI Studio / Gemini API:</strong> Generative AI inference for structuring ADRs and answering conversational queries.</li>
                  </ul>
                </section>

                <section className="mb-4">
                  <h4 style={{ fontSize: "15px", fontWeight: "bold", color: "#000080", marginBottom: "8px", fontFamily: "inherit" }}>
                    6. Data Retention, Export, and Deletion
                  </h4>
                  <p>
                    You retain full ownership and authority over all decision data stored in Decision Ledger:
                  </p>
                  <ul>
                    <li><strong>Export:</strong> You can export your complete decision repository as structured JSON at any time using the &quot;Export JSON&quot; tool in the application.</li>
                    <li><strong>Soft & Permanent Deletion:</strong> You can delete decisions into the Recycle Bin or permanently purge them at any time directly through the interface.</li>
                    <li><strong>Account Data Removal:</strong> To request the complete erasure of your user profile and all associated Firestore records, contact the lead developer via LinkedIn.</li>
                  </ul>
                </section>

                <section className="mb-4">
                  <h4 style={{ fontSize: "15px", fontWeight: "bold", color: "#000080", marginBottom: "8px", fontFamily: "inherit" }}>
                    7. Security Safeguards
                  </h4>
                  <p>
                    We implement robust enterprise security measures to protect your data against unauthorized access, alteration, or disclosure, including HTTPS/TLS 1.3 encryption in transit, Firebase Admin token verification on all mutation endpoints, server-side ownership validation (IDOR prevention), and in-memory rate limiting.
                  </p>
                </section>

                <section className="mb-4">
                  <h4 style={{ fontSize: "15px", fontWeight: "bold", color: "#000080", marginBottom: "8px", fontFamily: "inherit" }}>
                    8. Changes to This Privacy Policy
                  </h4>
                  <p>
                    We may periodically update this Privacy Policy to reflect enhancements to our features or regulatory compliance. Any revisions will be published on this URL with an updated Effective Date.
                  </p>
                </section>

                <section>
                  <h4 style={{ fontSize: "15px", fontWeight: "bold", color: "#000080", marginBottom: "8px", fontFamily: "inherit" }}>
                    9. Contact Information & Developer Inquiries
                  </h4>
                  <p>
                    If you have any questions, concerns, or requests regarding this Privacy Policy or your data privacy, please contact:
                  </p>
                  <div className="p-3 w95-inset bg-light">
                    <div><strong>Lead Architect:</strong> Pinaki Roy</div>
                    <div>
                      <strong>LinkedIn:</strong>{" "}
                      <a
                        href="https://www.linkedin.com/in/pinakiroysocial/"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#000080", textDecoration: "underline" }}
                      >
                        https://www.linkedin.com/in/pinakiroysocial/
                      </a>
                    </div>
                    <div><strong>Application:</strong> Decision Ledger (Production Workstation)</div>
                  </div>
                </section>
              </div>

            {/* Bottom Actions - Single source of navigation with generous spacing */}
            <div className="d-flex justify-content-between align-items-center mt-3 pt-2">
              <span className="text-muted small">© 2026 Pinaki Roy. All Rights Reserved.</span>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <Link href="/terms" legacyBehavior>
                  <a className="w95-btn" style={{ textDecoration: "none", color: "inherit" }}>
                    Terms of Service
                  </a>
                </Link>
                <Link href="/" legacyBehavior>
                  <a className="w95-btn w95-btn-primary" style={{ textDecoration: "none" }}>
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
