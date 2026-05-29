// src/lib/cards.ts
import type { CreditCardRecommendation } from "@/types";

export interface CardData {
  id: string;
  name: string;
  annualFee: number;
  noForeignFee: boolean;
  travelRewardRate: number;  // multiplier on travel spend
  diningRewardRate: number;
  generalRewardRate: number;
  pointValueCents: number;   // value of 1 point/mile in cents
  perks: string[];
  signupBonus: number;       // in USD equivalent
}

export const CREDIT_CARDS: CardData[] = [
  {
    id: "hdfc-infinia",
    name: "HDFC Infinia",
    annualFee: 12500,
    noForeignFee: false,
    travelRewardRate: 5,
    diningRewardRate: 5,
    generalRewardRate: 3.3,
    pointValueCents: 100,
    perks: ["5x reward points on SmartBuy", "Unlimited domestic & international lounge access", "Low 2% forex markup fee", "1:1 points transfer ratio"],
    signupBonus: 12500,
  },
  {
    id: "axis-atlas",
    name: "Axis Bank Atlas",
    annualFee: 5000,
    noForeignFee: false,
    travelRewardRate: 5,
    diningRewardRate: 2,
    generalRewardRate: 2,
    pointValueCents: 100,
    perks: ["5 Edge Miles on flights/hotels", "Airport concierge services", "Tier-based milestone benefits", "No minimum spend for lounge"],
    signupBonus: 5000,
  },
  {
    id: "sbi-elite",
    name: "SBI Card ELITE",
    annualFee: 4999,
    noForeignFee: false,
    travelRewardRate: 4,
    diningRewardRate: 4,
    generalRewardRate: 2,
    pointValueCents: 25,
    perks: ["Free movie tickets worth ₹6,000/year", "6 Club Vistara CV Points per ₹200", "Complimentary lounge access"],
    signupBonus: 5000,
  },
  {
    id: "amex-plat-travel",
    name: "Amex Platinum Travel",
    annualFee: 5000,
    noForeignFee: false,
    travelRewardRate: 3,
    diningRewardRate: 3,
    generalRewardRate: 1,
    pointValueCents: 50,
    perks: ["10,000 bonus points on ₹1.9L spend", "Taj Holidays voucher worth ₹10,000", "Complimentary domestic lounge access"],
    signupBonus: 8000,
  },
  {
    id: "hdfc-regalia-gold",
    name: "HDFC Regalia Gold",
    annualFee: 2500,
    noForeignFee: false,
    travelRewardRate: 4,
    diningRewardRate: 4,
    generalRewardRate: 2,
    pointValueCents: 35,
    perks: ["4 reward points per ₹150 spend", "Complimentary Club Vistara Silver membership", "Domestic & International lounge access"],
    signupBonus: 2500,
  },
  {
    id: "niyo-global",
    name: "Niyo Global Card",
    annualFee: 0,
    noForeignFee: true,
    travelRewardRate: 1,
    diningRewardRate: 1,
    generalRewardRate: 1,
    pointValueCents: 100,
    perks: ["Zero forex markup fee", "Complimentary airport lounge access in India", "Interest on savings balance", "Easy app-based tracking"],
    signupBonus: 0,
  },
];

export function calculateCardRewards(
  card: CardData,
  spend: {
    flights: number;
    accommodation: number;
    food: number;
    transportation: number;
    activities: number;
    misc: number;
  },
  destination: string
): number {
  const foreignFeeImpact = card.noForeignFee
    ? 0
    : (Object.values(spend).reduce((a, b) => a + b) * 0.03);

  const points =
    spend.flights * card.travelRewardRate +
    spend.accommodation * card.travelRewardRate +
    spend.food * card.diningRewardRate +
    spend.transportation * card.travelRewardRate +
    spend.activities * card.generalRewardRate +
    spend.misc * card.generalRewardRate;

  const rewardsValue = (points * card.pointValueCents) / 100;
  return Math.round(rewardsValue - foreignFeeImpact);
}

export function getCardRecommendations(
  userCardIds: string[],
  spend: {
    flights: number;
    accommodation: number;
    food: number;
    transportation: number;
    activities: number;
    misc: number;
  },
  destination: string
): CreditCardRecommendation[] {
  const userCards = CREDIT_CARDS.filter((c) => userCardIds.includes(c.id));
  const allCards = userCardIds.length > 0 ? userCards : CREDIT_CARDS;

  const results = allCards.map((card) => ({
    id: card.id,
    name: card.name,
    estimatedRewards: calculateCardRewards(card, spend, destination),
    perks: card.perks,
    recommended: false,
  }));

  results.sort((a, b) => b.estimatedRewards - a.estimatedRewards);
  if (results.length > 0) results[0].recommended = true;

  return results;
}
