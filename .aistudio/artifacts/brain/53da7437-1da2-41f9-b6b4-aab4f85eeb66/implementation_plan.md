# Cinematic Typography, Viewport-Fluid Responsive Spacing & 60fps+ Motion Architecture

Comprehensive design and performance overhaul transforming Radio Lofi into an immersive, cinematic audio archive. This implementation introduces high-contrast classical and editorial cinema typography (Cinzel & Cormorant Garamond paired with Plus Jakarta Sans and IBM Plex Mono), device-aware viewport-fluid spatial scaling with touch-ergonomic mobile dock and expansive desktop canvas, and a 60fps+ GPU-composited animation pipeline with zero layout shifts.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following directions have been confirmed through user clarification and serve as core architecture baselines:

- **Confirmed Decision 1 (Cinematic Typography)**: High-contrast cinematic serif display faces (**Cinzel** and **Cormorant Garamond**) for titles, project cards, and hero elements, paired with clean neo-grotesque sans (**Plus Jakarta Sans**) for body readability and tabular monospace (**IBM Plex Mono**) for timecodes, durations, and audio metrics.
- **Confirmed Decision 2 (Adaptive Spacing & Ratio Strategy)**: Viewport-fluid scaling (`clamp()` CSS math and responsive Tailwind breakpoints `sm:`, `md:`, `lg:`, `xl:`, `2xl:`) with a dedicated thumb-ergonomic mobile bottom dock ($44\text{px}+$ touch hitboxes, $\le 15\%$ mobile sticky height cap) and expansive widescreen desktop layout with generous gutters.
- **Confirmed Decision 3 (60fps+ Motion Architecture)**: GPU hardware-accelerated transforms (`transform-gpu`, `will-change-transform`, `opacity`, `translate3d`), spring settling physics (`cubic-bezier(0.16, 1, 0.3, 1)`), zero geometry animation (no animating `width`, `height`, `top`, or `margin`), and decoupled audio state to prevent expensive DOM reflows.

---

## 1. Overview & Core Concept

- **What It Does**: Upgrades Radio Waves into an atmospheric, high-performance audio sanctuary. The archive visually echoes classic film title sequences and high-fidelity soundboards while delivering instant, butter-smooth navigation across iPhones, Android devices, iPads, laptops, and ultra-wide desktop monitors.
- **Target Audience / Persona**: Audiophiles, lofi enthusiasts, late-night writers, and aesthetic connoisseurs seeking a focused, distraction-free listening journey with zero visual latency or jank.
- **Key Value**: Instant aesthetic elevation via cinematic typography, ergonomic comfort on any hand-held or desktop display, and silky 60fps+ interaction speeds that feel like a native desktop/mobile application.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Atmospheric First Load & Hero Experience**:
   - The user opens the archive and is greeted by a filmic masthead featuring high-contrast serif typography ("RADIO WAVES ARCHIVE") and the retro boombox emblem.
   - Dynamic viewport sizing ensures the hero never clips or creates empty desert-island voids regardless of 9:16 mobile, 16:9 laptop, or 21:9 ultrawide screens.
2. **Discography & Track Browsing**:
   - Grid items seamlessly reflow: 1–2 columns on mobile, 3 columns on tablet, 4–5 on standard desktop, 6 on widescreen.
   - Album titles render in bold cinematic serif (`Cinzel`), while metadata uses quiet unboxed text separated by subtle bullets (`·`).
   - Cards respond instantly to hover and press with hardware-accelerated micro-lift (`translate3d(0, -4px, 0)` and subtle contrast bloom) in $<120\text{ms}$.
3. **Playback & Immersion**:
   - Tapping any track starts playback immediately. The floating player bar anchors smoothly:
     - On mobile: A compact thumb-friendly player dock with large $48\text{px}$ touch targets.
     - On desktop: An audiophile studio console featuring high-precision scrubbers, volume fader, and GPU-composed audio frequency bars.

### Visual Identity & Theme
- **Aesthetic Direction**: High-contrast cinematic noir with warm analogue accents, inspired by classic Criterion film titles, A24 typography, and high-end audio mastering decks.
- **Color Palette & Distribution (60-30-10 Rule)**:
  - **60% Dominant Canvas**: Deep obsidian dark field (`#07090e`) in dark mode; crisp clean off-white (`#f8fafc`) in light mode.
  - **30% Structural Surfaces**: Subdued obsidian cards (`#0e131f`), hairline border dividers (`rgba(255,255,255,0.06)`), and muted slate typography (`#94a3b8`).
  - **10% High-Intent Accents**: Luminous electric cyan (`#00f0ff`) and warm amber glow (`#fbbf24`) reserved strictly for active playback states, play buttons, and focus highlights.
- **Typography & Font Scale**:
  - **Display / Masthead / Album Titles**: `Cinzel` (weights 600, 700) and `Cormorant Garamond` (weights 500, 600, 700) with wide tracking (`tracking-wide` to `tracking-widest`).
  - **Body / Navigation / Controls**: `Plus Jakarta Sans` (weights 400, 500, 600) for sharp readability at all sizes.
  - **Metrics / Durations / Numbers**: `IBM Plex Mono` with `tabular-nums` for rock-solid vertical alignment in lists and timelines.
  - **Responsive Fluid Scale**: `clamp(2rem, 5vw, 4rem)` for hero display, `clamp(1rem, 2vw, 1.25rem)` for card titles, and standard $14\text{px}$–$16\text{px}$ for list rows.
- **Interactive Feedback & 60fps+ Motion**:
  - All interactive elements use `transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]` and `transform-gpu`.
  - Scrubber and progress bars use CSS variables updated via `requestAnimationFrame` to decouple audio ticker updates from React re-renders.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Google Fonts CDN Preconnect & Font Display Swap**
  - *Chosen Approach*: Inject Google Fonts links in `index.html` with `rel="preconnect"` for `fonts.googleapis.com` and `fonts.gstatic.com` with `display=swap`.
  - *Why*: Eliminates flash of unstyled text (FOUT) while guaranteeing rapid font hydration without blocking initial page paint.
  - *Alternatives Considered*: Bundling local WOFF2 files (adds bundle weight to client payload; Google CDN is globally edge-cached and faster for web fonts).
- **Decision 2: Pure CSS Viewport-Fluid Clamps vs JavaScript Window Listeners**
  - *Chosen Approach*: Use CSS `clamp()`, `min()`, `max()`, and Tailwind's responsive breakpoints (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`) rather than JavaScript `window.onresize` state listeners.
  - *Why*: CSS layout calculations run directly in the browser's native C++ engine without executing JavaScript or triggering component re-renders during window resizing or orientation changes.
  - *Alternatives Considered*: React resize observer hooks (causes React re-render thrashing at 60fps).
- **Decision 3: Dedicated Mobile Dock Navigation + Desktop Widescreen Sidebar**
  - *Chosen Approach*: Sidebar remains sticky and proportional on desktop/tablet, while mobile screens switch to a bottom thumb dock with minimum $44\text{px}$ tap hitboxes and sticky top bar satisfying the $\le 15\%$ viewport height limit.
  - *Why*: Matches thumb reach ergonomics on iOS/Android while preserving multi-column power and generous breathing room on large screens.

---

## 4. Technical Architecture & Data Strategy

### Architecture & Component Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        INDEX.HTML / GOOGLE FONTS                       │
│    Cinzel (600,700) · Cormorant Garamond (500,600,700) · Plus Jakarta  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                  ROOT LAYOUT & RESPONSIVE CONTAINER                    │
│           Viewport-Fluid Container (h-screen overflow-hidden)           │
├───────────────────────────────────┬────────────────────────────────────┤
│           DESKTOP / TABLET        │               MOBILE               │
│  ┌─────────────────────────────┐  │  ┌──────────────────────────────┐  │
│  │  Sidebar Navigation         │  │  │  Sticky Mobile Header        │  │
│  │  (Width: 64-72, Cinzel logo)│  │  │  (Height: 52px, Logo & Theme)│  │
│  └─────────────────────────────┘  │  └──────────────────────────────┘  │
│  ┌─────────────────────────────┐  │  ┌──────────────────────────────┐  │
│  │  Main Scroll Area           │  │  │  Mobile Thumb Dock           │  │
│  │  (Fluid padding & margins)  │  │  │  (Height: 56px, 44px+ hitboxes│
│  └─────────────────────────────┘  │  └──────────────────────────────┘  │
├───────────────────────────────────┴────────────────────────────────────┤
│                       VIEWPORT-FLUID PAGES                             │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  ┌─────────┐  │
│  │ Home          │  │ AlbumView     │  │ SearchView    │  │ Library │  │
│  │ Cinematic     │  │ Split Cover & │  │ High-density  │  │ Fluid   │  │
│  │ Masthead      │  │ Tracklist     │  │ Search Bar    │  │ Grid    │  │
│  └───────────────┘  └───────────────┘  └───────────────┘  └─────────┘  │
├────────────────────────────────────────────────────────────────────────┤
│                     GLOBAL PLAYER BAR (60FPS+)                         │
│  Hardware-Composited Scrubber · GPU Equalizer · Touch / Desktop Modes  │
└────────────────────────────────────────────────────────────────────────┘
```

### Data Model & State Integration
- **`ThemeContext`**: Persists dark/light preference in `localStorage`, controls `.light` and `.dark` classes on `<html>`.
- **`PlayerContext`**: Decouples audio position ticks from component tree updates using ref-based audio drivers for silky continuous 60fps playback rendering.
- **`LibraryContext`**: Feeds cached catalog items to view layers; `imagePreloader` continues serving instantaneous 0ms decoded album art.

### Implementation Checklist
1. **Typography Setup (`index.html`, `src/index.css`)**:
   - Import `Cinzel:wght@600;700;800` and `Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,600`.
   - Configure `@theme` variables: `--font-cinematic: "Cinzel", serif;`, `--font-serif-display: "Cormorant Garamond", Georgia, serif;`.
   - Update `<title>` to "Radio Waves Archive" and meta tags.
2. **Global Viewport & Motion Optimization (`src/index.css`)**:
   - Add hardware acceleration utilities: `.gpu-accelerate { transform: translateZ(0); will-change: transform; }`.
   - Implement fluid clamp font utilities and smooth spring easing.
   - Enforce `prefers-reduced-motion` compliance.
3. **Responsive Root Shell (`src/App.tsx`)**:
   - Refactor mobile header and bottom thumb dock with strict $44\text{px}+$ hitboxes, fluid icon dimensions, and $\le 15\%$ viewport occupancy.
   - Ensure dynamic viewport height handling (`100dvh` support).
4. **Cinematic Hero & Responsive Content (`src/pages/Home.tsx`)**:
   - Replace mechanical headers with grand cinematic masthead typography (`Cinzel` & `Cormorant Garamond`).
   - Adaptive hero layout: responsive padding (`p-4 sm:p-6 md:p-8 lg:p-12`), fluid cover sizes, and balanced text wraps.
5. **Album & Tracklist View (`src/pages/AlbumView.tsx`)**:
   - Cinematic album hero split with full-bleed backdrop blur and elegant editorial typography.
   - Responsive track table adapting from compact tap cards on mobile to spacious studio rows on desktop.
6. **Card & Player Bar Components (`src/components/ProjectCard.tsx`, `src/components/PlayerBar.tsx`)**:
   - Scale typography, icon sizes, and hitboxes based on device class.
   - 60fps hover micro-interactions with zero reflow.
