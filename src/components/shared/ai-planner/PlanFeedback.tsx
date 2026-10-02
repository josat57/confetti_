"use client";

import { useState } from "react";
import { Star, CheckCircle } from "lucide-react";
import aiPlannerService from "@/services/ai-planner.service";

interface PlanFeedbackProps {
  /** plan.learningInteractionId — the card renders nothing without it (guests, plan level 1) */
  interactionId?: string | null;
  className?: string;
}

/** 1-5 star rating for a generated plan; feeds the AI learning loop. */
export default function PlanFeedback({ interactionId, className = "" }: PlanFeedbackProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comments, setComments] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  if (!interactionId) return null;

  const submit = async () => {
    if (!rating) return;
    setStatus("sending");
    setError(null);
    try {
      await aiPlannerService.submitPlanFeedback({ rating, comments, interactionId });
      setStatus("sent");
    } catch (e: any) {
      setError(e.message);
      setStatus("idle");
    }
  };

  if (status === "sent") {
    return (
      <div className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}>
        <div className="flex items-center text-green-700">
          <CheckCircle className="h-5 w-5 mr-2" />
          <span className="text-sm font-medium">Thanks — your rating helps tailor future plans.</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">Rate this plan</h3>
      <p className="text-sm text-gray-600 mb-3">How useful was this AI plan?</p>
      <div className="flex space-x-1 mb-3" onMouseLeave={() => setHovered(0)}>
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            aria-label={`${value} star${value > 1 ? "s" : ""}`}
            onMouseEnter={() => setHovered(value)}
            onClick={() => setRating(value)}
            className="p-0.5"
          >
            <Star
              className={`h-6 w-6 ${
                value <= (hovered || rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
      {rating > 0 && (
        <>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            maxLength={2000}
            rows={2}
            placeholder="Anything we should improve? (optional)"
            className="w-full text-sm border border-gray-300 rounded-lg p-2 mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="button"
            onClick={submit}
            disabled={status === "sending"}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium disabled:opacity-50"
          >
            {status === "sending" ? "Sending…" : "Submit rating"}
          </button>
        </>
      )}
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
}
