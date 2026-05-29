// src/lib/visa.ts
export interface VisaInfo {
  required: boolean;
  type: "visa-free" | "e-visa" | "visa-on-arrival" | "embassy" | "sticker";
  costINR: number;
  processingDays: string;
  maxStay: string;
  applyUrl: string;
  documents: string[];
  tips: string[];
  notes: string;
}

const visaDatabase: Record<string, VisaInfo> = {
  japan: {
    required: true,
    type: "sticker",
    costINR: 850,
    processingDays: "5–7 working days",
    maxStay: "15–90 days (single/multiple entry)",
    applyUrl: "https://www.vfsglobal.com/japan/india/",
    documents: [
      "Valid passport (6+ months validity, 2 blank pages)",
      "Visa application form (filled & signed)",
      "Photograph (45×35mm, white background, taken within 6 months)",
      "Flight itinerary (return ticket booking)",
      "Hotel/accommodation bookings for entire stay",
      "Bank statements – last 3 months (min ₹1.5 lakh balance recommended)",
      "Income tax returns – last 2 years",
      "Leave letter from employer or business proof",
      "Travel insurance (min ¥1,00,000 coverage)",
    ],
    tips: [
      "Apply at VFS Japan (not embassy directly) — VFS has centres in 13 cities across India",
      "Book refundable flights before applying — you need the booking reference but don't need to pay in full",
      "Japan rejects applications without a clear daily itinerary — plan day-by-day",
      "First-time applicants are typically granted 15-day single entry. Multiple visits help get longer visas",
    ],
    notes:
      "Japan does NOT offer e-visa or visa-on-arrival for Indian passport holders. Embassy sticker visa is mandatory.",
  },

  france: {
    required: true,
    type: "sticker",
    costINR: 7200,
    processingDays: "15–20 working days",
    maxStay: "Up to 90 days within any 180-day period",
    applyUrl: "https://www.vfsglobal.com/france/india/",
    documents: [
      "Valid passport (3+ months beyond stay, 2 blank pages)",
      "Schengen visa application form (from VFS portal)",
      "2 passport photos (35×45mm, white background, recent)",
      "Return flight bookings (can be on hold/refundable)",
      "Hotel bookings for entire trip",
      "Travel insurance (min €30,000 coverage, covers all Schengen states)",
      "Bank statements – last 6 months (₹2.5 lakh+ balance recommended)",
      "ITR last 2 years OR salary slips last 3 months",
      "NOC from employer + leave sanction letter",
      "If self-employed: GST certificate, business registration",
    ],
    tips: [
      "Book France-first Schengen visa if Paris is your primary destination — enter France first on your trip",
      "Schengen insurance must cover all countries you're visiting — buy a multi-country policy",
      "VFS France appointment slots fill 4–6 weeks ahead in peak summer — book early",
      "Bank balance below ₹2 lakh gets risky — show FDs and stocks as supporting financial proof",
    ],
    notes:
      "Schengen visa covers 26 European countries. €80 (~₹7,200) is the official visa fee. VFS adds ₹1,800–2,000 in service charges.",
  },

  thailand: {
    required: false,
    type: "visa-on-arrival",
    costINR: 0,
    processingDays: "0 (on arrival)",
    maxStay: "30 days",
    applyUrl: "https://www.thaiembassy.com/visa/visa-on-arrival",
    documents: [
      "Valid passport (6+ months validity)",
      "Return flight ticket",
      "Proof of hotel/accommodation",
      "Sufficient funds: THB 10,000 per person (~₹23,000)",
      "Photograph (4×6 cm, recent, white background)",
    ],
    tips: [
      "India–Thailand is now visa-free (announced 2024) — no forms needed at entry, just passport + ticket",
      "Use the e-Arrival card (TM6) on the Thai immigration website before flying to skip paper forms",
      "Suvarnabhumi airport immigration queues can be 90+ min — apply for Thailand pass or fast-track if available",
    ],
    notes:
      "As of 2024, India and Thailand have signed a mutual visa-free agreement for 30-day stays. No fee, no paperwork required beyond passport.",
  },

  bali: {
    required: true,
    type: "visa-on-arrival",
    costINR: 1680,
    processingDays: "0 (on arrival)",
    maxStay: "30 days (extendable to 60)",
    applyUrl: "https://molina.imigrasi.go.id/",
    documents: [
      "Valid passport (6+ months validity, 1 blank page)",
      "Return flight ticket",
      "Proof of hotel/accommodation",
      "USD 35 cash (or equivalent) for VOA fee",
      "Sufficient funds proof",
    ],
    tips: [
      "Pay VoA in USD cash — Ngurah Rai airport money changers charge 10–15% more than market rate",
      "Apply for e-VOA online (molina.imigrasi.go.id) before departure to skip the arrival queue entirely",
      "VoA can be extended once for 30 more days at Bali immigration office for IDR 500,000 (~₹2,600)",
    ],
    notes:
      "Indonesia Visa-on-Arrival (VoA) costs USD 35 (~₹2,900). Online e-VOA is USD 35 + small processing fee but saves 2–3 hours at the airport.",
  },

  singapore: {
    required: false,
    type: "visa-free",
    costINR: 0,
    processingDays: "0",
    maxStay: "30 days",
    applyUrl: "https://www.ica.gov.sg/enter-transit-depart/entering-singapore",
    documents: [
      "Valid passport (6+ months validity)",
      "Return flight ticket",
      "Sufficient funds (SGD 1,000 per person recommended)",
      "Accommodation proof",
    ],
    tips: [
      "Singapore is visa-free for Indian passport holders — no paperwork needed",
      "Fill the Singapore Arrival Card (SGAC) online at least 3 days before to speed up immigration",
      "Changi Airport is excellent — layovers here are a feature, not a bug",
    ],
    notes:
      "Indian passport holders get 30-day visa-free entry to Singapore. No fee, no pre-approval needed.",
  },

  dubai: {
    required: true,
    type: "e-visa",
    costINR: 5250,
    processingDays: "3–5 working days",
    maxStay: "30 days (single entry) or 60 days (multiple entry)",
    applyUrl: "https://www.icp.gov.ae/en/services/visa-services/",
    documents: [
      "Valid passport (6+ months validity, scanned copy)",
      "Passport-size photograph (white background)",
      "Return flight ticket confirmation",
      "Hotel/accommodation booking",
      "Bank statement – last 3 months",
    ],
    tips: [
      "Apply through ICP portal or your airline's visa service — Emirates and Air Arabia offer visa facilitation",
      "UAE e-visa takes 3–5 days but can be expedited in 24 hrs for higher fee",
      "If you have a US visa or UK visa, you can get UAE visa-on-arrival — check eligibility before applying",
    ],
    notes:
      "UAE e-Visa costs AED 250 (~₹5,700) for 30-day single entry. Indian passport holders with a valid US or UK visa can get free visa-on-arrival.",
  },

  malaysia: {
    required: false,
    type: "visa-free",
    costINR: 0,
    processingDays: "0",
    maxStay: "30 days",
    applyUrl: "https://www.imi.gov.my/",
    documents: [
      "Valid passport (6+ months validity)",
      "Return flight ticket",
      "Hotel/accommodation booking",
      "Sufficient funds (RM 1,000 per person ~₹18,000)",
    ],
    tips: [
      "Malaysia is visa-free for Indians for up to 30 days",
      "Register with the Malaysian e-ATIS system online before travel (free, takes 5 mins)",
      "Kuala Lumpur KLIA2 (AirAsia terminal) is separate from KLIA1 — confirm which terminal your flight uses",
    ],
    notes:
      "Indian passport holders get 30-day visa-free access to Malaysia. No application or fees needed.",
  },

  vietnam: {
    required: true,
    type: "e-visa",
    costINR: 2100,
    processingDays: "3 working days",
    maxStay: "90 days (single or multiple entry)",
    applyUrl: "https://evisa.xuatnhapcanh.gov.vn/",
    documents: [
      "Valid passport (6+ months validity, scanned copy)",
      "Digital passport photo (4×6 cm, white background)",
      "Credit/debit card for payment (USD 25)",
    ],
    tips: [
      "Apply on the official Vietnam e-visa portal (evisa.xuatnhapcanh.gov.vn) — not third-party sites that charge 3–4x",
      "Official fee is USD 25 (~₹2,100). Third-party agents charge USD 60–100 for the same e-visa",
      "E-visa is now valid for 90 days and multiple entries — much better than the old 30-day limit",
      "Print your approved e-visa email before departure — some immigration officers ask to see a physical copy",
    ],
    notes:
      "Vietnam e-Visa is available online in 3 working days for USD 25. Apply at the official government portal only to avoid overcharging.",
  },

  goa: {
    required: false,
    type: "visa-free",
    costINR: 0,
    processingDays: "0",
    maxStay: "No limit (domestic travel)",
    applyUrl: "",
    documents: ["Valid government ID (Aadhaar, PAN, Voter ID, or Passport)"],
    tips: [
      "No visa, no passport needed for domestic travel to Goa",
      "Carry a government photo ID — airlines and hotels require ID proof at check-in",
      "Book Goa flights early (4–6 weeks out) — last-minute fares spike 60–100% during December–January peak",
    ],
    notes: "Goa is a domestic destination — no visa or travel documentation beyond a valid government ID is required.",
  },

  kerala: {
    required: false,
    type: "visa-free",
    costINR: 0,
    processingDays: "0",
    maxStay: "No limit (domestic travel)",
    applyUrl: "",
    documents: ["Valid government ID (Aadhaar, PAN, Voter ID, or Passport)"],
    tips: [
      "Domestic destination — no visa or passport needed",
      "For backwaters (Alleppey), book houseboats directly to avoid commission from OTA platforms",
      "Monsoon (June–August) is peak season for Ayurveda resorts — book 2–3 months ahead",
    ],
    notes: "Kerala is a domestic destination — no visa required.",
  },

  rajasthan: {
    required: false,
    type: "visa-free",
    costINR: 0,
    processingDays: "0",
    maxStay: "No limit (domestic travel)",
    applyUrl: "",
    documents: ["Valid government ID (Aadhaar, PAN, Voter ID, or Passport)"],
    tips: [
      "Domestic destination — no visa or passport needed",
      "October–March is peak season for Rajasthan — book heritage hotels 6–8 weeks ahead",
      "Consider a multi-city train route (Delhi → Jaipur → Jodhpur → Jaisalmer) for the most authentic experience",
    ],
    notes: "Rajasthan is a domestic destination — no visa required.",
  },
};

export function getVisaInfo(destination: string): VisaInfo {
  const destLower = destination.toLowerCase();

  // Match destination to our database
  if (destLower.includes("tokyo") || destLower.includes("japan") || destLower.includes("osaka") || destLower.includes("kyoto")) {
    return visaDatabase.japan;
  }
  if (destLower.includes("paris") || destLower.includes("france") || destLower.includes("rome") || destLower.includes("italy") ||
      destLower.includes("barcelona") || destLower.includes("spain") || destLower.includes("amsterdam") ||
      destLower.includes("europe") || destLower.includes("london") || destLower.includes("uk") ||
      destLower.includes("germany") || destLower.includes("berlin") || destLower.includes("prague") ||
      destLower.includes("schengen") || destLower.includes("portugal")) {
    // London/UK needs its own visa, not Schengen
    if (destLower.includes("london") || destLower.includes("uk") || destLower.includes("england") || destLower.includes("scotland")) {
      return {
        required: true,
        type: "sticker",
        costINR: 9200,
        processingDays: "15–20 working days",
        maxStay: "Up to 6 months (Standard Visitor Visa)",
        applyUrl: "https://www.gov.uk/apply-uk-visa",
        documents: [
          "Valid passport (scanned + original)",
          "UK visa application form (filled online at GOV.UK)",
          "2 recent photographs (35×45mm)",
          "Return flight itinerary",
          "Hotel/accommodation bookings",
          "Bank statements – last 6 months (₹3 lakh+ balance recommended)",
          "ITR for 2 years OR salary slips for 3 months",
          "Employer NOC + leave letter",
          "Travel insurance (recommended, not mandatory)",
        ],
        tips: [
          "Apply at VFS UK (not the embassy) — appointments are at VFS Global centres in India",
          "UK visa costs GBP 115 (~₹12,000) for a standard visitor visa — higher than Schengen",
          "Processing takes 3 weeks; apply at least 6 weeks before travel",
          "UK visa decision letter and all stamped pages are reviewed at entry — carry full documentation",
        ],
        notes: "UK is NOT part of Schengen. You need a separate UK Standard Visitor Visa even if you have a Schengen visa.",
      };
    }
    return visaDatabase.france; // Schengen
  }
  if (destLower.includes("thailand") || destLower.includes("bangkok") || destLower.includes("phuket") || destLower.includes("chiang mai")) {
    return visaDatabase.thailand;
  }
  if (destLower.includes("bali") || destLower.includes("indonesia") || destLower.includes("jakarta")) {
    return visaDatabase.bali;
  }
  if (destLower.includes("singapore")) {
    return visaDatabase.singapore;
  }
  if (destLower.includes("dubai") || destLower.includes("uae") || destLower.includes("abu dhabi")) {
    return visaDatabase.dubai;
  }
  if (destLower.includes("malaysia") || destLower.includes("kuala lumpur") || destLower.includes("kl")) {
    return visaDatabase.malaysia;
  }
  if (destLower.includes("vietnam") || destLower.includes("hanoi") || destLower.includes("ho chi minh")) {
    return visaDatabase.vietnam;
  }
  if (destLower.includes("goa")) return visaDatabase.goa;
  if (destLower.includes("kerala") || destLower.includes("kochi") || destLower.includes("munnar") || destLower.includes("alleppey")) {
    return visaDatabase.kerala;
  }
  if (destLower.includes("rajasthan") || destLower.includes("jaipur") || destLower.includes("jodhpur") || destLower.includes("udaipur") || destLower.includes("jaisalmer")) {
    return visaDatabase.rajasthan;
  }
  if (destLower.includes("india") || destLower.includes("delhi") || destLower.includes("mumbai") || destLower.includes("bangalore") ||
      destLower.includes("ladakh") || destLower.includes("kashmir") || destLower.includes("manali") || destLower.includes("shimla")) {
    return {
      required: false,
      type: "visa-free",
      costINR: 0,
      processingDays: "0",
      maxStay: "No limit (domestic travel)",
      applyUrl: "",
      documents: ["Valid government ID (Aadhaar, PAN, Voter ID, or Passport)"],
      tips: [
        "No visa, no passport needed for domestic travel within India",
        "Carry a valid government photo ID — airlines and hotels require ID at check-in",
        "For remote destinations like Ladakh or Arunachal Pradesh, an Inner Line Permit (ILP) may be required — check state government portal",
      ],
      notes: "Domestic destination — no visa required. Just a valid government-issued photo ID.",
    };
  }

  // Default: unknown destination
  return {
    required: true,
    type: "embassy",
    costINR: 5000,
    processingDays: "10–15 working days",
    maxStay: "Varies by country",
    applyUrl: "https://www.mea.gov.in/foreign-missions-in-india.htm",
    documents: [
      "Valid passport (6+ months validity, blank pages)",
      "Visa application form",
      "Recent passport photographs",
      "Return flight itinerary",
      "Hotel bookings for entire stay",
      "Bank statements – last 6 months",
      "Income tax returns or salary proof",
      "Travel insurance covering the destination",
    ],
    tips: [
      "Check the destination country's embassy website in India for exact requirements",
      "Apply at least 6–8 weeks before travel for safety",
      "Book refundable flights before applying — you need booking proof but shouldn't pay non-refundable fares before visa approval",
    ],
    notes: "Contact the destination country's embassy in India or check their official government website for accurate visa requirements.",
  };
}
