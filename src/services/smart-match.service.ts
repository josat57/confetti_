import type { Vendor } from "@/types/planner";

export interface MatchCriteria {
  eventType: string;
  budget: number;      // total event budget in NGN
  location: string;    // city / state
  guestCount: number;
  categories?: string[];  // desired vendor categories
}

export interface MatchedVendor extends Vendor {
  matchScore: number;       // 0–100
  matchReasons: string[];
}

// Vendor categories that are typically needed per event type
const EVENT_CATEGORY_MAP: Record<string, string[]> = {
  Wedding:            ["Photography", "Catering", "Decoration", "Music & Entertainment", "Makeup & Beauty", "Venue", "Videography", "MC / Host"],
  "Birthday Party":   ["Catering", "Decoration", "Music & Entertainment", "Photography", "MC / Host"],
  "Corporate Event":  ["Catering", "Venue", "Music & Entertainment", "Event Planning", "Photography"],
  Graduation:         ["Photography", "Catering", "Decoration", "Videography"],
  Anniversary:        ["Catering", "Decoration", "Photography", "Music & Entertainment"],
  Conference:         ["Venue", "Catering", "Event Planning", "Photography"],
  "Naming Ceremony":  ["Catering", "Decoration", "Photography", "Music & Entertainment"],
  "Engagement Party": ["Photography", "Catering", "Decoration", "Music & Entertainment"],
};

// Rough per-vendor budget fraction of total event budget
const CATEGORY_BUDGET_SHARE: Record<string, number> = {
  Venue:                   0.30,
  Catering:                0.28,
  Photography:             0.10,
  Videography:             0.08,
  Decoration:              0.10,
  "Music & Entertainment": 0.08,
  "Makeup & Beauty":       0.04,
  "MC / Host":             0.03,
  "Event Planning":        0.06,
  Other:                   0.05,
};

function normalise(city: string) {
  return city.toLowerCase().replace(/\s+/g, "").replace(/\(.*\)/, "");
}

export function scoreVendors(vendors: Vendor[], criteria: MatchCriteria): MatchedVendor[] {
  const preferredCategories =
    criteria.categories?.length
      ? criteria.categories
      : EVENT_CATEGORY_MAP[criteria.eventType] || [];

  return vendors
    .map((vendor) => {
      const reasons: string[] = [];
      let score = 0;

      // ── Category relevance (0–30) ────────────────────────────────────
      const catIndex = preferredCategories.indexOf(vendor.category);
      if (catIndex !== -1) {
        const catScore = Math.max(30 - catIndex * 3, 10);
        score += catScore;
        reasons.push(`Great fit for ${criteria.eventType}`);
      }

      // ── Budget alignment (0–35) ──────────────────────────────────────
      const share = CATEGORY_BUDGET_SHARE[vendor.category] ?? 0.07;
      const allocatedBudget = criteria.budget * share;
      const startingPrice = vendor.pricing?.startingPrice ?? 0;

      if (startingPrice === 0) {
        // No price info — neutral
        score += 15;
      } else if (startingPrice <= allocatedBudget) {
        score += 35;
        reasons.push("Within your budget");
      } else if (startingPrice <= allocatedBudget * 1.25) {
        score += 20;
        reasons.push("Slightly above budget");
      } else {
        score += 5;
      }

      // ── Location proximity (0–20) ────────────────────────────────────
      const vendorCity = normalise(vendor.location?.city ?? "");
      const vendorState = normalise(vendor.location?.state ?? "");
      const criteriaLoc = normalise(criteria.location);

      if (vendorCity === criteriaLoc || vendorState === criteriaLoc) {
        score += 20;
        reasons.push(`Based in ${vendor.location?.city || criteria.location}`);
      } else if (vendorCity.includes(criteriaLoc) || criteriaLoc.includes(vendorCity)) {
        score += 12;
      }

      // ── Rating (0–15) ────────────────────────────────────────────────
      const rating = vendor.rating ?? 0;
      if (rating >= 4.5) {
        score += 15;
        reasons.push("Top-rated vendor");
      } else if (rating >= 4.0) {
        score += 10;
        reasons.push("Highly rated");
      } else if (rating >= 3.5) {
        score += 6;
      }

      // ── Featured / verified boost ────────────────────────────────────
      if (vendor.featured) {
        score += 5;
        reasons.push("Featured vendor");
      }

      if (reasons.length === 0) reasons.push("Available in this category");

      return {
        ...vendor,
        matchScore: Math.min(score, 100),
        matchReasons: reasons.slice(0, 3),
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}
