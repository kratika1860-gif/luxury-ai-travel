export interface DetailedFlight {
  id: string;
  carrier: string;
  logo: string;
  flightNo: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  stopDetails?: string;
  price: number;
  cabinClass: string;
  baggage: string;
  benefits: string[];
}

export function generateDetailedFlights(
  origin: string,
  destination: string,
  startDateStr: string,
  travelStyle: "budget" | "moderate" | "luxury"
): DetailedFlight[] {
  const baseDate = new Date(startDateStr);
  const formattedDate = baseDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const carriers = {
    budget: [
      { name: "IndiGo", logo: "6E", flights: ["6E-2051", "6E-1044"] },
      { name: "Air India Express", logo: "IX", flights: ["IX-342", "IX-881"] },
      { name: "SpiceJet", logo: "SG", flights: ["SG-192", "SG-503"] },
    ],
    moderate: [
      { name: "Air India", logo: "AI", flights: ["AI-302", "AI-121"] },
      { name: "Singapore Airlines", logo: "SQ", flights: ["SQ-403", "SQ-406"] },
      { name: "Malaysia Airlines", logo: "MH", flights: ["MH-191", "MH-194"] },
    ],
    luxury: [
      { name: "Emirates", logo: "EK", flights: ["EK-513", "EK-073"] },
      { name: "Singapore Airlines", logo: "SQ", flights: ["SQ-308", "SQ-322"] },
      { name: "Qatar Airways", logo: "QR", flights: ["QR-579", "QR-041"] },
    ],
  };

  // Base price settings
  let basePrice = 25000;
  const destLower = destination.toLowerCase();
  
  if (destLower.includes("goa") || destLower.includes("india") || destLower.includes("mumbai") || destLower.includes("delhi")) {
    basePrice = 6000;
  } else if (destLower.includes("singapore") || destLower.includes("sin") || destLower.includes("dubai") || destLower.includes("dxb") || destLower.includes("bangkok")) {
    basePrice = 20000;
  } else if (destLower.includes("tokyo") || destLower.includes("japan") || destLower.includes("nrt")) {
    basePrice = 45000;
  } else if (destLower.includes("paris") || destLower.includes("london") || destLower.includes("lhr") || destLower.includes("europe")) {
    basePrice = 58000;
  }

  const selectedCarriers = carriers[travelStyle] || carriers.moderate;

  return selectedCarriers.map((c, i) => {
    let price = basePrice;
    let cabinClass = "Economy";
    let baggage = "15 kg Check-in, 7 kg Cabin";
    let benefits = ["Standard Seat selection", "USB Charging"];

    if (travelStyle === "budget") {
      price = basePrice * (0.85 + i * 0.1);
      benefits = ["Low Cost Option", "Pre-book Hot Meals", "Carry-on Only available"];
    } else if (travelStyle === "moderate") {
      price = basePrice * (1.2 + i * 0.15);
      cabinClass = "Premium Economy";
      baggage = "25 kg Check-in, 7 kg Cabin";
      benefits = ["Complimentary Hot Meal", "Free Seat selection", "Extra Legroom", "Priority Boarding"];
    } else if (travelStyle === "luxury") {
      price = basePrice * (3.5 + i * i * 0.8);
      cabinClass = "Business Class";
      baggage = "40 kg Check-in, 10 kg Cabin";
      benefits = [
        "Flatbed Suite Stay",
        "Fine Champagne & Caviar menu",
        "Lounge access & Spa",
        "Chauffeur Transfer included",
        "Priority Fast-track security",
      ];
    }

    // Departure offsets
    const depHour = 6 + i * 5;
    const depMin = i * 15;
    const depTime = `${String(depHour).padStart(2, "0")}:${String(depMin).padStart(2, "0")}`;
    
    const durationHours = destLower.includes("goa") || destLower.includes("india") ? 2.5 : 8 + i * 2;
    const arrHour = (depHour + Math.floor(durationHours)) % 24;
    const arrMin = (depMin + Math.round((durationHours % 1) * 60)) % 60;
    const arrTime = `${String(arrHour).padStart(2, "0")}:${String(arrMin).padStart(2, "0")}`;

    return {
      id: `fl-${travelStyle}-${i}`,
      carrier: c.name,
      logo: c.logo,
      flightNo: c.flights[0],
      departureTime: `${depTime} (${formattedDate})`,
      arrivalTime: `${arrTime} (${formattedDate})`,
      duration: `${Math.floor(durationHours)}h ${Math.round((durationHours % 1) * 60)}m`,
      stops: travelStyle === "budget" ? 0 : i,
      stopDetails: travelStyle === "budget" || i === 0 ? "Direct" : `${i} stop (${i === 1 ? "Kuala Lumpur" : "Singapore"})`,
      price: Math.round(price),
      cabinClass,
      baggage,
      benefits,
    };
  });
}

export function generatePricePredictionChart(basePrice: number): { day: number; price: number }[] {
  const points: { day: number; price: number }[] = [];
  const days = [60, 45, 30, 21, 14, 7, 3, 1, 0];
  
  // Predict price spikes leading to flight
  days.forEach((day, idx) => {
    let multiplier = 1.0;
    if (day === 60) multiplier = 0.85;
    else if (day === 45) multiplier = 0.9;
    else if (day === 30) multiplier = 0.95;
    else if (day === 21) multiplier = 1.05;
    else if (day === 14) multiplier = 1.25;
    else if (day === 7) multiplier = 1.8;
    else if (day === 3) multiplier = 2.4;
    else if (day === 1) multiplier = 3.1;
    else if (day === 0) multiplier = 3.6; // Last minute spikes 3.6x!
    
    points.push({
      day,
      price: Math.round(basePrice * multiplier),
    });
  });

  return points.reverse(); // order from Day 60 to Day 0
}
