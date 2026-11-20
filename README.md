# Mrinmoy Borah — Premium Backend Engineer Portfolio

[![Astro](https://img.shields.io/badge/Astro-v5-orange.svg)](https://astro.build/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![WCAG 2.2 AA](https://img.shields.io/badge/Accessibility-WCAG_2.2_AA-green.svg)](https://www.w3.org/WAI/standards-guidelines/wcag/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A production-ready personal portfolio engineered for **Mrinmoy Borah** (Backend Software Engineer, B.Tech CSE at Dhemaji Engineering College, graduating 2027). Built with Astro, TypeScript, and Tailwind CSS with an asymmetric editorial design, an animated orbital systems illustration, an interactive Redis circuit breaker & caching simulator, and deep verified project case studies.

---

## 🎨 Visual Identity & Color System

The design is grounded in an elegant, minimalist editorial aesthetic with high contrast ratios complying with **WCAG 2.2 AA**:

| Color Name | Hex Code | Role |
| :--- | :--- | :--- |
| **Jet Black** | `#0A0A0B` | Main background canvas |
| **Charcoal** | `#171719` | Secondary background, card elevation surfaces |
| **Smoke Grey** | `#929297` | Secondary text, subtle metadata, technical specs |
| **Soft White** | `#F4F2EF` | Headings, primary text, high-hierarchy copy |
| **Cherry Red** | `#C72C41` | Minimal accents, buttons, state highlights |

---

## 🛰️ Verified Engineering Systems

Every project and technical claim in this portfolio has been verified directly against actual source code and research engagements:

### 1. Adaptive AI Gateway & Resilient Workflow Engine
- **Repository:** [https://github.com/MrinmoyBrh/ai-resilient-gateway](https://github.com/MrinmoyBrh/ai-resilient-gateway)
- **Runtime & Stack:** Fastify v5, TypeScript, BullMQ, Redis (`ioredis`), PostgreSQL, Zod, Server-Sent Events (SSE).
- **Verified Mechanisms:**
  - **Deterministic SHA-256 Prompt Caching:** Normalized whitespace/case hashed with crypto SHA-256 (`cache:prompt:<hash>`) in Redis (3600s TTL), resolving cached inference in under 5ms.
  - **BullMQ Distributed Queueing:** Task decoupling with concurrency of 5 and 3 retry attempts using exponential backoff (initial delay: 1000ms).
  - **Stateful Redis Circuit Breaker:** Multi-state machine (`CLOSED`, `OPEN`, `HALF_OPEN`) tracking failure thresholds. Trips to `OPEN` on 3 consecutive upstream errors, executing instant failover from Primary (Groq Llama 3.3 70B) to Secondary (Gemini 1.5 Flash).
  - **Rolling Tenant Quotas:** Sliding 24-hour token consumption validation in PostgreSQL before queue ingestion.

### 2. APGCL Web Application & Administrative Dashboard
- **Context:** Assam Power Generation Corporation Limited (APGCL) Internship.
- **Runtime & Stack:** PHP 8.4, Laravel 13, Laravel Fortify, Livewire 4, Flux UI, MySQL 8.0, Tailwind CSS.
- **Verified Features:**
  - **Hardened Administrative Authentication:** WebAuthn / Passkeys authentication alongside Time-based One-Time Password (TOTP) two-factor challenge.
  - **Transactional Notification Engine:** Automated email verification and notification workflows.
  - **Statutory Document Distribution:** Hierarchical document routing for electricity tariffs, Right to Information (RTI) disclosures, executive acts, and annual financial statements.

### 3. Crop Disease Detection Using Image Processing
- **Context:** Academic Research associated with National Institute of Technology Silchar (NIT Silchar).
- **Stack:** Python 3, OpenCV, TensorFlow / PyTorch, NumPy.
- **Verified Pipeline:**
  - Multi-stage chromatic segmentation converting RGB captures into HSV and LAB color spaces to isolate chlorosis and foliar necrosis.
  - Mathematical morphology (bilateral noise filtering, Otsu thresholding) for lesion contour extraction.
  - Convolutional deep learning classifier diagnosing agricultural pathologies.

---

## ⚡ Core Sections

1. **How I Build (`SkillsGrid.astro`):**
   - Clean, modern editorial layout with generous spacing and minimal borders.
   - Organized into:
     - **Backend Development**: Node.js, TypeScript, Express.js, Fastify, Python, Laravel, PHP, REST APIs
     - **Databases**: PostgreSQL, MySQL, MongoDB, Redis
     - **Cloud & Infrastructure**: Docker, Linux, Nginx, Git & GitHub
     - **Developer Tools**: Postman, VS Code, npm, Vite

2. **Building for the Unexpected (`Principles.astro`):**
   - Three elegant, numbered perspectives:
     - `01 — Expect Things to Go Wrong`: Thinking about failure scenarios early saves trouble later.
     - `02 — Keep Things Simple`: Practical, clear, and easy to maintain approaches.
     - `03 — Learn from What Breaks`: Turning debugging challenges into learning experiences.

3. **Live Circuit Breaker Simulator (`CircuitSimulator.astro`):**
   - Interactive client-side harness simulating sub-5ms SHA-256 cache hits and Redis circuit breaker failover.

4. **Animated Orbital Systems Canvas (`OrbitalVisual.astro`):**
   - Concentric SVG topology with 60fps animations respecting `prefers-reduced-motion: reduce`.

5. **Interactive Telemetry Terminal (`InteractiveTerminal.astro`):**
   - Built-in terminal supporting commands: `help`, `whoami`, `status`, `projects`, `stack`, `principles`, `contact`, and `clear`.

---

## 🚀 Running Locally

```bash
# Start local development server
npm run dev

# Build production distribution
npm run build

# Preview build
npm run preview
```

Server runs locally at: `http://localhost:4321`
