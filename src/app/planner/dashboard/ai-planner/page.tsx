"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import AIPlannerForm from "@/components/planner/ai/AIPlannerForm";
import AILoadingState from "@/components/planner/ai/AILoadingState";
import AIPlanResult from "@/components/planner/ai/AIPlanResult";
import {
  aiPlannerService,
  AIPlanRequest,
  AIPlanResult as PlanResult,
} from "@/services/planner/ai-planner.service";

type Step = "form" | "loading" | "result";
type LoadingStage = "analyzing" | "generating" | "optimizing" | "finalizing";

export default function AIPlannerPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("form");
  const [loadingStage, setLoadingStage] = useState<LoadingStage>("analyzing");
  const [plan, setPlan] = useState<PlanResult | null>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const handleGeneratePlan = async (request: AIPlanRequest) => {
    setStep("loading");

    // Simulate AI processing stages with realistic timing
    const stages: LoadingStage[] = [
      "analyzing",
      "generating",
      "optimizing",
      "finalizing",
    ];

    try {
      // Show loading stages
      for (let i = 0; i < stages.length; i++) {
        setLoadingStage(stages[i]);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      // Call AI planner API
      const response = await aiPlannerService.generatePlan(request);
      setPlan(response.plan);
      setSessionId(response.sessionId);
      setStep("result");
    } catch (error: any) {
      console.error("Error generating plan:", error);
      alert(
        error.response?.data?.message ||
          "Failed to generate plan. Please try again."
      );
      setStep("form");
    }
  };

  const handleSavePlan = async () => {
    if (!plan || !sessionId) return;

    setSaving(true);
    try {
      const response = await aiPlannerService.savePlan(sessionId, {
        // Event data will be extracted from the plan
        name: "AI Generated Event",
        plan: plan,
      });

      alert("Plan saved successfully!");
      router.push(`/planner/dashboard/events/${response.event._id}`);
    } catch (error: any) {
      console.error("Error saving plan:", error);
      alert(
        error.response?.data?.message ||
          "Failed to save plan. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleStartOver = () => {
    setStep("form");
    setPlan(null);
    setSessionId("");
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push("/planner/dashboard")}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        <h1 className="text-2xl font-bold text-gray-900">AI Event Planner</h1>
        <p className="text-gray-600 mt-1">
          Get AI-powered recommendations for your perfect event
        </p>
      </div>

      {/* Content */}
      {step === "form" && (
        <AIPlannerForm onSubmit={handleGeneratePlan} loading={false} />
      )}

      {step === "loading" && <AILoadingState stage={loadingStage} />}

      {step === "result" && plan && (
        <div className="space-y-6">
          <AIPlanResult plan={plan} onSave={handleSavePlan} saving={saving} />
          <div className="text-center">
            <button
              onClick={handleStartOver}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Generate Another Plan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
