import api from "@/api/api";

export interface AssistantMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// Rule-based fallback responses keyed by topic keywords
const FALLBACK_RULES: Array<{ keywords: string[]; response: string }> = [
  {
    keywords: ["budget", "cost", "price", "afford", "expensive", "cheap"],
    response:
      "For Nigerian events, a rough guide: wedding budgets start around ₦2M–₦5M for 100 guests, birthday parties from ₦300K, corporate events vary by scale. Catering typically takes 25–30%, venue 20–30%, and decor 10–15%. Would you like me to break down a specific budget for your event?",
  },
  {
    keywords: ["vendor", "photographer", "caterer", "decoration", "MC", "DJ"],
    response:
      "When choosing vendors, check reviews, view their portfolio, and always request an itemized quote. Book photographers and caterers 3–6 months ahead for peak season (Dec–Jan, April). Use the Smart Match feature on the Vendors page to automatically rank vendors by your budget and event type.",
  },
  {
    keywords: ["wedding", "marriage", "bride", "groom"],
    response:
      "Nigerian weddings typically include the traditional ceremony, white wedding, and reception. Key vendors to book early: photographer/videographer, caterer, venue, and decorator. Average Lagos wedding budget is ₦3M–₦15M+ depending on scale. Want tips on any specific aspect?",
  },
  {
    keywords: ["timeline", "schedule", "plan", "checklist", "deadline"],
    response:
      "A typical event planning timeline: 6+ months out — book venue and key vendors; 3 months — send invites, finalize decor theme; 1 month — confirm all vendors, finalize guest list; 1 week — final walkthrough, confirm logistics. Use the AI Planner to generate a detailed checklist tailored to your event.",
  },
  {
    keywords: ["guest", "invite", "invitations", "rsvp", "attendance"],
    response:
      "Rule of thumb: expect 70–80% of invited guests to attend. For catering, plan for 10% extra. Digital invites via WhatsApp/email work well in Nigeria for RSVPs. Physical aso-ebi distribution typically drives attendance for traditional events.",
  },
  {
    keywords: ["venue", "hall", "location", "space", "outdoor"],
    response:
      "Venue checklist: parking, power backup (generator), catering kitchen access, maximum capacity, and security. Book at least 3 months ahead in Lagos. Indoor venues typically start from ₦300K/day, while outdoor marquee setups from ₦150K. Always visit before booking.",
  },
  {
    keywords: ["decoration", "decor", "theme", "flowers", "lighting", "color"],
    response:
      "Popular Nigerian event themes: Yoruba traditional (aso-oke, ankara), black & gold, garden party, and all-white. Lighting is often underbudgeted — it transforms any space. Budget 8–12% of your total event budget for decor and ensure your decorator has a recent portfolio.",
  },
  {
    keywords: ["food", "catering", "menu", "drinks", "drinks"],
    response:
      "For Nigerian events, per-head catering typically ranges from ₦3,000–₦8,000+ for a full meal. Must-haves: jollof rice, chicken/goat, assorted proteins, small chops for cocktail hour, and a variety of drinks. Always do a tasting before signing. Plan 10–15% extra for unexpected guests.",
  },
  {
    keywords: ["how", "help", "start", "begin", "first"],
    response:
      "Great starting point! Here's what to do first:\n1. Set your total budget\n2. Confirm your event date\n3. Book the venue (fills up fastest)\n4. Use the AI Planner to generate a full plan with vendor recommendations\n5. Start sending quote requests to vendors\n\nWhat aspect would you like to dig into?",
  },
];

const GREETING_PATTERNS = /^(hi|hello|hey|good morning|good afternoon|good evening|sup|yo)\b/i;

function getOfflineResponse(message: string): string {
  const lower = message.toLowerCase();

  if (GREETING_PATTERNS.test(lower)) {
    return "Hi! I'm your Confetti AI assistant. I can help with event budgets, vendor selection, planning timelines, and more. What are you planning?";
  }

  for (const rule of FALLBACK_RULES) {
    if (rule.keywords.some((k) => lower.includes(k))) {
      return rule.response;
    }
  }

  return "I can help with event budgets, vendor selection, timelines, and Nigerian event traditions. Could you tell me more about what you're planning? For a full AI-generated event plan, try the AI Planner page.";
}

export const aiAssistantService = {
  async sendMessage(
    message: string,
    history: AssistantMessage[]
  ): Promise<string> {
    // Try backend general chat endpoint
    try {
      const res = await api.post("/ai-assistant/chat", {
        message,
        history: history.map((m) => ({ role: m.role, content: m.content })),
      });
      const data = res.data?.data || res.data;
      if (data?.response || data?.message || data?.content) {
        return data.response || data.message || data.content;
      }
    } catch {
      // fall through
    }

    // Try general AI planner chat without plan ID
    try {
      const res = await api.post("/ai-planner/chat", {
        message,
        conversationHistory: history.map((m) => ({
          role: m.role,
          content: m.content,
          timestamp: m.timestamp,
        })),
      });
      const data = res.data?.data || res.data;
      if (data?.response) return data.response;
    } catch {
      // fall through to offline
    }

    // Smart offline fallback
    return getOfflineResponse(message);
  },
};
