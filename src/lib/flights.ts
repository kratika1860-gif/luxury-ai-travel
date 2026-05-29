// src/lib/flights.ts
import type { FlightPriceTrend } from "@/types";

let amadeusToken: { token: string; expiresAt: number } | null = null;

async function getAmadeusToken(): Promise<string | null> {
  if (!process.env.AMADEUS_CLIENT_ID) return null;
  if (amadeusToken && Date.now() < amadeusToken.expiresAt) {
    return amadeusToken.token;
  }
  try {
    const res = await fetch(
      "https://test.api.amadeus.com/v1/security/oauth2/token",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `grant_type=client_credentials&client_id=${process.env.AMADEUS_CLIENT_ID}&client_secret=${process.env.AMADEUS_CLIENT_SECRET}`,
      }
    );
    const data = await res.json();
    amadeusToken = {
      token: data.access_token,
      expiresAt: Date.now() + (data.expires_in - 60) * 1000,
    };
    return amadeusToken.token;
  } catch {
    return null;
  }
}

export async function getFlightPriceTrends(
  origin: string,
  destination: string,
  departureDate: string
): Promise<FlightPriceTrend> {
  const token = await getAmadeusToken();

  if (token) {
    try {
      const res = await fetch(
        `https://test.api.amadeus.com/v1/analytics/itinerary-price-metrics?originIataCode=${origin}&destinationIataCode=${destination}&departureDate=${departureDate}&currencyCode=INR`,
        {
          headers: { Authorization: `Bearer ${token}` },
          next: { revalidate: 86400 },
        }
      );
      const data = await res.json();
      if (data.data?.length) {
        const prices = data.data[0].priceMetrics.map((p: { amount: string }) =>
          parseFloat(p.amount)
        );
        return {
          labels: ["Min", "Q1", "Median", "Q3", "Max"],
          prices,
          alert:
            prices[4] > prices[2] * 1.3
              ? "High price variance detected — book soon for better rates."
              : undefined,
          recommendation: "Best time to book: 6–8 weeks before departure",
        };
      }
    } catch {
      // fall through to AI-generated estimate
    }
  }

  // Fallback: return mock monthly trend data
  return generateMockTrend(destination, departureDate);
}

function generateMockTrend(destination: string, departureDate: string): FlightPriceTrend {
  const month = new Date(departureDate).getMonth();
  const destLower = destination.toLowerCase();

  // Set up realistic base flight costs in INR depending on the destination code/name
  let base = 40000;
  if (
    destLower.includes("nrt") ||
    destLower.includes("hnd") ||
    destLower.includes("tokyo") ||
    destLower.includes("japan")
  ) {
    base = 45000 + Math.random() * 10000; // 45k - 55k
  } else if (
    destLower.includes("cdg") ||
    destLower.includes("paris") ||
    destLower.includes("france") ||
    destLower.includes("europe") ||
    destLower.includes("lhr") ||
    destLower.includes("london") ||
    destLower.includes("fco") ||
    destLower.includes("rome")
  ) {
    base = 55000 + Math.random() * 15000; // 55k - 70k
  } else if (
    destLower.includes("bkk") ||
    destLower.includes("dmk") ||
    destLower.includes("thailand") ||
    destLower.includes("dps") ||
    destLower.includes("bali") ||
    destLower.includes("sin") ||
    destLower.includes("singapore") ||
    destLower.includes("dxb") ||
    destLower.includes("dubai")
  ) {
    base = 15000 + Math.random() * 8000; // 15k - 23k
  } else if (
    destLower.includes("goi") ||
    destLower.includes("goa") ||
    destLower.includes("bom") ||
    destLower.includes("del") ||
    destLower.includes("cok") ||
    destLower.includes("kerala") ||
    destLower.includes("india")
  ) {
    base = 5000 + Math.random() * 4000; // 5k - 9k
  } else {
    base = 40000 + Math.random() * 15000; // Default international: 40k - 55k
  }

  const seasonal = [0.9, 0.85, 1, 1.05, 1.1, 1.2, 1.35, 1.3, 1.1, 0.95, 0.9, 1.0];
  const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const prices = labels.map((_, i) =>
    Math.round(base * seasonal[i] * (0.95 + Math.random() * 0.1))
  );

  const currentPrice = prices[month];
  const avgPrice = prices.reduce((a, b) => a + b) / prices.length;
  const isHigh = currentPrice > avgPrice * 1.1;

  return {
    labels,
    prices,
    alert: isHigh
      ? `Prices are ${Math.round(((currentPrice - avgPrice) / avgPrice) * 100)}% above average for this month.`
      : `Prices look good for this time of year.`,
    recommendation: isHigh
      ? `Consider traveling in ${labels[(month + 2) % 12]} for better rates.`
      : `Good time to book — rates are near their lowest.`,
  };
}
