# THE LAST INNINGS.

**THE MATCH ENDS. THE LEGACY DOESN'T.**

An interactive 3D documentary tribute dedicated to Mahendra Singh Dhoni — from Ranchi and Kharagpur to Chennai Super Kings and world cricket history.

## Tech Stack

- **Framework:** React 18 + TypeScript + Vite
- **3D Engine:** Three.js + React Three Fiber + `@react-three/drei`
- **Choreography:** GSAP + ScrollTrigger + Lenis Smooth Scroll + Framer Motion
- **Audio:** Procedural Web Audio API documentary pad & stadium ambience engine
- **Styling:** Tailwind CSS + self-hosted `@fontsource` typography (`Cinzel`, `Cormorant Garamond`, `Plus Jakarta Sans`, `JetBrains Mono`)

## Local Development

```bash
npm install
npm run dev
```

## Production Build & Vercel Deployment

```bash
npm run build
```

Includes `vercel.json` configured for Vite static output (`dist/`) with immutable asset caching headers.

## Media & Photography Replacement Guide

Authentic photographs in `public/assets/media/` are sourced from Wikimedia Commons under CC0, CC BY, CC BY-SA, GODL-India, and Public Domain licenses (see `public/assets/media/ATTRIBUTION.md`).

To replace any still photograph or upgrade to licensed match video footage:
1. Place the replacement media file inside `public/assets/media/`
2. Update the matching `src` entry in `src/data/dhoniData.ts` (`PHOTO_ASSETS`)
