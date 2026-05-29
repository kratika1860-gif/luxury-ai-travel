// src/lib/forex.ts
import type { ForexRate } from "@/types";

const CURRENCY_MAP: Record<string, string> = {
  Japan: "JPY",
  France: "EUR",
  Germany: "EUR",
  Italy: "EUR",
  Spain: "EUR",
  UK: "GBP",
  "United Kingdom": "GBP",
  UAE: "AED",
  Australia: "AUD",
  Canada: "CAD",
  India: "INR",
  Thailand: "THB",
  Singapore: "SGD",
  Mexico: "MXN",
  Brazil: "BRL",
};

export function getCurrencyForDestination(destination: string): string {
  for (const [country, currency] of Object.entries(CURRENCY_MAP)) {
    if (destination.toLowerCase().includes(country.toLowerCase())) {
      return currency;
    }
  }
  return "USD";
}

export async function getLiveForexRate(
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  try {
    const apiKey = process.env.EXCHANGE_RATES_API_KEY;
    if (!apiKey) throw new Error("No API key");

    const res = await fetch(
      `${process.env.EXCHANGE_RATES_BASE_URL}/latest?access_key=${apiKey}&base=${fromCurrency}&symbols=${toCurrency}`,
      { next: { revalidate: 3600 } } // Cache 1 hour
    );
    const data = await res.json();
    return data.rates[toCurrency];
  } catch {
    // Fallback rates (roughly accurate as of mid-2025, base INR)
    const fallbacks: Record<string, number> = {
      "INR-JPY": 1.79,
      "INR-EUR": 0.011,
      "INR-GBP": 0.0095,
      "INR-AED": 0.044,
      "INR-AUD": 0.0185,
      "INR-CAD": 0.0163,
      "INR-USD": 0.012,
      "INR-THB": 0.42,
      "INR-SGD": 0.0162,
    };
    return fallbacks[`${fromCurrency}-${toCurrency}`] ?? 1;
  }
}

export async function getForexComparison(
  amount: number,
  toCurrency: string
): Promise<ForexRate[]> {
  const baseRate = await getLiveForexRate("INR", toCurrency);

  const providers = [
    { name: "Wise", markupPct: 0.35, fee: 500 },
    { name: "Revolut", markupPct: 0.45, fee: 0 },
    { name: "PayPal", markupPct: 3.5, fee: 0 },
    { name: "Bank Transfer", markupPct: 2.15, fee: 2500 },
    { name: "Airport Exchange", markupPct: 6.0, fee: 0 },
  ];

  const baselineCost = amount; // bank transfer is "baseline"

  const results: ForexRate[] = providers.map((p) => {
    const effectiveRate = baseRate * (1 - p.markupPct / 100);
    const totalCost = amount + p.fee + (amount * p.markupPct) / 100;
    return {
      provider: p.name,
      rate: effectiveRate,
      markup: p.markupPct,
      fee: p.fee,
      totalCost: Math.round(totalCost * 100) / 100,
      savings: Math.round((baselineCost - totalCost) * 100) / 100,
      recommended: false,
    };
  });

  // Mark cheapest as recommended
  const cheapest = results.reduce((a, b) =>
    a.totalCost < b.totalCost ? a : b
  );
  cheapest.recommended = true;

  return results.sort((a, b) => a.totalCost - b.totalCost);
}
