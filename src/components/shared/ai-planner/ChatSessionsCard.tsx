"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MessageSquare, Plus } from "lucide-react";
import { toast } from "react-toastify";
import aiPlannerService, { PlanningSession } from "@/services/ai-planner.service";

interface ChatSessionsCardProps {
  /** Route prefix for a session page, e.g. "/vendor/dashboard/ai-planner/chat" */
  chatBasePath: string;
}

/** Start a saved AI chat or reopen a recent one. */
export default function ChatSessionsCard({ chatBasePath }: ChatSessionsCardProps) {
  const router = useRouter();
  const [sessions, setSessions] = useState<PlanningSession[]>([]);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    aiPlannerService
      .getPlanningSessions()
      .then(setSessions)
      .catch(() => setSessions([]));
  }, []);

  const startChat = async () => {
    setStarting(true);
    try {
      const session = await aiPlannerService.startPlanningSession("Planning Session");
      router.push(`${chatBasePath}/${session.id}`);
    } catch (error: any) {
      toast.error(error?.message || "Couldn't start a chat");
      setStarting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-purple-600 flex-shrink-0" />
          <div>
            <h2 className="font-semibold text-gray-900">Plan by chatting</h2>
            <p className="text-sm text-gray-600">
              Describe the event to the AI assistant, then turn the conversation into a full plan.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={startChat}
          disabled={starting}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          {starting ? "Starting…" : "New chat"}
        </button>
      </div>
      {sessions.length > 0 && (
        <ul className="mt-4 divide-y divide-gray-100">
          {sessions.slice(0, 5).map((session) => (
            <li key={session.id}>
              <Link
                href={`${chatBasePath}/${session.id}`}
                className="flex items-center justify-between py-2 text-sm hover:text-purple-700"
              >
                <span className="truncate">{session.title}</span>
                <span className="text-xs text-gray-500 flex-shrink-0 ml-3">
                  {session.status === "completed" ? "Plan created · " : ""}
                  {session.updatedAt ? new Date(session.updatedAt).toLocaleDateString() : ""}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
