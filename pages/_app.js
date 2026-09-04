/**
 * Decision Ledger – Architectural Decision Repository
 * Architect & Developer: Pinaki Roy
 * LinkedIn: https://www.linkedin.com/in/pinakiroysocial/
 * © 2026 Pinaki Roy. All Rights Reserved.
 */
import Head from "next/head";
import { Analytics } from "@vercel/analytics/next";
import "bootstrap/dist/css/bootstrap.min.css";
import "../public/css/w95.css";
import "../public/css/retro-enhancements.css";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Decision Ledger – Architectural Decision Repository</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Decision Ledger – Architectural Decision Repository architected and built by Pinaki Roy." />
        <meta name="author" content="Pinaki Roy" />
        <meta name="creator" content="Pinaki Roy" />
        <meta name="publisher" content="Pinaki Roy" />
        <link rel="author" href="https://www.linkedin.com/in/pinakiroysocial/" />
        <meta property="og:title" content="Decision Ledger – Architectural Decision Repository" />
        <meta property="og:description" content="Structured architectural decision logs and AI-powered decision analysis by Pinaki Roy." />
        <meta property="og:author" content="Pinaki Roy" />
        <meta name="theme-color" content="#008080" />
        <link rel="icon" href="/icons/app-d.png" />
      </Head>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}
