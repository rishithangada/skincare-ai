# Skin Care AI

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript) ![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss) ![Anthropic Vision](https://img.shields.io/badge/Anthropic-Claude_Vision-orange?logo=anthropic)

Part of the **SPIRIT Labs** portfolio — AI-powered products by [Rishi Thangada](https://github.com/rishithangada).

---

## What It Does

Skin Care AI analyzes your skin and recommends products — either by snapping a photo with your camera or filling out a quick bio profile. Claude Vision processes the image or profile data and returns a personalized analysis with matched product cards from a curated marketplace.

---

## Features

- **Dual input modes** — camera capture (live webcam) or bio form (skin type, concerns, goals)
- **Claude Vision analysis** — skin type classification, concern detection, and recommendation rationale
- **4-column infinite-scroll marketplace** — product cards auto-scroll in alternating directions per column for a dynamic browsing experience
- **Affiliate product links** — every recommendation links directly to purchase
- **Mobile-first** — works on any device with a camera; designed for phone use

---

## Setup

```bash
npm install
```

Create `.env.local`:
```
ANTHROPIC_API_KEY=your_key_here
```

```bash
npm run dev
```

Open [http://localhost:3002](http://localhost:3002).

---

## Status

Active development. Part of the SPIRIT Labs product portfolio.
