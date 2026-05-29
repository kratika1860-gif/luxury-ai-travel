# Traviq AI — Luxury AI Travel OS

Traviq is an AI-powered travel dashboard designed to predict realistic costs, optimize foreign exchange options, maximize credit card rewards, and organize daily itineraries.

---

## ⚡ Features

1. **AI Cost Prediction:** Estimates realistic budgets based on destination, duration, and travel style.
2. **AI Travel Intelligence:** Built-in widgets showing weather risks, political stability, health advisories, crowd alerts, and currency volatility.
3. **Timeline Itinerary:** Day-by-day itinerary showing recommended hotels, transit directions, meal concierge suggestions, and local hacks.
4. **Forex Optimizer:** Live foreign exchange comparison (Wise, Revolut, ATMs, airport exchanges) to find the cheapest option.
5. **Credit Card Rewards:** Automatically ranks and recommends credit cards based on your spending pattern.

---

## 🛠️ Tech Stack

* **Frontend & Backend:** Next.js 14 (App Router)
* **3D Visuals:** React Three Fiber (client-side interactive globe)
* **Database:** PostgreSQL with Prisma ORM
* **Authentication:** NextAuth.js
* **Styling:** Tailwind CSS

---

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
DATABASE_URL="your-postgresql-url"
NEXTAUTH_SECRET="your-nextauth-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
ANTHROPIC_API_KEY="your-anthropic-key"
EXCHANGE_RATES_API_KEY="your-exchangerates-key"
```

### 3. Initialize the Database
```bash
npx prisma generate
npx prisma db push
```

### 4. Run Locally
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.
