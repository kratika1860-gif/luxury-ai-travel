# 🌌 TRAVIQ AI — The Luxury AI Travel OS

> **"Most travel apps help you book. Traviq helps you survive, spend, and navigate like a sovereign local."**

---

## 🚀 The Startup Pitch: The Cockpit of Sovereign Travel

### The Problem
Traditional travel planners (like TripIt, Wanderlog, or generic AI itineraries) treat travel as a static sequence of tourist tiles. They show you "Shibuya Crossing" or "The Louvre," but they completely ignore the **financial stress, logistical hidden fees, dynamic exchange rate traps, and safety variables** of international borders. 

Travelers are forced to juggle 5 different tools:
1. An itinerary planner.
2. A budget tracker (Splitwise).
3. A forex converter (Xe).
4. Credit card blogs (to maximize points).
5. State Department warning bulletins (for safety risks).

### The Solution: Traviq AI
**Traviq is the world’s first Luxury AI Travel Operating System.** 

Inspired by the visual density of a **Bloomberg Terminal**, the sleek glassmorphism of **Apple Card**, and the high-end utility of **Robinhood**, Traviq fuses deep logistical intelligence with predictive financial modeling. 

We don't just tell you to go to Tokyo — we tell you:
* **The Exact Visa Status:** Max stay, official entry portal URLs, and processing durations in INR.
* **Point-to-Point Transit Legs:** Station-specific directions (e.g. *Keisei Skyliner Express Train from Narita to Ueno for ¥2,570*).
* **AI CFO Analysis:** Category breakdowns, live travel burn rates, and an dynamic overspend risk dial.
* **Proprietary Risk Intel:** Micro-alerts on typhoons, crowd peaks (avoid Shibuya weekends 6-9 PM), and currency opportunities (e.g. *JPY is 12% weaker vs INR — highly favorable*).
* **Gourmet Meal Concierge:** Curated, budget-appropriate establishments with specific meal items, prices, and dining hacks.
* **Forex Arbitrage Engine:** Live comparisons of card markups, Wise, PayPal, and ATMs, showing you exactly how much you save in INR.

---

## ✨ Why Traviq is 10x Better

| Traditional Planners (Wanderlog / TripIt) | Generic AI Wrappers | 🌌 TRAVIQ AI |
|---|---|---|
| **Static Tiles:** "Visit Shibuya Crossing" | **Vague Advice:** "Book flights early" | **Sovereign Detail:** Named train lines, exact costs in local currency, and precise crowd-avoidance windows. |
| **Silent Overspending:** Track budgets after you've spent the money. | **No Budget Logic:** Vague, unrealistic cost estimates. | **AI CFO Burn Engine:** Live portfolio-style overspend risk gauge, real-time markup calculators, and credit card reward rankers. |
| **Boring Web 1.0 UI:** Boring spreadsheet look or simple maps. | **Chatbot Box:** Clunky conversational interfaces. | **Luxury OS Aesthetic:** Cinematic 3D rotating globe, parallax mouse-tracking glowing borders, and glassmorphic dashboards. |

---

## 🛠️ Built with the Sovereign Tech Stack

* **Core:** Next.js 14 (App Router, dynamic client rendering)
* **3D Visuals:** Three.js + React Three Fiber (`@react-three/fiber` & `@react-three/drei` React 18 compatible)
* **Database:** PostgreSQL via Prisma ORM
* **Authentication:** NextAuth.js v5
* **Intelligence Engine:** Anthropic Claude Sonnet API
* **Financial Data:** Live Exchange Rates API
* **Animations:** Framer Motion + CSS Shimmer

---

## 📁 System Architecture

```
src/
├── app/
│   ├── page.tsx                    # Fullscreen Cinematic 3D Hero
│   ├── layout.tsx
│   ├── globals.css                 # Translucent design variables & scrollbars
│   ├── auth/signin/page.tsx        # High-end glassmorphic authentication page
│   ├── dashboard/page.tsx          # Sovereign trip portfolio list
│   ├── new-trip/page.tsx           # Parameter-rich creation deck
│   ├── trips/[id]/page.tsx         # Next.js Server dynamic fetching wrapper
│   └── api/
│       ├── auth/[...nextauth]/     # OAuth handler
│       ├── trips/                  # Database CRUD for trips & AI Analysis hooks
│       ├── forex/                  # Live currency comparison engine
│       └── ai/advice/              # On-demand AI CFO financial advice
├── components/
│   ├── ui/
│   │   ├── Globe.tsx               # client-side 3D WebGL Rotating Globe with flight paths
│   │   ├── GlowCard.tsx            # Mouse-coordinate radial glowing card container
│   │   ├── MagneticButton.tsx      # Physics-based hover attraction buttons
│   │   ├── AnimatedCounter.tsx     # Cubic-bezier currency counting animation
│   │   └── AnimatedBackground.tsx  # Floating space nebula dust canvas
│   ├── TripCard.tsx                # Hover-glowing dashboard portfolio preview
│   └── TripDetailClient.tsx        # The core visual command center panel (all 7 tabs)
├── lib/
│   ├── prisma.ts                   # Prisma Client DB singleton
│   ├── auth.ts                     # Auth config
│   ├── ai.ts                       # Structured Claude AI prompt builder & fallbacks
│   ├── forex.ts                    # Live forex calculator
│   └── cards.ts                    # Card reward engine
└── types/index.ts                  # Extended TypeScript interfaces
```

---

## 🚀 Setup & Installation

### 1. Clone the Space
```bash
git clone <your-repo-url>
cd traviq
npm install
```

### 2. Configure the Atmosphere
Create a `.env.local` file in the root directory:
```env
# Database (Neon or Supabase recommended)
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# NextAuth Configuration
NEXTAUTH_SECRET="your-base64-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Credentials
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"

# Intelligence & Markets API
ANTHROPIC_API_KEY="your-claude-api-key"
EXCHANGE_RATES_API_KEY="your-exchangerates-key"
```

### 3. Initialize the Core Database
```bash
npx prisma generate
npx prisma db push
```

### 4. Ignite Dev Engine
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** and take command.

---

## 💎 Design Philosophy & Aesthetic
We reject the minimalism of empty white space. We believe software should feel **cinematic, expensive, and powerful**.
1. **Glassmorphism:** Frosting blur filters (`backdrop-blur-md`) layered over deep space gradients (`#020204`).
2. **Micro-Animations:** Fluid mouse-hover effects, magnetic physics boundaries, and soft scale lifts.
3. **High Density Data:** No placeholders. Real numbers, real airline carriers, real costs.

---
*Traviq is ready to scale. Secure your border transit parameters, initialize your currency reserves, and command your travel.*
