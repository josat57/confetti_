"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Bot,
  Send,
  ArrowLeft,
  Sparkles,
  FileText,
  Download,
  Share2,
  Lightbulb,
  Clock,
  User,
  Copy,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";
import {
  aiPlannerService,
  PlanningSession,
  ChatMessage,
} from "@/services/ai-planner.service";

export default function AIChatPage() {
  const params = useParams();
  const router = useRouter();
  const [session, setSession] = useState<PlanningSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [generating, setGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sessionId = params.id as string;

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const sessionData = await aiPlannerService.getPlanningSession(
          sessionId
        );
        setSession(sessionData);
      } catch (error: any) {
        toast.error("Failed to load chat session");
        router.push("/vendor/dashboard/ai-planner");
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchSession();
    }
  }, [sessionId, router]);

  useEffect(() => {
    scrollToBottom();
  }, [session?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sending) return;

    const userMessage = message;
    setMessage("");
    setSending(true);

    try {
      // Add user message to UI immediately
      const tempUserMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content: userMessage,
        timestamp: new Date().toISOString(),
      };

      setSession((prev) =>
        prev
          ? {
              ...prev,
              messages: [...prev.messages, tempUserMessage],
            }
          : null
      );

      // Send message to AI
      const aiResponse = await aiPlannerService.sendMessage(
        sessionId,
        userMessage
      );

      // Update session with AI response
      const updatedSession = await aiPlannerService.getPlanningSession(
        sessionId
      );
      setSession(updatedSession);
    } catch (error: any) {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleGeneratePlan = async () => {
    setGenerating(true);
    try {
      const plan = await aiPlannerService.generatePlanFromChat(sessionId);
      toast.success("Event plan generated successfully!");
      router.push(`/vendor/dashboard/ai-planner/plans/${plan.id}`);
    } catch (error: any) {
      toast.error("Failed to generate plan");
    } finally {
      setGenerating(false);
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Message copied to clipboard");
  };

  const suggestedPrompts = [
    "I need help planning a wedding for 150 guests with a budget of ₦2,000,000",
    "Create a corporate event timeline for a product launch",
    "What are the best venues for a birthday party in Lagos?",
    "Help me plan a sustainable eco-friendly event",
    "I need vendor recommendations for catering services",
    "Create a detailed budget breakdown for my event",
  ];

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-96 bg-gray-200 rounded-xl"></div>
          <div className="h-12 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-2rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white rounded-t-xl">
        <div className="flex items-center gap-4">
          <Link
            href="/vendor/dashboard/ai-planner"
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">{session.title}</h1>
              <p className="text-sm text-gray-600">
                {session.messages.length} messages
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGeneratePlan}
            disabled={generating || session.messages.length < 2}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {generating ? "Generating..." : "Generate Plan"}
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
        {session.messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Welcome to AI Event Planner!
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              I'm here to help you create amazing events. Tell me about your
              event vision, and I'll help bring it to life!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
              {suggestedPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => setMessage(prompt)}
                  className="p-3 text-left bg-white border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all text-sm"
                >
                  <Lightbulb className="w-4 h-4 text-purple-600 mb-2" />
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          session.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-4 ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}

              <div
                className={`max-w-3xl rounded-2xl p-4 ${
                  msg.role === "user"
                    ? "bg-purple-600 text-white"
                    : "bg-white border border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    <div
                      className={`text-xs mt-2 flex items-center gap-2 ${
                        msg.role === "user"
                          ? "text-purple-100"
                          : "text-gray-500"
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  <button
                    onClick={() => copyMessage(msg.content)}
                    className={`p-1 rounded transition-colors ${
                      msg.role === "user"
                        ? "text-purple-200 hover:text-white"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {msg.role === "user" && (
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
              )}
            </div>
          ))
        )}

        {sending && (
          <div className="flex gap-4 justify-start">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-gray-600">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
                <span className="text-sm">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 bg-white border-t border-gray-200 rounded-b-xl">
        <form onSubmit={handleSendMessage} className="flex gap-4">
          <div className="flex-1 relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your event vision, ask for recommendations, or request plan modifications..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={3}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-400">
              Press Enter to send, Shift+Enter for new line
            </div>
          </div>
          <button
            type="submit"
            disabled={!message.trim() || sending}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send className="w-5 h-5" />
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
