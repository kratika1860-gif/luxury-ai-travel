// src/lib/ai.ts
import Anthropic from "@anthropic-ai/sdk";
import type { AIAnalysis, TravelStyle } from "@/types";

let client: Anthropic | null = null;
function getAnthropicClient() {
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || "placeholder" });
  }
  return client;
}

export async function analyzeTrip(params: {
  origin: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  travelers: number;
  travelStyle: TravelStyle;
  visaRequired: boolean;
}): Promise<AIAnalysis> {
  const duration = Math.ceil(
    (new Date(params.endDate).getTime() - new Date(params.startDate).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === "your-key-here" || apiKey === "" || apiKey.includes("...")) {
    console.warn("ANTHROPIC_API_KEY is not configured or is a placeholder. Using fallback trip analysis.");
    return generateFallbackAnalysis(params.origin, params.destination, params.budget, duration, params.travelStyle, params.travelers, params.visaRequired);
  }

  try {
    const prompt = `You are TRAVIQ AI, a travel finance expert. Analyze this trip and respond ONLY with valid JSON. All currency values (budget, predictedCost, costBreakdown details, hotel pricePerNight, itinerary estimatedCost) MUST be calculated and returned in Indian Rupees (INR).
    
    CRITICAL INSTRUCTION: You must accurately estimate the flight/transportation cost FROM the origin TO the destination. Do NOT underestimate this cost.

Trip Details:
- Origin (Departure City): ${params.origin}
- Destination: ${params.destination}
- Duration: ${duration} days (${params.startDate} to ${params.endDate})
- Budget: ₹${params.budget} INR
- Travelers: ${params.travelers}
- Travel Style: ${params.travelStyle}
- Visa Required: ${params.visaRequired ? "Yes" : "No"}

Travel Style Context:
- If "budget": Focus on free attractions, street food, public transit, hostel dorms, off-peak timing.
- If "moderate": Emphasize value-for-money, 3-4 star hotels, mix of street food + sit-down, occasional splurges.
- If "luxury": Recommend Michelin-starred meals, business class upgrades worth the cost, private transfers, concierge-bookable experiences.
Tailor the TONE, style recommendations, and specificity of every field to match this ${params.travelStyle} persona.

Local Insider Tips Rules:
- Each recommendation or tip must reference a SPECIFIC airline, visa portal URL, named app, named market, or named transit card. Generic advice like "book early" is PROHIBITED.
- Every single tip must contain a concrete number (price, days, percentage, distance).

Respond with exactly this JSON structure:
{
  "summary": "2-3 sentence analysis",
  "predictedCost": <total INR number>,
  "overspendRisk": <0-100 integer>,
  "costBreakdown": {
    "flights": <INR>,
    "accommodation": <INR>,
    "food": <INR>,
    "transportation": <INR>,
    "activities": <INR>,
    "hiddenFees": <INR>
  },
  "recommendations": ["specific tip 1", "specific tip 2", "specific tip 3"],
  "bestBookingTime": "e.g. 6-8 weeks before departure",
  "budgetTips": ["specific tip 1", "specific tip 2", "specific tip 3"],
  "forexAdvice": "one sentence forex tip for this destination",
  "hotels": [
    {
      "name": "Hotel Name",
      "pricePerNight": <INR price per night>,
      "rating": "e.g. 4.3/5",
      "description": "Short description of the property",
      "suitability": "Why this matches a ${params.travelStyle} budget",
      "distanceToCenter": "e.g. 1.2 km",
      "amenities": ["Free Wi-Fi", "Pool", "Gym"],
      "type": "e.g. Boutique Hotel, Resort, Hostel",
      "benefits": ["Free Breakfast", "Airport Shuttle", "Infinity Pool"],
      "bookingPlatform": "Best platform: Booking.com, MakeMyTrip, Agoda, etc.",
      "priceCategory": "Budget / Mid-Range / Luxury / Ultra-Luxury",
      "sustainability": "e.g. LEED certified, solar-powered",
      "checkInTime": "e.g. 3:00 PM",
      "cancellationPolicy": "e.g. Free cancellation up to 48 hours",
      "neighborhoodVibe": "e.g. Quiet residential, Nightlife hub, Cultural district",
      "loyaltyProgram": "e.g. Marriott Bonvoy, IHG One Rewards, or None"
    }
  ],
  "itinerary": [
    {
      "day": <number>,
      "title": "Day theme or main place",
      "hotel": "Hotel Name (highly detailed stay context, e.g., 'Located 5 mins walk from [Station Name/Center]' and booking advice, e.g., 'Book via Booking.com for free cancellation')",
      "transport": [
        "Transit leg 1 (e.g. 'Take Metro Line X from Station Y to Z - ₹50, 15 mins')",
        "Transit leg 2 (e.g. 'Take Taxi/Grab from Z to destination - ₹150, 10 mins')"
      ],
      "activities": ["activity 1", "activity 2"],
      "estimatedCost": <INR cost for day>,
      "placesToVisit": ["place 1", "place 2"],
      "mealSuggestions": [
        { "meal": "Breakfast", "place": "e.g. Ichiran Ramen Shinjuku", "cost": 450, "tip": "Order via ticket vending machine; no Japanese needed" },
        { "meal": "Lunch", "place": "Lunch place name", "cost": 600, "tip": "Insider dining tip" },
        { "meal": "Dinner", "place": "Dinner place name", "cost": 1200, "tip": "Insider dining tip" }
      ],
      "localHacks": ["e.g. Temple entry before 8am is free", "e.g. Last entry to museum is 30 mins before close — no queue"],
      "weatherNote": "e.g. Pack a compact umbrella — afternoon showers common in summer"
    }
  ],
  "riskIntel": {
    "weatherRisk": "e.g. Typhoon season runs Aug–Oct; travel in May–June for optimal conditions",
    "politicalStability": "e.g. Stable — last State Dept advisory: Level 1",
    "healthAdvisory": "e.g. No vaccines required; carry standard OTC diarrhea medication",
    "peakCrowdAlert": "e.g. Avoid Shibuya weekends 6–9pm — crowd density at peak",
    "currencyVolatility": "e.g. JPY is 12% weaker vs INR vs last year — favorable for Indian travelers"
  },
  "flightStrategy": {
    "cheapestDays": "e.g. Tuesday & Wednesday departures average 18% cheaper",
    "bestAirlines": ["IndiGo", "Air India", "Japan Airlines"],
    "layoverTip": "e.g. Kuala Lumpur layover adds 4hrs but saves ~₹12,000 vs direct",
    "seatRecommendation": "e.g. Book seats 31A/31B on IndiGo A320 for extra legroom at no cost",
    "baggageWarning": "e.g. IndiGo charges ₹2,200 for 15kg checked bag — pre-book at ₹1,400 online"
  },
  "pricingIntel": {
    "vsLastYear": "e.g. Tokyo accommodation costs are 22% higher YoY due to weak Yen tourism boom",
    "bookingWindow": "e.g. Prices spike 340% if booked within 7 days of travel",
    "alternativeDestination": "e.g. Osaka offers 90% of Tokyo's experience at 35% lower cost",
    "peakAvoidance": "e.g. Traveling Mon–Thu instead of Fri–Sun saves avg ₹4,200 on accommodation"
  }
}

Use real-world knowledge of costs in ${params.destination} for ${params.travelStyle} style travel in Indian Rupees (INR). Hidden fees should cover visa (only if Visa Required is Yes), airport taxes, city taxes, and travel insurance.`;

    const response = await getAnthropicClient().messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const clean = text.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(clean) as AIAnalysis;
  } catch (error) {
    console.error("Anthropic API call failed, using fallback:", error);
    return generateFallbackAnalysis(params.origin, params.destination, params.budget, duration, params.travelStyle, params.travelers, params.visaRequired);
  }
}

export async function getAIBudgetAdvice(params: {
  destination: string;
  currentSpend: number;
  budget: number;
  daysLeft: number;
  topCategories: Array<{ category: string; amount: number }>;
}): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === "your-key-here" || apiKey === "" || apiKey.includes("...")) {
    return "API key not configured. Tip: Try keeping your daily food & beverage costs in check by dining at local cafes.";
  }

  try {
    const response = await getAnthropicClient().messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: `You are a travel budget advisor. Give 2-3 short, actionable tips. 
Trip to ${params.destination}. Spent ₹${params.currentSpend} of ₹${params.budget} INR budget. 
${params.daysLeft} days remaining. Top spending: ${params.topCategories.map((c) => `${c.category} ₹${c.amount}`).join(", ")}.
Be concise, friendly, and specific to this destination.`,
        },
      ],
    });
    return response.content[0].type === "text" ? response.content[0].text : "";
  } catch {
    return "Tip: Try walking or using public transport for your local travel to save money.";
  }
}

function generateFallbackAnalysis(
  origin: string,
  destination: string,
  budget: number,
  duration: number,
  style: TravelStyle,
  travelers: number = 1,
  visaRequired: boolean = true
): AIAnalysis {
  const destLower = destination.toLowerCase();

  // Set up hyperrealistic destination category variables (in INR)
  let flightCostPerPerson = 40000;
  let accommodationCostPerNight = 10000;
  let foodCostPerDay = 3000;
  let transportationCostPerDay = 1200;
  let activitiesCostPerDay = 1500;
  let hiddenFeesPerPerson = 6000;

  if (destLower.includes("tokyo") || destLower.includes("japan")) {
    flightCostPerPerson = style === "budget" ? 35000 : style === "luxury" ? 120000 : 50000;
    accommodationCostPerNight = style === "budget" ? 2500 : style === "luxury" ? 55000 : 12000;
    foodCostPerDay = style === "budget" ? 1500 : style === "luxury" ? 8000 : 3500;
    transportationCostPerDay = style === "budget" ? 800 : style === "luxury" ? 5000 : 1800;
    activitiesCostPerDay = style === "budget" ? 800 : style === "luxury" ? 6000 : 2000;
    hiddenFeesPerPerson = visaRequired
      ? (style === "budget" ? 2500 : style === "luxury" ? 8000 : 4000)
      : (style === "budget" ? 1500 : style === "luxury" ? 5000 : 2500);
  } else if (
    destLower.includes("paris") ||
    destLower.includes("france") ||
    destLower.includes("europe") ||
    destLower.includes("italy") ||
    destLower.includes("london") ||
    destLower.includes("united kingdom") ||
    destLower.includes("uk")
  ) {
    flightCostPerPerson = style === "budget" ? 45000 : style === "luxury" ? 150000 : 65000;
    accommodationCostPerNight = style === "budget" ? 3500 : style === "luxury" ? 65000 : 15000;
    foodCostPerDay = style === "budget" ? 2000 : style === "luxury" ? 10000 : 4500;
    transportationCostPerDay = style === "budget" ? 800 : style === "luxury" ? 4500 : 1800;
    activitiesCostPerDay = style === "budget" ? 1000 : style === "luxury" ? 8000 : 2500;
    hiddenFeesPerPerson = visaRequired
      ? (style === "budget" ? 12000 : style === "luxury" ? 20000 : 14000) // Schengen/UK Visa fee (~8-10k) + premium insurance
      : (style === "budget" ? 3000 : style === "luxury" ? 7000 : 4500); // Insurance + local tax only
  } else if (
    destLower.includes("thailand") ||
    destLower.includes("bangkok") ||
    destLower.includes("phuket") ||
    destLower.includes("bali") ||
    destLower.includes("indonesia") ||
    destLower.includes("vietnam") ||
    destLower.includes("singapore") ||
    destLower.includes("malaysia") ||
    destLower.includes("dubai") ||
    destLower.includes("uae")
  ) {
    flightCostPerPerson = style === "budget" ? 22000 : style === "luxury" ? 65000 : 35000;
    accommodationCostPerNight = style === "budget" ? 2500 : style === "luxury" ? 30000 : 7000;
    foodCostPerDay = style === "budget" ? 1500 : style === "luxury" ? 6000 : 2500;
    transportationCostPerDay = style === "budget" ? 600 : style === "luxury" ? 4000 : 1500;
    activitiesCostPerDay = style === "budget" ? 1000 : style === "luxury" ? 7000 : 2500;
    hiddenFeesPerPerson = visaRequired
      ? (style === "budget" ? 4500 : style === "luxury" ? 10000 : 6000)
      : (style === "budget" ? 2000 : style === "luxury" ? 6000 : 3000);
  } else if (
    destLower.includes("goa") ||
    destLower.includes("kerala") ||
    destLower.includes("mumbai") ||
    destLower.includes("delhi") ||
    destLower.includes("india") ||
    destLower.includes("rajasthan") ||
    destLower.includes("srinagar") ||
    destLower.includes("kashmir") ||
    destLower.includes("ladakh")
  ) {
    flightCostPerPerson = style === "budget" ? 4000 : style === "luxury" ? 18000 : 8000;
    accommodationCostPerNight = style === "budget" ? 1200 : style === "luxury" ? 18000 : 4000;
    foodCostPerDay = style === "budget" ? 600 : style === "luxury" ? 4000 : 1500;
    transportationCostPerDay = style === "budget" ? 300 : style === "luxury" ? 2500 : 800;
    activitiesCostPerDay = style === "budget" ? 300 : style === "luxury" ? 3000 : 800;
    hiddenFeesPerPerson = style === "budget" ? 500 : style === "luxury" ? 2500 : 1000; // No visa ever, only local tax/insurance
  } else {
    // Default international
    flightCostPerPerson = style === "budget" ? 35000 : style === "luxury" ? 120000 : 55000;
    accommodationCostPerNight = style === "budget" ? 2500 : style === "luxury" ? 40000 : 10000;
    foodCostPerDay = style === "budget" ? 1200 : style === "luxury" ? 7000 : 3000;
    transportationCostPerDay = style === "budget" ? 600 : style === "luxury" ? 3500 : 1200;
    activitiesCostPerDay = style === "budget" ? 600 : style === "luxury" ? 5000 : 1500;
    hiddenFeesPerPerson = visaRequired
      ? (style === "budget" ? 4000 : style === "luxury" ? 10000 : 6000)
      : (style === "budget" ? 1500 : style === "luxury" ? 5000 : 3000);
  }

  const flights = flightCostPerPerson * travelers;
  const roomsCount = Math.ceil(travelers / 2);
  const nights = Math.max(1, duration - 1);
  const accommodation = accommodationCostPerNight * nights * roomsCount;

  const food = foodCostPerDay * duration * travelers;
  const transportation = transportationCostPerDay * duration * travelers;
  const activities = activitiesCostPerDay * duration * travelers;
  const hiddenFees = hiddenFeesPerPerson * travelers;

  const predictedCost = flights + accommodation + food + transportation + activities + hiddenFees;

  const overspendRisk = Math.min(
    100,
    Math.max(0, Math.round(((predictedCost - budget) / budget) * 100 + 40))
  );

  let fallbackHotels: any[] = [];
  let fallbackItinerary: any[] = [];

  if (destLower.includes("tokyo") || destLower.includes("japan")) {
    fallbackHotels = [
      {
        name: style === "budget" ? "Nine Hours Capsule Hotel Shinjuku" : style === "luxury" ? "Park Hyatt Tokyo" : "Hotel Gracery Shinjuku",
        pricePerNight: accommodationCostPerNight,
        rating: style === "budget" ? "4.1/5" : style === "luxury" ? "4.8/5" : "4.4/5",
        description: style === "budget" ? "Modern capsule hotel near Shinjuku Station." : style === "luxury" ? "Iconic 5-star luxury hotel with panoramic city views." : "Excellent 4-star hotel famous for its giant Godzilla head.",
        suitability: style === "budget" ? "Ultra-low cost option perfect for solo budget travelers." : style === "luxury" ? "Ultra-luxury stay for high budgets." : "Great mid-range option with excellent transit connectivity.",
        distanceToCenter: "0.5 km",
        amenities: ["Free Wi-Fi", style === "luxury" ? "Pool & Spa" : "Lounge", "24/7 Front Desk"],
        type: style === "budget" ? "Capsule Hotel" : style === "luxury" ? "Luxury Resort" : "Modern Hotel",
        benefits: ["Free Breakfast", "Prime Location"],
        bookingPlatform: "Booking.com"
      },
      {
        name: style === "budget" ? "Oak Hostel Zen" : style === "luxury" ? "Aman Tokyo" : "Shibuya Stream Excel Hotel Tokyu",
        pricePerNight: Math.round(accommodationCostPerNight * 0.85),
        rating: style === "budget" ? "4.2/5" : style === "luxury" ? "4.9/5" : "4.5/5",
        description: style === "budget" ? "Clean, cozy hostel located in a quiet historic neighborhood." : style === "luxury" ? "Top-tier luxury sanctuary in the financial district." : "Stylish contemporary hotel directly connected to Shibuya Station.",
        suitability: style === "budget" ? "Extremely pocket-friendly option." : style === "luxury" ? "Perfect for a high-end luxury experience." : "Prime location matching a moderate budget.",
        distanceToCenter: "1.2 km",
        amenities: ["Free Wi-Fi", "Laundry", style === "luxury" ? "Fine Dining" : "Cafe"],
        type: style === "budget" ? "Hostel" : style === "luxury" ? "Boutique Luxury" : "Boutique Hotel",
        benefits: ["Free Breakfast", "Prime Location"],
        bookingPlatform: "Booking.com"
      },
      {
        name: style === "budget" ? "Khaosan Tokyo Origami" : style === "luxury" ? "Mandarin Oriental Tokyo" : "Mitsui Garden Hotel Kyobashi",
        pricePerNight: Math.round(accommodationCostPerNight * 0.95),
        rating: style === "budget" ? "4.3/5" : style === "luxury" ? "4.9/5" : "4.3/5",
        description: style === "budget" ? "Vibrant hostel in Asakusa with great views of Senso-ji." : style === "luxury" ? "Award-winning dining and spa in Nihonbashi." : "Comfortable business hotel close to Tokyo Station.",
        suitability: "Great value and location.",
        distanceToCenter: "2.0 km",
        amenities: ["Free Wi-Fi", "City Views", "AC"],
        type: style === "budget" ? "Hostel" : style === "luxury" ? "Luxury Hotel" : "Business Hotel",
        benefits: ["Free Breakfast", "Prime Location"],
        bookingPlatform: "Booking.com"
      },
      {
        name: style === "budget" ? "Space Hostel Tokyo" : style === "luxury" ? "The Ritz-Carlton Tokyo" : "Daiwa Roynet Hotel Ginza",
        pricePerNight: Math.round(accommodationCostPerNight * 1.1),
        rating: style === "budget" ? "4.0/5" : style === "luxury" ? "4.8/5" : "4.4/5",
        description: style === "budget" ? "Minimalist wood-themed hostel." : style === "luxury" ? "Occupies the top 9 floors of Tokyo Midtown Tower." : "Sleek and highly rated hotel in the shopping district.",
        suitability: "Ideal for shoppers and sightseers.",
        distanceToCenter: "1.5 km",
        amenities: ["Free Wi-Fi", "Restaurant", "Gym"],
        type: style === "budget" ? "Hostel" : style === "luxury" ? "5-Star Hotel" : "Modern Hotel",
        benefits: ["Free Breakfast", "Prime Location"],
        bookingPlatform: "Booking.com"
      },
      {
        name: style === "budget" ? "Sakura Hotel Nippori" : style === "luxury" ? "Hoshinoya Tokyo" : "Remm Roppongi",
        pricePerNight: Math.round(accommodationCostPerNight * 0.75),
        rating: style === "budget" ? "4.1/5" : style === "luxury" ? "4.8/5" : "4.2/5",
        description: style === "budget" ? "Retro vibe with an international cafe." : style === "luxury" ? "Traditional ryokan experience in a high-rise." : "Compact rooms with massage chairs in every room.",
        suitability: "Unique cultural experience.",
        distanceToCenter: "3.5 km",
        amenities: ["Free Wi-Fi", "Breakfast Included", "Bar"],
        type: style === "budget" ? "Guesthouse" : style === "luxury" ? "Ryokan" : "Boutique Hotel",
        benefits: ["Free Breakfast", "Prime Location"],
        bookingPlatform: "Booking.com"
      },
      {
        name: style === "budget" ? "Nui. Hostel & Bar Lounge" : style === "luxury" ? "Palace Hotel Tokyo" : "Candeo Hotels Shimbashi",
        pricePerNight: Math.round(accommodationCostPerNight * 0.9),
        rating: style === "budget" ? "4.5/5" : style === "luxury" ? "4.7/5" : "4.3/5",
        description: style === "budget" ? "Hip industrial-chic hostel by the river." : style === "luxury" ? "Serene luxury next to the Imperial Palace." : "Features a rooftop public bath (onsen).",
        suitability: "Highly rated by past guests.",
        distanceToCenter: "2.5 km",
        amenities: ["Free Wi-Fi", "Onsite Bar", "Onsen/Bath"],
        type: style === "budget" ? "Hostel" : style === "luxury" ? "Luxury Resort" : "Hotel",
        benefits: ["Free Breakfast", "Prime Location"],
        bookingPlatform: "Booking.com"
      }
    ];

    fallbackItinerary = Array.from({ length: duration }, (_, i) => {
      const selectedHotel = fallbackHotels[0];
      const hotelInfo = selectedHotel 
        ? `${selectedHotel.name} (Located ${selectedHotel.distanceToCenter} from center. ${selectedHotel.suitability} Book via ${selectedHotel.bookingPlatform || 'Booking.com'})`
        : "Standard Boutique Hotel (Located close to central transit station). Book via Booking.com.";

      const themes = [
        { 
          title: "Explore Modern Shinjuku & Shibuya", 
          activities: ["Visit Shibuya Crossing — The busiest intersection in the world where 3,000 people cross at once; best viewed from the Mag's Park rooftop.", "Meiji Shrine walk — A serene Shinto shrine dedicated to Emperor Meiji, located in a massive 170-acre forest right in the middle of Tokyo.", "Shinjuku Gyoen National Garden — A stunning blend of French Formal, English Landscape, and Japanese traditional gardens.", "Metropolitan Govt Building observation deck — Free panoramic views of Tokyo from 202 meters high, perfect for sunset."], 
          cost: (foodCostPerDay + transportationCostPerDay + activitiesCostPerDay) * 0.8, 
          places: ["Shibuya", "Shinjuku"],
          transport: [
            "Walk 5 mins from your hotel to Shinjuku Station",
            "Take JR Yamanote Line from Shinjuku Station to Shibuya Station (₹150, 7 mins)",
            "Walk 10 mins from Shibuya Station to Shibuya Crossing and Meiji Shrine"
          ]
        },
        { 
          title: "Historic Asakusa & Akihabara Tech", 
          activities: ["Senso-ji Temple visit — Tokyo's oldest Buddhist temple founded in 628 AD, famous for its massive red Kaminarimon gate.", "Nakamise shopping street — One of Japan's oldest shopping streets offering traditional snacks and souvenirs since the Edo period.", "Akihabara electric town exploring — The epicenter of global anime, manga, and gaming culture with towering multi-story arcades.", "Maid Cafe or Arcade experience — A unique slice of modern Japanese pop culture where waitresses treat customers like masters/mistresses."], 
          cost: (foodCostPerDay + transportationCostPerDay + activitiesCostPerDay) * 0.9, 
          places: ["Asakusa", "Akihabara"],
          transport: [
            "Take JR Chuo-Sobu Line from Shinjuku Station to Akihabara Station (₹180, 15 mins)",
            "Take Tsukuba Express Line from Akihabara to Asakusa Station (₹210, 5 mins)"
          ]
        },
        { 
          title: "Luxury Ginza & TeamLab Digital Art", 
          activities: ["TeamLab Planets digital exhibition — A mesmerizing immersive art experience where you walk barefoot through water and mirrored light rooms.", "Walk through upscale Ginza district — Tokyo's premier high-end shopping district featuring incredible modern architecture and heritage boutiques.", "Sushi lunch at a local master's counter — Experience authentic Edomae sushi prepared right in front of you.", "Tsukiji Outer Market street food — A bustling historic market packed with stalls selling fresh seafood, tamagoyaki, and Japanese sweets."], 
          cost: (foodCostPerDay + transportationCostPerDay + activitiesCostPerDay) * 1.2, 
          places: ["Toyosu", "Ginza"],
          transport: [
            "Take Tokyo Metro Marunouchi Line from Shinjuku Station to Ginza Station (₹200, 16 mins)",
            "Take Yurakucho Line from Ginza to Toyosu Station for TeamLab Planets (₹170, 10 mins)"
          ]
        },
        { 
          title: "Day Trip to Mount Fuji / Hakone", 
          activities: ["Hakone Ropeway ride — A spectacular aerial cable car offering jaw-dropping views of Mount Fuji and active sulfur vents.", "Lake Ashi sightseeing cruise — Sail across a volcanic crater lake on a replica pirate ship with Fuji in the backdrop.", "Relax in local hot springs (Onsen) — Rejuvenate in mineral-rich geothermal waters, a centuries-old Japanese tradition."], 
          cost: (foodCostPerDay + transportationCostPerDay + activitiesCostPerDay) * 1.5, 
          places: ["Hakone", "Mount Fuji"],
          transport: [
            "Take Odakyu Romancecar from Shinjuku Station to Hakone-Yumoto Station (₹1,500, 85 mins)",
            "Use the Hakone Tozan Bus & Ropeway to explore Lake Ashi and Owakudani (Included in Hakone Free Pass)"
          ]
        },
        { 
          title: "Cultural Ueno & Yanaka Old Town", 
          activities: ["Stroll Ueno Park — A massive public space famous for its zoo, cherry blossoms, and concentration of major museums.", "Tokyo National Museum visit — The oldest and largest museum in Japan housing the definitive collection of national treasures.", "Yanaka Ginza historic shopping walk — Experience the rare, untouched 'shitamachi' (old town) vibe that survived WWII bombings."], 
          cost: (foodCostPerDay + transportationCostPerDay + activitiesCostPerDay) * 0.7, 
          places: ["Ueno", "Yanaka"],
          transport: [
            "Take JR Yamanote Line from Shinjuku Station to Ueno Station (₹200, 20 mins)",
            "Walk 15 mins to Yanaka Ginza district from Ueno Park"
          ]
        },
        { 
          title: "Trendy Harajuku & Omotesando Cafe Stroll", 
          activities: ["Walk Takeshita Street — The colorful, chaotic birthplace of kawaii (cute) culture, packed with crepes and fashion.", "Yoyogi Park relax — Tokyo's equivalent to Central Park, famous for rockabilly dancers and weekend gatherings.", "Omotesando high-end cafe hopping — Known as Tokyo's Champs-Élysées, lined with stunning flagship stores and aesthetic cafes."], 
          cost: (foodCostPerDay + transportationCostPerDay + activitiesCostPerDay) * 0.85, 
          places: ["Harajuku", "Omotesando"],
          transport: [
            "Take JR Yamanote Line from Shinjuku Station to Harajuku Station (₹150, 4 mins)",
            "Walk across Yoyogi Park to Omotesando boulevard"
          ]
        },
        { 
          title: "Futuristic Odaiba Island & Rainbow Bridge", 
          activities: ["See Life-Sized Unicorn Gundam — A massive 19.7-meter tall robot statue that actually transforms and lights up.", "Relax at Odaiba Seaside Park — An artificial beach offering the best skyline views of Tokyo across the bay.", "Sunset Tokyo Bay cruise — See the iconic Rainbow Bridge and Tokyo skyline illuminate as night falls."], 
          cost: (foodCostPerDay + transportationCostPerDay + activitiesCostPerDay) * 1.1, 
          places: ["Odaiba", "Tokyo Bay"],
          transport: [
            "Take Saikyo Line from Shinjuku Station to Tokyo Teleport Station (₹510, 22 mins)",
            "Walk 10 mins to Gundam Front and Odaiba Seaside Park"
          ]
        },
        { 
          title: "Historical Kamakura Day Trip", 
          activities: ["Visit Great Buddha at Kotoku-in — A monumental outdoor bronze statue of Amida Buddha that survived a 15th-century tsunami.", "Walk Hasedera Temple gardens — Famous for its multi-level garden, hundreds of Jizo statues, and sweeping coastal views.", "Relax at Yuigahama Beach — A popular laid-back surfing beach offering a coastal break from the city."], 
          cost: (foodCostPerDay + transportationCostPerDay + activitiesCostPerDay) * 1.3, 
          places: ["Kamakura"],
          transport: [
            "Take JR Shonan-Shinjuku Line from Shinjuku Station to Kamakura Station (₹940, 58 mins)",
            "Take Enoden Local Train from Kamakura to Hase Station for the Great Buddha (₹200, 5 mins)"
          ]
        },
        { 
          title: "Traditional Gardens & Roppongi Night View", 
          activities: ["Walk Hamarikyu Gardens — A stunning Edo-period tidal garden juxtaposed against towering modern skyscrapers.", "Tokyo Tower photo stop — The iconic red-and-white broadcasting tower inspired by the Eiffel Tower.", "Roppongi Hills observatory city view — Tokyo City View offers the absolute best open-air 360-degree panorama of the metropolis."], 
          cost: (foodCostPerDay + transportationCostPerDay + activitiesCostPerDay) * 1.25, 
          places: ["Roppongi", "Hamarikyu"],
          transport: [
            "Take Toei Oedo Line from Shinjuku Station to Shiodome Station for Hamarikyu (₹220, 18 mins)",
            "Take Toei Oedo Line from Shiodome to Roppongi Station for Roppongi Hills (₹180, 9 mins)"
          ]
        },
        { 
          title: "Kichijoji & Ghibli Vibe Exploration", 
          activities: ["Walk around Inokashira Park — A lush, sprawling park centered around a swan boat lake, stunning in all seasons.", "Ghibli Museum exterior tour — An eccentric, whimsical building designed by Hayao Miyazaki celebrating Studio Ghibli animation.", "Harmonica Yokocho food alley dining — A maze of tiny, atmospheric post-war alleyways packed with standing bars and eateries."], 
          cost: (foodCostPerDay + transportationCostPerDay + activitiesCostPerDay) * 0.95, 
          places: ["Kichijoji", "Mitaka"],
          transport: [
            "Take JR Chuo Line Rapid from Shinjuku Station to Kichijoji Station (₹230, 15 mins)",
            "Walk 15 mins through Inokashira Park to the Ghibli Museum"
          ]
        }
      ];
      const theme = themes[i % themes.length];
      return {
        day: i + 1,
        title: theme.title,
        activities: theme.activities,
        estimatedCost: Math.round(theme.cost),
        placesToVisit: theme.places,
        hotel: hotelInfo,
        transport: theme.transport,
        mealSuggestions: [
          { meal: "Breakfast", place: style === "luxury" ? "The Ritz-Carlton Club Lounge" : style === "budget" ? "7-Eleven Convenience Store" : "Sarutahiko Coffee Shinjuku", cost: style === "luxury" ? 3500 : style === "budget" ? 250 : 600, tip: style === "budget" ? "Try the egg salad sandwich — a cult favorite" : "Grab a pour-over coffee and fresh pastry" },
          { meal: "Lunch", place: style === "luxury" ? "Sushi Shin (Michelin-starred)" : style === "budget" ? "Ichiran Ramen Shibuya" : "Gyukatsu Motomura", cost: style === "luxury" ? 15000 : style === "budget" ? 850 : 1800, tip: "Order via ticket vending machine; custom spice sheets available" },
          { meal: "Dinner", place: style === "luxury" ? "New York Grill at Park Hyatt" : style === "budget" ? "Omoide Yokocho Izakayas" : "Torikizoku Yakitori", cost: style === "luxury" ? 22000 : style === "budget" ? 1200 : 3000, tip: style === "budget" ? "Cash only; seating is tight, expect a ₹300 table cover fee" : "All items on menu are flat-rate; order via tablet" }
        ],
        localHacks: [
          "Purchase a PASMO Passport or Suica card for seamless tap-and-go transit.",
          "Visit Shibuya Sky observation deck at sunset; tickets sell out 4 weeks in advance online."
        ],
        weatherNote: "Tokyo features sudden afternoon showers; pack a compact folding umbrella."
      };
    });
  } else if (destLower.includes("paris") || destLower.includes("france")) {
    fallbackHotels = [
      {
        name: style === "budget" ? "Generator Paris Hostel" : style === "luxury" ? "The Ritz Paris" : "Hotel Le Walt",
        pricePerNight: accommodationCostPerNight,
        rating: style === "budget" ? "4.0/5" : style === "luxury" ? "4.9/5" : "4.4/5",
        description: style === "budget" ? "Hip hostel with a rooftop terrace overlooking Sacré-Cœur." : style === "luxury" ? "Legendary palace hotel in Place Vendôme." : "Charming boutique hotel with Eiffel Tower views from some rooms.",
        suitability: style === "budget" ? "Affordable social hub for budget travelers." : style === "luxury" ? "Premium historic luxury." : "Romantic mid-range stay near the Champ de Mars.",
        distanceToCenter: "1.0 km",
        amenities: ["Free Wi-Fi", style === "luxury" ? "Spa & Pool" : "Rooftop Bar", "24/7 Front Desk"],
        type: style === "budget" ? "Hostel" : style === "luxury" ? "Palace Hotel" : "Boutique Hotel",
        benefits: ["Free Breakfast", "Prime Location"],
        bookingPlatform: "Booking.com"
      },
      {
        name: style === "budget" ? "Les Piaules Nation" : style === "luxury" ? "Hotel Plaza Athénée" : "Hotel Caron de Beaumarchais",
        pricePerNight: Math.round(accommodationCostPerNight * 0.9),
        rating: style === "budget" ? "4.2/5" : style === "luxury" ? "4.8/5" : "4.3/5",
        description: style === "budget" ? "Boutique hostel with custom wooden bunk beds." : style === "luxury" ? "Five-star hotel famous for its red awnings and gourmet dining." : "Charming 18th-century decor hotel in the heart of Le Marais.",
        suitability: style === "budget" ? "Excellent price/quality ratio." : style === "luxury" ? "Ultimate Parisian luxury stay." : "Historic atmosphere suited for moderate budgets.",
        distanceToCenter: "1.5 km",
        amenities: ["Free Wi-Fi", "Breakfast", "Lounge"],
        type: style === "budget" ? "Hostel" : style === "luxury" ? "5-Star Hotel" : "Historic Hotel",
        benefits: ["Free Breakfast", "Prime Location"],
        bookingPlatform: "Booking.com"
      },
      {
        name: style === "budget" ? "St. Christopher's Gare du Nord" : style === "luxury" ? "Le Meurice" : "CitizenM Gare de Lyon",
        pricePerNight: Math.round(accommodationCostPerNight * 0.8),
        rating: style === "budget" ? "3.9/5" : style === "luxury" ? "4.7/5" : "4.5/5",
        description: style === "budget" ? "Lively hostel near major transport hubs." : style === "luxury" ? "Opulent decor directly facing the Tuileries Garden." : "Ultra-modern pod-like rooms with iPad controls.",
        suitability: "Convenient transit access.",
        distanceToCenter: "2.5 km",
        amenities: ["Free Wi-Fi", "Bar", "Air Conditioning"],
        type: style === "budget" ? "Hostel" : style === "luxury" ? "Luxury Hotel" : "Modern Hotel",
        benefits: ["Free Breakfast", "Prime Location"],
        bookingPlatform: "Booking.com"
      },
      {
        name: style === "budget" ? "Le Regent Montmartre" : style === "luxury" ? "Four Seasons Hotel George V" : "Pullman Paris Tour Eiffel",
        pricePerNight: Math.round(accommodationCostPerNight * 1.1),
        rating: style === "budget" ? "4.1/5" : style === "luxury" ? "4.9/5" : "4.4/5",
        description: style === "budget" ? "Cozy spot right at the base of Montmartre." : style === "luxury" ? "Art Deco landmark with Michelin-starred dining." : "Balconies offering up-close views of the Eiffel Tower.",
        suitability: "Unbeatable views and dining.",
        distanceToCenter: "3.0 km",
        amenities: ["Free Wi-Fi", "Room Service", "Gym"],
        type: style === "budget" ? "Hostel" : style === "luxury" ? "Luxury Resort" : "Upscale Hotel",
        benefits: ["Free Breakfast", "Prime Location"],
        bookingPlatform: "Booking.com"
      },
      {
        name: style === "budget" ? "JO&JOE Paris Nation" : style === "luxury" ? "Shangri-La Paris" : "Hotel Monge",
        pricePerNight: Math.round(accommodationCostPerNight * 0.85),
        rating: style === "budget" ? "4.3/5" : style === "luxury" ? "4.8/5" : "4.6/5",
        description: style === "budget" ? "A blend of hostel and hotel with a great courtyard." : style === "luxury" ? "Former royal residence with phenomenal Eiffel Tower views." : "Elegant boutique stay in the Latin Quarter.",
        suitability: "Great for culturally curious travelers.",
        distanceToCenter: "2.0 km",
        amenities: ["Free Wi-Fi", "Terrace", "Restaurant"],
        type: style === "budget" ? "Hybrid Hostel" : style === "luxury" ? "Palace Hotel" : "Boutique Hotel",
        benefits: ["Free Breakfast", "Prime Location"],
        bookingPlatform: "Booking.com"
      },
      {
        name: style === "budget" ? "FIAP Jean Monnet" : style === "luxury" ? "Mandarin Oriental Paris" : "Hotel Lutetia",
        pricePerNight: Math.round(accommodationCostPerNight * 0.95),
        rating: style === "budget" ? "4.0/5" : style === "luxury" ? "4.7/5" : "4.5/5",
        description: style === "budget" ? "International youth center in the quiet 14th arr." : style === "luxury" ? "Chic and contemporary luxury on Rue Saint-Honoré." : "The only grand luxury hotel on the Left Bank.",
        suitability: "Quiet, sophisticated neighborhood.",
        distanceToCenter: "1.8 km",
        amenities: ["Free Wi-Fi", "Spa", "Garden Court"],
        type: style === "budget" ? "Hostel" : style === "luxury" ? "Luxury Hotel" : "Grand Hotel",
        benefits: ["Free Breakfast", "Prime Location"],
        bookingPlatform: "Booking.com"
      }
    ];

    fallbackItinerary = Array.from({ length: duration }, (_, i) => {
      const selectedHotel = fallbackHotels[0];
      const hotelInfo = selectedHotel 
        ? `${selectedHotel.name} (Located ${selectedHotel.distanceToCenter} from center. ${selectedHotel.suitability} Book via ${selectedHotel.bookingPlatform || 'Booking.com'})`
        : "Standard Parisian Boutique Hotel. Book via Booking.com.";

      const themes = [
        { 
          title: "Iconic Landmarks & Eiffel Tower", 
          activities: ["Walk Champ de Mars — The sweeping, manicured park offering the most classic, unobstructed views of the Eiffel Tower.", "Eiffel Tower climb — Experience the engineering marvel of Gustave Eiffel and get a stunning aerial view of Paris.", "Seine River cruise — The absolute best way to see the city's illuminated bridges and architecture at sunset.", "Arc de Triomphe visit — Climb to the top of Napoleon's triumphal arch for a perfectly centered view down the Champs-Élysées."], 
          cost: (foodCostPerDay + transportationCostPerDay + activitiesCostPerDay) * 1.0, 
          places: ["Eiffel Tower", "Champs-Élysées"],
          transport: [
            "Walk 5 mins from hotel to nearest Metro Station",
            "Take Metro Line 6 to Bir-Hakeim or RER C to Champ de Mars Tour Eiffel (₹190, 12 mins)",
            "Take Batobus Water Taxi along the Seine River to major tourist stops (₹1,500 day pass)"
          ]
        },
        { 
          title: "World-Class Art & Musee du Louvre", 
          activities: ["Louvre Museum guided tour — The world's largest art museum, home to the Mona Lisa, Venus de Milo, and 35,000 other masterpieces.", "Tuileries Garden stroll — A magnificent 17th-century public garden perfect for relaxing by the fountains.", "Place de la Concorde — The largest square in Paris, rich with French Revolution history and a 3,300-year-old Egyptian obelisk.", "Dinner in Saint-Germain-des-Prés — A historic intellectual hub known for its classic Parisian brasseries and vibrant night energy."], 
          cost: (foodCostPerDay + transportationCostPerDay + activitiesCostPerDay) * 0.9, 
          places: ["Louvre", "Saint-Germain"],
          transport: [
            "Take Metro Line 1 or Line 7 directly to Palais Royal - Musée du Louvre Station (₹190, 8 mins)",
            "Cross the Pont des Arts footbridge on foot to reach Saint-Germain-des-Prés"
          ]
        },
        { 
          title: "Bohemian Montmartre & Sacré-Cœur", 
          activities: ["Visit Sacré-Cœur Basilica — A gleaming white masterpiece set on the highest hill in Paris, offering breathtaking city vistas.", "Place du Tertre artists square walk — The historic epicenter of bohemian art where Picasso and Utrillo once painted.", "Coffee at Café des Deux Moulins — The iconic, nostalgic cafe made famous by the film 'Amélie'.", "Marais shopping — A trendy district blending incredible medieval architecture with chic fashion boutiques."], 
          cost: (foodCostPerDay + transportationCostPerDay + activitiesCostPerDay) * 0.7, 
          places: ["Montmartre", "Le Marais"],
          transport: [
            "Take Metro Line 12 from Abbesses or Line 2 to Anvers Station (₹190, 15 mins)",
            "Ride the Montmartre Funicular up the hill using a standard Metro ticket (₹190, 2 mins)"
          ]
        },
        { 
          title: "Royal Day Trip to Versailles Palace", 
          activities: ["Tour the Palace of Versailles — An opulent symbol of French absolute monarchy boasting 2,300 rooms.", "Walk the Hall of Mirrors — The jaw-dropping gallery where the Treaty of Versailles was signed to end WWI.", "Explore Versailles Gardens — 800 hectares of meticulously landscaped French formal gardens and musical fountains."], 
          cost: (foodCostPerDay + transportationCostPerDay + activitiesCostPerDay) * 1.4, 
          places: ["Versailles"],
          transport: [
            "Walk to the nearest station linking to RER C line",
            "Take RER C Train directly to Versailles Château Rive Gauche Station (₹370, 35 mins)",
            "Walk 10 mins from the station to the gilded gates of Versailles Palace"
          ]
        },
        { 
          title: "Literary Latin Quarter & Pantheon", 
          activities: ["Stroll through Sorbonne area — The historic student quarter that has been the center of French education since the 12th century.", "Visit the Pantheon — The spectacular neoclassical mausoleum housing the remains of Voltaire, Rousseau, and Victor Hugo.", "Shakespeare and Company bookstore visit — The legendary English-language bookstore that served as a haven for the 'Lost Generation' writers.", "Jardin du Luxembourg relax — The most beloved park in Paris featuring statues, tree-lined promenades, and the Medici Fountain."], 
          cost: (foodCostPerDay + transportationCostPerDay + activitiesCostPerDay) * 0.75, 
          places: ["Latin Quarter", "Luxembourg"],
          transport: [
            "Take Metro Line 10 to Cluny - La Sorbonne or RER B to Luxembourg Station (₹190, 10 mins)",
            "Walk 8 mins up the hill from the station to the Pantheon"
          ]
        },
        { 
          title: "Artistic Musee d'Orsay & Saint-Germain", 
          activities: ["Musee d'Orsay Impressionist gallery tour — Housed in a stunning former railway station, it holds the world's largest collection of Impressionist masterpieces.", "Cafe de Flore legendary coffee stop — One of the oldest coffeehouses in Paris, famously frequented by existentialists like Sartre and de Beauvoir.", "Antique shop browsing — Explore the world-renowned 'Carré des Antiquaires' for rare art and vintage furniture."], 
          cost: (foodCostPerDay + transportationCostPerDay + activitiesCostPerDay) * 1.15, 
          places: ["Musee d'Orsay", "Saint-Germain"],
          transport: [
            "Take RER C to Musée d'Orsay Station or Metro Line 12 to Solférino (₹190, 6 mins)",
            "Walk 10 mins from the museum down Rue du Bac to reach Café de Flore"
          ]
        },
        { 
          title: "Historic Marais District & Place des Vosges", 
          activities: ["Walk historical Marais narrow streets — One of the only areas in Paris to survive Haussmann's 19th-century renovations intact.", "Relax at Place des Vosges — The oldest planned square in Paris, beautifully symmetrical with red-brick facades and a favorite of Victor Hugo.", "L'As du Fallafel street lunch — Arguably the most famous falafel stand in the world, located in the historic Jewish quarter.", "Picasso Museum visit — Contains over 5,000 artworks by Pablo Picasso set inside a magnificent 17th-century mansion."], 
          cost: (foodCostPerDay + transportationCostPerDay + activitiesCostPerDay) * 0.85, 
          places: ["Le Marais", "Place des Vosges"],
          transport: [
            "Take Metro Line 1 to Saint-Paul or Line 8 to Chemin Vert (₹190, 8 mins)",
            "Walk 5 mins through the historic arches to Place des Vosges"
          ]
        },
        { 
          title: "Seine Islands & Saint-Chapelle", 
          activities: ["Île de la Cité stroll — The geographical and historical center of Paris where the city was first founded.", "Admire Sainte-Chapelle stained glass — A gothic architectural masterpiece holding 1,113 extraordinary 13th-century stained glass windows.", "Notre-Dame Cathedral exterior tour — Witness the ongoing restoration of this 800-year-old masterpiece of French Gothic architecture.", "Traditional bistro dinner — End the day with classic French cuisine like boeuf bourguignon or duck confit in a cozy setting."], 
          cost: (foodCostPerDay + transportationCostPerDay + activitiesCostPerDay) * 0.95, 
          places: ["Île de la Cité", "Sainte-Chapelle"],
          transport: [
            "Take Metro Line 4 directly to Cité Station on the island (₹190, 5 mins)",
            "Walk 3 mins from the station to the entrance of Sainte-Chapelle inside the Palace of Justice"
          ]
        },
        { 
          title: "Canal Saint-Martin & Local Cafes", 
          activities: ["Stroll along the locks of Canal Saint-Martin — A trendy, tree-lined waterway popular with young locals for sunset picnics.", "Local specialty coffee tasting — Experience the new wave of Parisian coffee culture thriving in this artistic neighborhood.", "Boutique shopping at concept stores — Discover unique, avant-garde Parisian fashion and design items away from mainstream brands."], 
          cost: (foodCostPerDay + transportationCostPerDay + activitiesCostPerDay) * 0.8, 
          places: ["Canal Saint-Martin"],
          transport: [
            "Take Metro Line 5 to Jacques Bonsergent or Line 3/5/8/9/11 to République (₹190, 10 mins)",
            "Walk 3 mins along Quai de Valmy to reach the canal paths"
          ]
        },
        { 
          title: "Champagne Region Tasting Day Trip", 
          activities: ["TGV high-speed train to Reims — Experience France's world-class rail system reaching the Champagne capital in just 45 minutes.", "Champagne historic cellars tour & tasting — Descend into ancient chalk caves to see how authentic Champagne is aged and crafted.", "Admire Reims Cathedral architecture — A massive, breathtaking Gothic cathedral where the kings of France were crowned."], 
          cost: (foodCostPerDay + transportationCostPerDay + activitiesCostPerDay) * 1.7, 
          places: ["Reims", "Champagne"],
          transport: [
            "Take Metro Line 4 or 7 to Gare de l'Est Station (₹190, 10 mins)",
            "Take TGV High-Speed train from Paris Gare de l'Est to Reims Station (₹2,500, 46 mins)",
            "Take local tram line A or B from Reims Station to central Cathedral (₹150, 8 mins)"
          ]
        }
      ];
      const theme = themes[i % themes.length];
      return {
        day: i + 1,
        title: theme.title,
        activities: theme.activities,
        estimatedCost: Math.round(theme.cost),
        placesToVisit: theme.places,
        hotel: hotelInfo,
        transport: theme.transport,
        mealSuggestions: [
          { meal: "Breakfast", place: style === "luxury" ? "Angelina Paris" : style === "budget" ? "Du Pain et des Idées" : "Café de Flore", cost: style === "luxury" ? 2800 : style === "budget" ? 350 : 900, tip: style === "budget" ? "Get a butter croissant and café au lait to go" : "Classic spot, perfect for people watching" },
          { meal: "Lunch", place: style === "luxury" ? "L'Ambroisie (3 Michelin stars)" : style === "budget" ? "L'As du Fallafel in Le Marais" : "Chez Gladines", cost: style === "luxury" ? 25000 : style === "budget" ? 750 : 1600, tip: style === "budget" ? "Join the takeaway queue; it's €4 cheaper than sit-down" : "Hearty Basque cuisine with giant portions" },
          { meal: "Dinner", place: style === "luxury" ? "Le Jules Verne (Eiffel Tower)" : style === "budget" ? "Bouillon Chartier" : "Le Relais de l'Entrecôte", cost: style === "luxury" ? 35000 : style === "budget" ? 1100 : 3500, tip: style === "moderate" ? "No reservations; arrive 30 mins before opening to get in first seating" : "Historic 1896 dining room with ultra-cheap French classics" }
        ],
        localHacks: [
          "Buy a Navigo Easy card to load metro tickets digitally via the Île-de-France Mobilités app.",
          "The Louvre is free for under-26 EU residents, but all visitors must book a time slot online."
        ],
        weatherNote: "Paris weather is unpredictable; carry a light trench coat or windbreaker."
      };
    });
  } else {
    fallbackHotels = [
      {
        name: style === "budget" ? `Central Hostel ${destination}` : style === "luxury" ? `Grand Plaza Resort ${destination}` : `Comfort Inn & Suites ${destination}`,
        pricePerNight: accommodationCostPerNight,
        rating: style === "budget" ? "4.0/5" : style === "luxury" ? "4.7/5" : "4.2/5",
        description: style === "budget" ? "Friendly budget stay close to main attractions." : style === "luxury" ? "Luxurious amenities with stunning views and five-star service." : "Comfortable rooms, free breakfast, and great accessibility.",
        suitability: style === "budget" ? "Very affordable price tag." : style === "luxury" ? "High-end comfort." : "Great value for moderate spenders.",
        distanceToCenter: "0.8 km",
        amenities: ["Free Wi-Fi", style === "luxury" ? "Spa" : "Lounge", "24/7 Front Desk"],
        type: style === "budget" ? "Hostel" : style === "luxury" ? "Resort" : "Hotel",
        benefits: ["Free Breakfast", "Prime Location"],
        bookingPlatform: "Booking.com"
      },
      {
        name: style === "budget" ? `Backpackers Inn ${destination}` : style === "luxury" ? `The Ritz-Carlton ${destination}` : `Urban Boutique Hotel ${destination}`,
        pricePerNight: Math.round(accommodationCostPerNight * 0.8),
        rating: style === "budget" ? "4.1/5" : style === "luxury" ? "4.8/5" : "4.3/5",
        description: style === "budget" ? "Clean bunk beds with lockers and a common lounge." : style === "luxury" ? "Unmatched hospitality and premium fine dining." : "Trendy boutique vibe with unique styling and cafe.",
        suitability: style === "budget" ? "Keeps costs to an absolute minimum." : style === "luxury" ? "Top class luxury experience." : "Highly rated mid-range choice.",
        distanceToCenter: "1.2 km",
        amenities: ["Free Wi-Fi", "Laundry", "Restaurant"],
        type: style === "budget" ? "Hostel" : style === "luxury" ? "Luxury Hotel" : "Boutique Hotel",
        benefits: ["Free Breakfast", "Prime Location"],
        bookingPlatform: "Booking.com"
      },
      {
        name: style === "budget" ? `Downtown Youth Hostel ${destination}` : style === "luxury" ? `Four Seasons ${destination}` : `Metropolitan Hotel ${destination}`,
        pricePerNight: Math.round(accommodationCostPerNight * 0.95),
        rating: style === "budget" ? "3.9/5" : style === "luxury" ? "4.9/5" : "4.4/5",
        description: style === "budget" ? "Lively atmosphere perfect for meeting fellow travelers." : style === "luxury" ? "Exquisite service and elegant suites." : "Modern business hotel with excellent transit links.",
        suitability: "Convenient and well-reviewed.",
        distanceToCenter: "1.5 km",
        amenities: ["Free Wi-Fi", "Gym", "Bar"],
        type: style === "budget" ? "Hostel" : style === "luxury" ? "5-Star Hotel" : "Business Hotel",
        benefits: ["Free Breakfast", "Prime Location"],
        bookingPlatform: "Booking.com"
      },
      {
        name: style === "budget" ? `Eco Stay ${destination}` : style === "luxury" ? `Waldorf Astoria ${destination}` : `Grand City Hotel ${destination}`,
        pricePerNight: Math.round(accommodationCostPerNight * 1.1),
        rating: style === "budget" ? "4.3/5" : style === "luxury" ? "4.8/5" : "4.2/5",
        description: style === "budget" ? "Environmentally friendly stay with organic breakfast." : style === "luxury" ? "Timeless elegance and personalized concierge." : "Spacious rooms with city skyline views.",
        suitability: "Premium amenities for the price.",
        distanceToCenter: "2.0 km",
        amenities: ["Free Wi-Fi", "Eco-friendly", "Pool"],
        type: style === "budget" ? "Guesthouse" : style === "luxury" ? "Luxury Hotel" : "Hotel",
        benefits: ["Free Breakfast", "Prime Location"],
        bookingPlatform: "Booking.com"
      },
      {
        name: style === "budget" ? `Oasis Guesthouse ${destination}` : style === "luxury" ? `St. Regis ${destination}` : `Harbor View Hotel ${destination}`,
        pricePerNight: Math.round(accommodationCostPerNight * 0.85),
        rating: style === "budget" ? "4.2/5" : style === "luxury" ? "4.7/5" : "4.5/5",
        description: style === "budget" ? "Quiet retreat away from the noisy center." : style === "luxury" ? "Signature butler service and refined dining." : "Beautiful views of the local waterfront or park.",
        suitability: "Peaceful relaxing stay.",
        distanceToCenter: "3.5 km",
        amenities: ["Free Wi-Fi", "Terrace", "Room Service"],
        type: style === "budget" ? "Guesthouse" : style === "luxury" ? "Luxury Hotel" : "Hotel",
        benefits: ["Free Breakfast", "Prime Location"],
        bookingPlatform: "Booking.com"
      },
      {
        name: style === "budget" ? `City Center Pods ${destination}` : style === "luxury" ? `Mandarin Oriental ${destination}` : `Design Hotel ${destination}`,
        pricePerNight: Math.round(accommodationCostPerNight * 0.9),
        rating: style === "budget" ? "4.0/5" : style === "luxury" ? "4.9/5" : "4.6/5",
        description: style === "budget" ? "Compact, efficient sleeping pods right in the action." : style === "luxury" ? "Award-winning spa and holistic wellness." : "Award-winning architecture and chic interiors.",
        suitability: "Top location and style.",
        distanceToCenter: "0.2 km",
        amenities: ["Free Wi-Fi", "Spa", "Smart TV"],
        type: style === "budget" ? "Pod Hotel" : style === "luxury" ? "Luxury Hotel" : "Boutique Hotel",
        benefits: ["Free Breakfast", "Prime Location"],
        bookingPlatform: "Booking.com"
      }
    ];

    fallbackItinerary = Array.from({ length: duration }, (_, i) => {
      const selectedHotel = fallbackHotels[0];
      const hotelInfo = selectedHotel 
        ? `${selectedHotel.name} (Located ${selectedHotel.distanceToCenter} from center. ${selectedHotel.suitability} Book via ${selectedHotel.bookingPlatform || 'Booking.com'})`
        : `Recommended hotel in ${destination}. Book via Booking.com.`;

      const themes = [
        { 
          title: `Arrival & ${destination} City Orientation`, 
          activities: [`Check into accommodation in ${destination} — Take time to settle in and familiarize yourself with your local neighborhood.`, `Walk through the downtown or main square — The quickest way to get a feel for the local culture, architecture, and pulse of ${destination}.`, `Familiarize yourself with local public transit — Buy any necessary passes and understand the metro/bus routes to save money later.`, `Welcome dinner with traditional ${destination} cuisine — Start your trip right by tasting the signature local dish recommended by locals.`], 
          places: ["City Center", "Main Square"],
          transport: [
            "Take Airport Express train or official taxi to your hotel (₹800, 35 mins)",
            "Walk around the hotel neighborhood on foot to orient yourself"
          ]
        },
        { 
          title: "Cultural Immersion & Historic Landmarks", 
          activities: ["Visit the primary national museum or gallery — Dive deep into the historical context and artistic heritage that shaped the region.", "Explore the oldest neighborhood in the city — Walk through cobblestone streets and see the original foundational architecture.", "Guided walking tour of historical monuments — A local guide will point out fascinating hidden details you would completely miss on your own.", "Evening cultural performance or local theater — Experience the traditional performing arts or music that defines the local culture."], 
          places: ["Old Town", "Museum District"],
          transport: [
            "Take Metro Line 1 from nearest station to Museum District (₹100, 15 mins)",
            "Walk 10 mins between historic monuments on foot"
          ]
        },
        { 
          title: "Nature, Parks & Outdoor Escapes", 
          activities: ["Morning hike or walk in the largest city park — Escape the urban hustle and see how locals spend their recreational time.", "Visit local botanical gardens — Discover regional flora and beautifully landscaped grounds perfect for photography.", "Relax by the waterfront or nearest natural attraction — Waterways are usually the historic lifeblood of the city and offer great views.", "Casual picnic or cafe lunch outdoors — Grab local ingredients and enjoy a slow, relaxing afternoon meal in nature."], 
          places: ["City Park", "Waterfront"],
          transport: [
            "Take local bus line 101 to Botanical Gardens (₹50, 20 mins)",
            "Stroll along the lakeside trails on foot"
          ]
        },
        { 
          title: "Local Markets & Culinary Journey", 
          activities: ["Explore the bustling central market — The absolute best place to witness authentic daily life, haggling, and fresh local produce.", "Street food tasting tour — Try 4-5 different small bites from highly-rated street vendors to experience true local flavors.", "Visit local artisans and boutique shops — Support independent creators and find unique, handmade items you can't get anywhere else.", "Fine dining experience featuring regional specialties — Splurge on one highly-rated dinner to see how top chefs interpret local ingredients."], 
          places: ["Central Market", "Artisan Quarter"],
          transport: [
            "Take Metro Line 2 or local tram line to Central Market (₹80, 12 mins)",
            "Take a local Auto-rickshaw / Tuk-Tuk between the artisan boutiques"
          ]
        },
        { 
          title: "Day Trip to Nearby Attractions", 
          activities: ["Take a train or bus to a neighboring town or natural wonder — Expand your trip beyond the city limits to see a different pace of life.", "Explore local ruins, castles, or temples outside the city — Discover massive historical sights that required more space than the city could offer.", "Photography walk through scenic landscapes — Capture the unique geography, mountains, or coastal views of the surrounding region.", "Return to city for a relaxed evening — Wind down with a quiet meal after a long day of walking and exploring."], 
          places: ["Surrounding Region"],
          transport: [
            "Take Regional Train (Express) from main station to neighboring town (₹350, 45 mins)",
            "Rent a local bicycle at destination or explore on foot"
          ]
        },
        { 
          title: "Hidden Gems & Local Neighborhoods", 
          activities: ["Wander away from the tourist center to local neighborhoods — This is where things get cheaper, more authentic, and less crowded.", "Visit a niche museum or independent gallery — Skip the massive queues and find specialized, quirky collections that show a different side of culture.", "Coffee hopping at local roasteries — Sit back and people-watch while enjoying the local cafe culture and pastries.", "Dinner at a neighborhood bistro recommended by locals — Skip the English menus and point to what looks good on the chalkboards."], 
          places: ["Local Neighborhoods"],
          transport: [
            "Take Metro Line 4 to a local residential/bohemian district (₹120, 18 mins)",
            "Walk 10 mins to local cafes and boutiques"
          ]
        },
        { 
          title: "Relaxation & Leisure", 
          activities: ["Late morning start with a leisurely brunch — Give your feet a rest and enjoy a slow morning without rushing to an attraction.", "Spa, massage, or local wellness experience — Treat yourself to a traditional local wellness practice (like a bathhouse, massage, or thermal spring).", "Souvenir shopping at your own pace — Pick up meaningful gifts for friends and family without feeling rushed.", "Sunset viewpoints and a quiet evening meal — Find a high vantage point to watch the city transition from day to night."], 
          places: ["Spa District", "Viewpoints"],
          transport: [
            "Take local taxi or rideshare (Grab/Uber) to Spa & Wellness Center (₹200, 15 mins)",
            "Walk back to hotel or take a slow sunset walk"
          ]
        },
        { 
          title: "Adventure & Active Exploration", 
          activities: ["Rent a bike to explore the city limits — Cover more ground than walking while staying intimately connected to the street level.", "Local water sports or hiking trail — Get your heart rate up and experience the natural environment actively.", "Visit an amusement park or interactive exhibit — A fun, high-energy afternoon perfect for cutting loose and enjoying modern entertainment.", "Hearty dinner to refuel — Treat yourself to a massive, satisfying meal after a highly active day."], 
          places: ["Adventure Park", "Trails"],
          transport: [
            "Take local train to Adventure Trail trailhead (₹150, 25 mins)",
            "Rent a bicycle for local trail exploration (₹500 for 4 hours)"
          ]
        },
        { 
          title: "Art, Architecture & Design", 
          activities: ["Self-guided architecture walking tour — Map out the most famous buildings and observe the transition of architectural styles over centuries.", "Visit contemporary art galleries — See what the modern, cutting-edge artists of the region are creating right now.", "Explore the modern business district's skyline — Contrast the historical sights with the sleek glass and steel of the city's economic heart.", "Trendy rooftop bar for evening drinks — Enjoy the skyline you just explored from above with a signature local cocktail."], 
          places: ["Arts District", "Financial Center"],
          transport: [
            "Take Metro Line 3 to Arts District (₹100, 10 mins)",
            "Take a local taxi/rideshare to a rooftop lounge for evening skyline view (₹150, 8 mins)"
          ]
        },
        { 
          title: `Farewell ${destination}`, 
          activities: ["Revisit your favorite neighborhood from the trip — Go back to that one spot you loved and soak it in one last time.", "Last-minute souvenir and gift shopping — Grab those final items you've been thinking about all week.", "Final celebratory feast — Go all out for your last meal, reflecting on the highlights of the journey.", "Pack and prepare for departure — Organize your bags and get ready for a smooth transit to the airport/station."], 
          places: ["Favorite Spot"],
          transport: [
            "Walk around your favorite neighborhood on foot",
            "Take Airport Shuttle bus or Taxi from hotel to Airport (₹800, 40 mins)"
          ]
        }
      ];
      
      const theme = themes[i % themes.length];
      return {
        day: i + 1,
        title: theme.title,
        activities: theme.activities,
        estimatedCost: Math.round(foodCostPerDay + transportationCostPerDay + activitiesCostPerDay),
        placesToVisit: theme.places,
        hotel: hotelInfo,
        transport: theme.transport,
        mealSuggestions: [
          { meal: "Breakfast", place: style === "luxury" ? "Hotel Fine Dining Room" : style === "budget" ? "Street Side Bakery" : "Central Café", cost: style === "luxury" ? 2200 : style === "budget" ? 200 : 550, tip: "Get local traditional breakfast items for best price." },
          { meal: "Lunch", place: style === "luxury" ? "Top-Rated City Restaurant" : style === "budget" ? "Hawker Market / Food Stalls" : "Local Bistro", cost: style === "luxury" ? 4500 : style === "budget" ? 350 : 1100, tip: "Ask for the daily lunch special (menu du jour)." },
          { meal: "Dinner", place: style === "luxury" ? "Michelin Star / Skyline View Dining" : style === "budget" ? "Popular Night Market" : "Family-Run Eatery", cost: style === "luxury" ? 12000 : style === "budget" ? 650 : 2200, tip: "Book online in advance to secure prime window seating." }
        ],
        localHacks: [
          "Download the local ride-hailing app (Grab/Uber/Gojek) before leaving the hotel.",
          "Carry a small amount of local cash for street vendors and small entry fees."
        ],
        weatherNote: "Weather varies; check the local 24-hour forecast and wear comfortable walking shoes."
      };
    });
  }

  // Build destination-specific recommendations and tips with "Title — Why" format
  let recommendations: string[] = [];
  let budgetTips: string[] = [];
  let bestBookingTime = "6-8 weeks before departure";
  let forexAdvice = "Avoid airport currency exchange booths; use local ATMs or digital multi-currency cards.";

  if (destLower.includes("tokyo") || destLower.includes("japan")) {
    bestBookingTime = "8-10 weeks before departure for Tokyo — June–August is peak summer season and flights fill fast";
    forexAdvice = "Use a zero-forex card (Niyo Global or HDFC Regalia) in Japan — ATMs at 7-Eleven and Japan Post are the most reliable for INR withdrawals at fair rates.";
    recommendations = [
      "Book flights 8-10 weeks early — Tokyo flights from India spike 40-60% in peak summer (June-Aug) and Golden Week (late April). Early booking can save ₹10,000-20,000 per person.",
      "Get a IC Suica or Pasmo card on arrival — It covers all metro, JR, and bus rides in Tokyo and avoids per-ride ticket queues. Load ¥3,000-5,000 (~₹1,500-2,500) for a week.",
      "Apply for Japan tourist visa at least 3 weeks before — The VFS Japan visa application takes 5-7 working days and costs ~₹850 for the visa fee. VFS service charges add ~₹1,500 extra.",
    ];
    budgetTips = [
      "Eat at convenience stores (7-Eleven, FamilyMart) for breakfast and late-night snacks — A full onigiri + coffee meal costs ~₹180-250 (¥300-400) vs ₹1,200+ at a sit-down café.",
      "Visit TeamLab Planets in Toyosu, not TeamLab Borderless — Planets tickets are ¥3,200 (~₹1,600) vs ¥3,800 for Borderless and the experience is equally mind-blowing with shorter queues.",
      "Use the Tokyo Wide Pass (¥15,000 / ~₹7,500) for 3 consecutive days if doing Hakone or Nikko — It covers bullet train segments that would individually cost ¥6,000+ each way.",
    ];
  } else if (destLower.includes("paris") || destLower.includes("france")) {
    bestBookingTime = "10-12 weeks before departure for Paris — Summer (June-Aug) is the busiest period; last-minute fares from India can exceed ₹90,000+";
    forexAdvice = "Withdraw Euros from a Paris BNP Paribas or Société Générale ATM using your HDFC Infinia or Axis Atlas card — airport exchange desks add 8-12% markup over interbank rate.";
    recommendations = [
      "Apply for Schengen visa at least 6 weeks early — France Schengen processing takes 15-20 working days. The visa fee is €80 (~₹7,200) plus VFS charges. Missing the window means your trip falls through entirely.",
      "Book Paris museums online in advance — The Louvre and Musee d'Orsay have limited same-day slots and can sell out by 9am in peak season. Booking online avoids 1-2 hour queues and sometimes saves 10-15%.",
      "Buy a Navigo Day Pass (€8.65 / ~₹780) instead of individual Metro tickets — Covers unlimited Metro, RER, bus, and tram rides in zones 1-5, including CDG Airport. Individual tickets are €2.15 each; you break even after 5 rides.",
    ];
    budgetTips = [
      "Pick up a baguette + cheese from a Carrefour City for lunch (~€4 / ~₹360) — Parisian sit-down cafés charge €15-25 for the same calories. This is what locals actually do on weekdays.",
      "Visit the Eiffel Tower at night for the light show (free from ground level) instead of paying €28+ to climb — The illumination runs every hour after dark and is visible from Trocadéro plaza for free.",
      "Use Google Maps offline in Paris — French carriers charge heavy roaming fees. Download the Paris Metro map in the RATP app before you fly to navigate without data.",
    ];
  } else if (
    destLower.includes("thailand") || destLower.includes("bali") ||
    destLower.includes("singapore") || destLower.includes("dubai") ||
    destLower.includes("vietnam") || destLower.includes("malaysia")
  ) {
    bestBookingTime = "6-8 weeks before departure — Southeast Asia flights from India are volatile; last-minute prices jump 30-50% especially during Indian school holidays";
    forexAdvice = "Carry a mix of local cash and a zero-forex travel card — Street markets and tuk-tuks are cash-only, but malls and hotels prefer cards. Airport money changers in Bangkok/Bali give better rates than India.";
    recommendations = [
      "Book accommodation with free cancellation policy — SE Asia weather and travel plans change fast. Agoda and Booking.com often have identical prices but free cancellation rooms let you adjust without penalty.",
      "Grab app (like Ola) is mandatory in Bangkok, KL, and Bali — Fixed-price metered taxis at airports cost 3-4x more than Grab. Always use Grab or Gojek for local transport to avoid tourist pricing.",
      "Get a local SIM at the airport on arrival — A 7-day unlimited data SIM in Thailand costs ~₹400 (THB 149-199). Indian roaming plans cost 5-10x more for the same data. Dtac and TrueMove are best for tourists.",
    ];
    budgetTips = [
      "Eat at hawker centres and street stalls — A full meal in Bangkok or KL at a street stall costs ₹150-300 vs ₹800-1,500 at a tourist restaurant. Pad Thai at a Chatuchak stall (THB 60-80) is better than at any hotel anyway.",
      "Negotiate tuk-tuk and boat prices before boarding — Always agree on the price upfront in writing or show it on Google Translate. Starting offer is usually 3x the fair price; counter at 40-50% of their ask.",
      "Buy sunscreen, toiletries, and medicines at a local Watson's or Boots — These cost 40-60% less than Indian airport prices. Sunscreen in particular is outrageously expensive at Indian airports.",
    ];
  } else if (
    destLower.includes("goa") || destLower.includes("kerala") ||
    destLower.includes("rajasthan") || destLower.includes("kashmir") ||
    destLower.includes("ladakh") || destLower.includes("mumbai") ||
    destLower.includes("delhi") || destLower.includes("india")
  ) {
    bestBookingTime = "4-6 weeks before departure for domestic trips — Indian domestic airfares are most volatile 0-14 days before travel, often doubling in price";
    forexAdvice = "Use UPI and card payments wherever accepted — Domestic destinations increasingly support contactless payments. Carry limited cash (~₹2,000-3,000) for autos, local dhabas, and beach shacks.";
    recommendations = [
      "Book IndiGo or Air India 4-6 weeks out on Tuesday/Wednesday — Domestic airfares are cheapest midweek and earliest in the booking window. Waiting until the last 2 weeks can double your flight cost.",
      "Add travel insurance even for domestic trips — A ₹500-800 policy covers flight delays, cancellations, and medical emergencies. With unpredictable monsoon disruptions and weather cancellations, it pays for itself.",
      "Book hotels directly or via MakeMyTrip for cancellation flexibility — OTA platforms offer free cancellation up to 24-48 hours out. Direct bookings at heritage properties in Rajasthan often include meals and local experiences not available online.",
    ];
    budgetTips = [
      "Use IRCTC trains for long-distance segments — A Sleeper/3AC berth on the Rajdhani or Shatabdi is 60-80% cheaper than flying and gives you more authentic India. Book Tatkal quota if late; it's expensive but beats last-minute flight prices.",
      "Eat at thali restaurants and dhabas — A full regional thali (unlimited refills) costs ₹150-400 depending on the city vs ₹800-1,500 at tourist-facing restaurants. The food quality is often far superior.",
      "Hire a local guide for half-day instead of full-day — In places like Jaipur or Varanasi, a 3-4 hour guided walk (₹800-1,500) covers the highlights. Full-day guides charge ₹2,500+ and add unnecessary fillers.",
    ];
  } else {
    bestBookingTime = "8-10 weeks before departure — International fares from India are most competitive 8-10 weeks out and typically rise 20-40% in the final 2 weeks";
    forexAdvice = "Use a zero-forex card (HDFC Infinia or Axis Atlas) for all card payments abroad — Standard credit cards add 3.5% foreign transaction fee on every purchase, which adds up to thousands on a long trip.";
    recommendations = [
      "Book flights 8-10 weeks in advance — International airfares from India peak in the final 14 days before departure and over Indian holidays. Booking early can save ₹8,000-20,000 per ticket vs last-minute rates.",
      "Research visa requirements at least 6 weeks before — Many countries require proof of accommodation, return tickets, and bank statements for visa approval. Starting the process late risks rejection or missing your travel window.",
      "Download offline maps and translation apps before departure — Google Maps offline mode and Google Translate camera mode (for menus and signs) work without data and save significant roaming charges abroad.",
    ];
    budgetTips = [
      "Use local supermarkets for breakfast and snack items — Buying fruit, yogurt, and bread from a local grocery store typically costs 60-70% less than the equivalent café breakfast, adding up to ₹2,000-5,000 in savings over a week.",
      "Check if your destination has a tourist card or city pass — Many major cities offer 24/72-hour passes covering public transit + top museum entries for a flat fee. These typically save 20-35% vs paying individually.",
      "Withdraw a week's worth of local cash in one ATM transaction — Each ATM withdrawal has a fixed fee (usually ₹200-500 equivalent). One large withdrawal per trip is far cheaper than multiple small ones throughout the week.",
    ];
  }

  return {
    summary: `Based on a ${duration}-day trip from ${origin} to ${destination} at a ${style} budget level, we estimate your total expenses around ₹${predictedCost.toLocaleString()} INR (flights: ₹${flights.toLocaleString()}, accommodation: ₹${accommodation.toLocaleString()}, food: ₹${food.toLocaleString()}, activities: ₹${activities.toLocaleString()}). ${
      overspendRisk > 60
        ? "Warning: Your budget is tight for this travel style. Consider downgrading accommodation or cutting activity days to stay within budget."
        : overspendRisk > 40
        ? "Your budget is manageable but leaves limited room for unplanned expenses. We recommend keeping a 10-15% emergency buffer."
        : "Your budget is well-allocated and should comfortably cover all typical expenses with room for spontaneous spending."
    }`,
    predictedCost,
    overspendRisk,
    costBreakdown: {
      flights,
      accommodation,
      food,
      transportation,
      activities,
      hiddenFees,
    },
    recommendations,
    bestBookingTime,
    budgetTips,
    forexAdvice,
    hotels: fallbackHotels.map(h => ({
      ...h,
      priceCategory: style === "budget" ? "Budget" : style === "luxury" ? "Luxury" : "Mid-Range",
      sustainability: "LEED Certified green building, solar-powered facilities",
      checkInTime: "3:00 PM",
      cancellationPolicy: style === "luxury" ? "Free cancellation up to 24 hours" : "Free cancellation up to 48 hours",
      neighborhoodVibe: style === "budget" ? "Vibrant hostel & social hub" : style === "luxury" ? "Elite shopping & dining district" : "Central historic area",
      loyaltyProgram: style === "luxury" ? "Marriott Bonvoy Premium benefits" : "None"
    })),
    itinerary: fallbackItinerary,
    riskIntel: {
      weatherRisk: destLower.includes("tokyo") || destLower.includes("japan")
        ? "Typhoon season runs Aug–Oct; travel in May–June or Oct–Nov for optimal weather"
        : destLower.includes("paris") || destLower.includes("france")
        ? "Winter rain common Nov–Feb; May–September offers long daylight hours"
        : "Monsoon rains peak in summer months; spring/autumn offer optimal sightseeing",
      politicalStability: "Stable — last State Dept advisory: Level 1 (Exercise normal precautions)",
      healthAdvisory: "No special vaccines required; carry standard OTC medications",
      peakCrowdAlert: destLower.includes("tokyo") || destLower.includes("japan")
        ? "Avoid Shibuya Crossing/Shinjuku stations during weekend peak (6:00 PM – 9:00 PM)"
        : destLower.includes("paris") || destLower.includes("france")
        ? "Avoid Louvre between 11:00 AM – 2:00 PM; late-night Wednesday/Friday entries are quietest"
        : "Avoid popular weekend sightseeing spots; plan major monuments for weekdays before 9:00 AM",
      currencyVolatility: destLower.includes("tokyo") || destLower.includes("japan")
        ? "JPY is 12% weaker vs INR compared to last year — highly favorable for Indian travelers"
        : destLower.includes("paris") || destLower.includes("france")
        ? "EUR-INR exchange rate has stabilized around 89-91; card markups average 2.5%"
        : "Exchange rates have remained stable; cash transactions are preferred in local markets"
    },
    flightStrategy: {
      cheapestDays: "Tuesday & Wednesday departures average 18% cheaper than weekend flights",
      bestAirlines: destLower.includes("tokyo") || destLower.includes("japan")
        ? ["Japan Airlines", "All Nippon Airways", "Singapore Airlines", "IndiGo"]
        : destLower.includes("paris") || destLower.includes("france")
        ? ["Air India", "Air France", "Emirates", "Gulf Air"]
        : ["IndiGo", "Singapore Airlines", "Malaysia Airlines", "Air India"],
      layoverTip: destLower.includes("tokyo") || destLower.includes("japan")
        ? "Hanoi or Kuala Lumpur layovers add 4 hours but save ~₹15,000 per passenger vs direct flights"
        : destLower.includes("paris") || destLower.includes("france")
        ? "Gulf carrier layovers (Abu Dhabi/Bahrain) add 5 hours but save ~₹20,000 vs Air France direct"
        : "Layover flights through hub cities reduce direct ticket costs by 15-25%",
      seatRecommendation: "Book row 31 or exit row seats on long-haul routes for extra legroom at no fee",
      baggageWarning: "Check weight limit: Southeast Asian low-cost carriers enforce 7kg cabin limits strictly"
    },
    pricingIntel: {
      vsLastYear: destLower.includes("tokyo") || destLower.includes("japan")
        ? "Accommodation costs are 22% higher YoY due to Japan's post-covid weak Yen tourism boom"
        : destLower.includes("paris") || destLower.includes("france")
        ? "Hotel rates are 18% higher YoY as Paris capitalizes on post-Olympic travel demand"
        : "Local accommodation and dining prices have increased by 8-12% YoY",
      bookingWindow: "Prices spike 340% on average if booked within 7 days of the travel date",
      alternativeDestination: destLower.includes("tokyo") || destLower.includes("japan")
        ? "Osaka offers 90% of Tokyo's cultural experience at 35% lower accommodation rates"
        : destLower.includes("paris") || destLower.includes("france")
        ? "Lyon offers a similar culinary scene at 40% lower hotel costs than central Paris"
        : "Secondary cities nearby offer similar vibes at 30-50% lower accommodation costs",
      peakAvoidance: "Traveling Monday–Thursday instead of Friday–Sunday saves an average of ₹4,200 per night on hotels"
    }
  };
}
