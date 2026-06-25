# Skin Care AI

A mobile-first web application that analyzes skin via camera and returns personalized skincare recommendations.

## Overview

Users open the app on any device with a camera, capture a photo, and receive an AI-generated skin analysis with product recommendations matched to their specific skin type and concerns.

## How It Works

1. User opens `/scan` — camera activates in the browser
2. Photo is captured and sent to `/api/analyze`
3. Claude vision returns `{ skinType, concerns[], recommendations[] }`
4. Results page shows analysis and matched product cards

## Tech Stack

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS
- **Camera:** Web API (`navigator.mediaDevices.getUserMedia`)
- **AI:** Claude vision for skin analysis
- **Target:** Mobile-first, works in any modern browser

## Project Structure

```
skincare-ai/
├── app/
│   ├── page.tsx             # Landing page
│   ├── scan/page.tsx        # Camera capture
│   ├── results/page.tsx     # Analysis output
│   └── api/analyze/route.ts # Vision handler
└── components/
```

## Status

Planning. Part of the SPIRIT OS project portfolio.

## Setup

```bash
npm install
cp .env.example .env.local   # Add ANTHROPIC_API_KEY
npm run dev
```
