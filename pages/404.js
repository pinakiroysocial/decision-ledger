/**
 * Decision Ledger – 404 Page Not Found
 * Architect & Developer: Pinaki Roy
 * LinkedIn: https://www.linkedin.com/in/pinakiroysocial/
 * © 2026 Pinaki Roy. All Rights Reserved.
 */
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function Custom404() {
  const router = useRouter();
  const [requestedUrl, setRequestedUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setRequestedUrl(window.location.pathname + window.location.search);
    }
  }, [router.asPath]);

  return (
    <>
      <Head>
        <title>404 - Page Not Found – Decision Ledger</title>
        <meta name="description" content="The requested page could not be found on Decision Ledger." />
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
            maxWidth: "540px",
            width: "100%",
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
              <span>Decision Ledger - Error</span>
            </div>
            <div className="w95-title-controls">
              <Link href="/" legacyBehavior>
                <a
                  className="w95-title-btn"
                  title="Close and return to Homepage"
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    lineHeight: "14px",
                  }}
                >
                  ✕
                </a>
              </Link>
            </div>
          </div>

          {/* Dialog Body */}
          <div className="p-3">
            {/* Header row: Icon vertically center-aligned with the heading text specifically */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "12px",
              }}
            >
              <img
                src="/icons/msg-error.png"
                alt="Error"
                style={{
                  width: 32,
                  height: 32,
                  flexShrink: 0,
                  imageRendering: "pixelated",
                }}
              />
              <h2
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  margin: 0,
                  color: "#000000",
                  fontFamily: "inherit",
                  lineHeight: "1.2",
                }}
              >
                404 - Page Not Found
              </h2>
            </div>

            <p
              style={{
                margin: "0 0 12px 0",
                lineHeight: "1.55",
                fontSize: "13px",
                color: "#222222",
              }}
            >
              The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>

            <div
              className="w95-inset p-2 bg-white mb-3"
              style={{
                fontSize: "12px",
                lineHeight: "1.6",
                color: "#111111",
              }}
            >
              <div>
                <strong>Error Code:</strong> <code>0x00000404</code>
              </div>
              <div style={{ wordBreak: "break-all" }}>
                <strong>Requested URL:</strong> <code>{requestedUrl || router.asPath || "/..."}</code>
              </div>
            </div>

            {/* Action Buttons: 8-12px gap, right aligned, shared button component */}
            <div
              className="d-flex justify-content-end align-items-center pt-2"
              style={{ gap: "10px" }}
            >
              <Link href="/" legacyBehavior>
                <a
                  className="w95-btn"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  ← Back to Decision Ledger
                </a>
              </Link>
              <Link href="/" legacyBehavior>
                <a
                  className="w95-btn w95-btn-primary"
                  style={{ textDecoration: "none" }}
                >
                  Go to Homepage
                </a>
              </Link>
            </div>
          </div>

          {/* Status Bar: Matches Login Modal pattern */}
          <div className="w95-statusbar">
            <div className="w95-status-pane flex-grow-1">
              Status: Page not found
            </div>
            <div className="w95-status-pane">
              Host: Vercel Edge
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
