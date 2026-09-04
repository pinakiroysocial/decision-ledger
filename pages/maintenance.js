/**
 * Decision Ledger – System Maintenance
 * Architect & Developer: Pinaki Roy
 * LinkedIn: https://www.linkedin.com/in/pinakiroysocial/
 * © 2026 Pinaki Roy. All Rights Reserved.
 */
import Head from "next/head";

export default function MaintenancePage() {
  return (
    <>
      <Head>
        <title>System Maintenance – Decision Ledger</title>
        <meta name="description" content="Decision Ledger is undergoing scheduled system maintenance." />
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
              <span>Decision Ledger - System Maintenance</span>
            </div>
          </div>

          {/* Dialog Body */}
          <div className="p-3">
            <div className="d-flex align-items-start gap-3 mb-3">
              <img
                src="/icons/msg-maintenance.png"
                alt="Maintenance"
                style={{
                  width: 32,
                  height: 32,
                  flexShrink: 0,
                  imageRendering: "pixelated",
                  marginTop: 2,
                }}
              />
              <div style={{ flex: 1 }}>
                <h2
                  style={{
                    fontSize: "16px",
                    fontWeight: "bold",
                    margin: "0 0 8px 0",
                    color: "#000000",
                    fontFamily: "inherit",
                  }}
                >
                  Scheduled System Maintenance
                </h2>
                <p
                  style={{
                    margin: "0 0 12px 0",
                    lineHeight: "1.55",
                    fontSize: "13px",
                    color: "#222222",
                  }}
                >
                  Decision Ledger is currently undergoing scheduled infrastructure upgrades and database maintenance. We will be back online shortly.
                </p>

                <div
                  className="w95-inset p-2 bg-white"
                  style={{
                    fontSize: "12px",
                    lineHeight: "1.6",
                    color: "#111111",
                  }}
                >
                  <div>
                    <strong>System State:</strong> <span>Offline for Maintenance</span>
                  </div>
                  <div>
                    <strong>Cloud Infrastructure:</strong> <span>Vercel Global Edge / Google Cloud Firestore</span>
                  </div>
                  <div>
                    <strong>Estimated Resumption:</strong> <span>Shortly</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="d-flex justify-content-end align-items-center pt-2">
              <button
                type="button"
                className="w95-btn w95-btn-primary"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.location.reload();
                  }
                }}
              >
                Check Status (Reload)
              </button>
            </div>
          </div>

          {/* Status Bar */}
          <div className="w95-statusbar">
            <div className="w95-status-pane flex-grow-1">
              Status: Maintenance Mode Active
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
