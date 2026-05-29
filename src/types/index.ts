// src/types/index.ts

export type TravelStyle = "budget" | "moderate" | "luxury";
export type TripStatus = "planning" | "active" | "completed";
export type ExpenseCategory = "transportation" | "accommodation" | "food" | "activities" | "misc";

export interface Trip {
  id: string;
  userId: string;
  origin: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  travelers: number;
  travelStyle: TravelStyle;
  status: TripStatus;
  predictedCost?: number;
  overspendRisk?: number;
  aiAnalysis?: AIAnalysis;
  expenses?: Expense[];
  createdAt: string;
}

export interface Expense {
  id: string;
  tripId: string;
  name: string;
  amount: number;
  category: ExpenseCategory;
  paidBy: string;
  splitWith: string[];
  date: string;
}

export interface AIHotelRecommendation {
  name: string;
  pricePerNight: number;
  rating: string;
  description: string;
  suitability: string;
  distanceToCenter?: string;
  amenities?: string[];
  type?: string;
  benefits?: string[];
  bookingPlatform?: string;
  priceCategory?: string;
  sustainability?: string;
  checkInTime?: string;
  cancellationPolicy?: string;
  neighborhoodVibe?: string;
  loyaltyProgram?: string;
}

export interface AIDayPlan {
  day: number;
  title: string;
  activities: string[];
  estimatedCost: number;
  placesToVisit: string[];
  hotel?: string;
  transport?: string[];
  mealSuggestions?: Array<{ meal: string; place: string; cost: number; tip: string }>;
  localHacks?: string[];
  weatherNote?: string;
}

export interface AIAnalysis {
  summary: string;
  predictedCost: number;
  overspendRisk: number; // 0-100
  costBreakdown: {
    flights: number;
    accommodation: number;
    food: number;
    transportation: number;
    activities: number;
    hiddenFees: number;
  };
  recommendations: string[];
  bestBookingTime: string;
  budgetTips: string[];
  forexAdvice: string;
  hotels?: AIHotelRecommendation[];
  itinerary?: AIDayPlan[];
  riskIntel?: {
    weatherRisk: string;
    politicalStability: string;
    healthAdvisory: string;
    peakCrowdAlert: string;
    currencyVolatility: string;
  };
  flightStrategy?: {
    cheapestDays: string;
    bestAirlines: string[];
    layoverTip: string;
    seatRecommendation: string;
    baggageWarning: string;
  };
  pricingIntel?: {
    vsLastYear: string;
    bookingWindow: string;
    alternativeDestination: string;
    peakAvoidance: string;
  };
}

export interface ForexRate {
  provider: string;
  rate: number;
  markup: number; // %
  fee: number;    // INR
  totalCost: number;
  savings: number;
  recommended: boolean;
}

export interface CreditCardRecommendation {
  id: string;
  name: string;
  estimatedRewards: number;
  perks: string[];
  recommended: boolean;
}

export interface TripTraveler {
  id: string;
  name: string;
  email: string;
  balance: number; // positive = gets back, negative = owes
}

export interface SplitSummary {
  totalExpenses: number;
  perPerson: number;
  travelers: TripTraveler[];
}

export interface FlightPriceTrend {
  labels: string[];
  prices: number[];
  alert?: string;
  recommendation?: string;
}
