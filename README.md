<div align="center">

<img src="public/img/logo.png" alt="Decision Ledger Logo" width="128" height="128" />

# Decision Ledger
### Intelligent Architectural Decision Repository

> **Live Production Application:** 🌐 [https://roy-decisionledger.vercel.app/](https://roy-decisionledger.vercel.app/)  
> **Architect & Lead Developer:** [Pinaki Roy](https://www.linkedin.com/in/pinakiroysocial/)  
> **Platform Status:** Operational & Live in Production  
> **UI Aesthetic:** Authentic Windows 95 Full-Screen Workstation  
> **Core Architecture:** Next.js 14 • Vercel Edge Platform • Firebase Firestore • Gemini 3.5 Flash

</div>

---

## Executive Overview

**Decision Ledger** is an architectural decision repository designed for engineering organizations, software architects, and tech leads. It turns unstructured engineering notes into durable, structured Architectural Decision Records (ADRs) with automated rationale extraction and conversational AI synthesis powered by **Google Gemini 3.5 Flash**.

Wrapped in a pixel-perfect, authentic **Windows 95 workstation dashboard**, the platform combines high-density desktop ergonomics with modern enterprise security, multi-tenant privacy, and serverless scalability.

---

## Key Capabilities

### 1. AI Decision Extraction & Structuring
- Ingests raw developer notes, slack excerpts, or meeting transcripts.
- Uses **Gemini 3.5 Flash** with JSON mode to distill unstructured notes into:
  - Concise Decision Title
  - Options Evaluated & Trade-offs
  - Chosen Architectural Direction
  - Justification & Rationale
  - Multi-dimensional Categorical Tags

### 2. Conversational Rationale Engine ("Ask Why")
- Instant semantic reasoning over past architectural decisions.
- Answers questions like *"Why did we choose PostgreSQL over MongoDB?"* or *"What was the rationale for Vercel Edge deployment?"* by grounding answers strictly in stored decision documents.

### 3. Ledger Explorer & Multi-Tenant Management
- High-density table view with instant real-time client filtering by title, chosen option, and keyword tags.
- Full inspection modal with structured option comparison.
- In-place decision editing and soft-delete / Recycle Bin management with recovery workflows.
- One-click JSON data export.

### 4. Public Access & Guest Evaluation Mode
- Friction-free access: Sign in with any Google account or evaluate the full platform immediately via **Guest Mode** with one-click starter decision seeding.

---

## Security & Architecture Specifications

| Layer | Implementation Details |
|---|---|
| **Live Production** | 🌐 [https://roy-decisionledger.vercel.app/](https://roy-decisionledger.vercel.app/) |
| **Lead Architect** | [Pinaki Roy (LinkedIn)](https://www.linkedin.com/in/pinakiroysocial/) |
| **Frontend & API** | Next.js 14 (Pages & API routes) |
| **Hosting & Edge** | Vercel Global Edge Network |
| **Database** | Firebase Firestore with server-side Admin SDK verification |
| **AI Synthesis** | Google Gemini 3.5 Flash with fallback resilience |
| **Authentication** | Firebase Authentication (Google OAuth 2.0 & Anonymous Guest Sessions) |
| **Authorization** | Strict per-user UID isolation (`ownerUid`) across all CRUD endpoints |
| **IDOR Defense** | Server-side ownership validation on updates and deletions (403 Forbidden on mismatch) |
| **Rate Limiting** | In-memory token-bucket request throttling per user UID on AI inference endpoints |
| **HTTP Security** | Hardened security headers (`X-Frame-Options`, `nosniff`, `strict-origin`, `no-powered-by`) |

---

## Watermark & Author Attribution

This system was architected, engineered, and polished by **Pinaki Roy**.

- **Live URL:** [https://roy-decisionledger.vercel.app/](https://roy-decisionledger.vercel.app/)
- **LinkedIn:** [https://www.linkedin.com/in/pinakiroysocial/](https://www.linkedin.com/in/pinakiroysocial/)
- **Repository:** Decision Ledger Workstation Edition
- **Copyright:** © 2026 Pinaki Roy. All Rights Reserved.
