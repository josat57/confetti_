"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Send,
  Sparkles,
  DollarSign,
  Users,
  Clock,
  Lightbulb,
  TrendingUp,
  AlertCircle,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Download,
  Calendar,
  MapPin,
  CheckCircle2,
  Wand2,
  Bot,
  User,
  RefreshCw,
} from "lucide-react";
import { AIEventPlan, ChatMessage } from "@/services/ai-planner.service";
import aiPlannerService from "@/services/ai-planner.service";

interface AIPlannerChatProps {
  plan: AIEventPlan;
  userType: "admin" | "planner" | "vendor";
  onPlanUpdated: (plan: AIEventPlan) => void;
  onBack: () => void;
  className?: string;
}

const quickPrompts = [
  {
    icon: DollarSign,
    text: "Optimize budget",
    prompt:
      "Can you help me optimize the budget allocation for better value? Look for areas where I can save money or get better deals.",
    accent: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50 hover:bg-emerald-100",
    iconColor: "text-emerald-600",
    border: "border-emerald-100",
  },
  {
    icon: Users,
    text: "More vendors",
    prompt:
      "I need more vendor recommendations, especially for catering and entertainment. Can you suggest additional options with different price ranges?",
    accent: "from-blue-500 to-indigo-500",
    bg: "bg-blue-50 hover:bg-blue-100",
    iconColor: "text-blue-600",
    border: "border-blue-100",
  },
  {
    icon: Clock,
    text: "Improve timeline",
    prompt:
      "Can you help me create a more detailed timeline with better flow between activities? I want to ensure guests are engaged throughout.",
    accent: "from-violet-500 to-purple-500",
    bg: "bg-violet-50 hover:bg-violet-100",
    iconColor: "text-violet-600",
    border: "border-violet-100",
  },
  {
    icon: Lightbulb,
    text: "Creative ideas",
    prompt:
      "I want to make this event more unique and memorable. Can you suggest some creative ideas that fit my theme and budget?",
    accent: "from-amber-500 to-orange-500",
    bg: "bg-amber-50 hover:bg-amber-100",
    iconColor: "text-amber-600",
    border: "border-amber-100",
  },
  {
    icon: TrendingUp,
    text: "Sustainability",
    prompt:
      "How can I make this event more eco-friendly and sustainable while reducing environmental impact?",
    accent: "from-green-500 to-emerald-500",
    bg: "bg-green-50 hover:bg-green-100",
    iconColor: "text-green-600",
    border: "border-green-100",
  },
  {
    icon: AlertCircle,
    text: "Risk planning",
    prompt:
      "What potential risks should I be aware of for this event? Can you help me create contingency plans?",
    accent: "from-rose-500 to-red-500",
    bg: "bg-rose-50 hover:bg-rose-100",
    iconColor: "text-rose-600",
    border: "border-rose-100",
  },
];

const aiCapabilities = [
  "Budget optimization",
  "Vendor recommendations",
  "Timeline planning",
  "Risk assessment",
  "Creative suggestions",
  "Sustainability tips",
];

export default function AIPlannerChat({
  plan,
  userType,
  onPlanUpdated,
  onBack,
  className = "",
}: AIPlannerChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const welcome: ChatMessage = {
      id: "welcome",
      role: "assistant",
      content: `Hello! I'm your AI event planning assistant. I can see you're working on a **${plan.eventType.replace(/_/g, " ")}** for **${plan.guestCount} guests** with a budget of **₦${plan.budget.toLocaleString()}**.\n\nI can help you optimize your budget and timeline, find better vendors, add creative ideas, and plan for risks.\n\nWhat would you like to work on first?`,
      timestamp: new Date().toISOString(),
      planId: plan.id,
    };
    setMessages([welcome]);
  }, [plan]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || inputMessage.trim();
    if (!text || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
      planId: plan.id,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);
    setLoading(true);

    try {
      const response = await aiPlannerService.chatWithAI(plan.id, text, messages);

      await new Promise((r) => setTimeout(r, 900));

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.response,
        timestamp: new Date().toISOString(),
        planId: plan.id,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);

      if (response.updatedPlan) {
        onPlanUpdated(response.updatedPlan);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
          timestamp: new Date().toISOString(),
          planId: plan.id,
        },
      ]);
      setIsTyping(false);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportChat = () => {
    const text = messages
      .map((m) => `${m.role === "user" ? "You" : "AI"}: ${m.content}`)
      .join("\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-chat-${plan.eventType}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatTime = (ts: string) =>
    new Date(ts).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  const renderContent = (content: string) => {
    // Simple bold rendering for **text**
    const parts = content.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={i}>{part.slice(2, -2)}</strong>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 ${className}`}>
      {/* Decorative background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-wrap items-center justify-between gap-3 mb-6"
        >
          {/* Left: back + title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Plan</span>
            </button>

            <div className="hidden sm:block w-px h-5 bg-gray-200" />

            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-200">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                  AI Chat Assistant
                </h1>
                <p className="text-xs text-gray-500 truncate capitalize">
                  {plan.eventType.replace(/_/g, " ")} · {plan.guestCount} guests · ₦{plan.budget.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Right: export */}
          <button
            onClick={exportChat}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </motion.div>

        {/* ── Body grid ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
          {/* Chat panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex flex-col bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-xl shadow-gray-100/60 overflow-hidden"
            style={{ height: "min(72vh, 680px)" }}
          >
            {/* Messages */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 space-y-4 scroll-smooth"
            >
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {/* Avatar */}
                    <div className="shrink-0 mt-0.5">
                      {msg.role === "assistant" ? (
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-purple-200">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center shadow-md">
                          <User className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Bubble + actions */}
                    <div className={`group flex flex-col gap-1 max-w-[78%] sm:max-w-[70%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                      <div
                        className={`relative px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
                          msg.role === "user"
                            ? "bg-gradient-to-br from-violet-600 to-purple-700 text-white rounded-tr-sm shadow-lg shadow-purple-200/50"
                            : "bg-gray-50 border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm"
                        }`}
                      >
                        {renderContent(msg.content)}
                      </div>

                      {/* Timestamp + actions */}
                      <div className={`flex items-center gap-2 px-1 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                        <span className="text-[11px] text-gray-400">{formatTime(msg.timestamp)}</span>

                        {msg.role === "assistant" && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => copyMessage(msg.id, msg.content)}
                              className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                              title="Copy"
                            >
                              {copiedId === msg.id ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                            <button className="p-1 rounded-md text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
                              <ThumbsUp className="h-3.5 w-3.5" />
                            </button>
                            <button className="p-1 rounded-md text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-all">
                              <ThumbsDown className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="flex gap-3"
                  >
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-purple-200">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl rounded-tl-sm shadow-sm">
                      <div className="flex items-center gap-1.5">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-2 h-2 bg-purple-400 rounded-full"
                            animate={{ y: [0, -6, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="border-t border-gray-100 bg-white/90 backdrop-blur-sm px-4 py-3 sm:px-5">
              <div className="flex items-center gap-2.5">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask anything about your event..."
                    disabled={loading}
                    className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-300 focus:bg-white transition-all disabled:opacity-50"
                  />
                  {loading && (
                    <RefreshCw className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400 animate-spin" />
                  )}
                </div>
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || loading}
                  className="w-11 h-11 shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 text-white shadow-lg shadow-purple-200 hover:shadow-purple-300 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* ── Sidebar ──────────────────────────────────────────────────── */}
          <div className="flex flex-col gap-4">
            {/* Quick actions */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-xl shadow-gray-100/60 p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <Wand2 className="h-4 w-4 text-purple-500" />
                <h3 className="text-sm font-semibold text-gray-900">Quick Actions</h3>
              </div>

              {/* Mobile: horizontal scroll; Desktop: grid */}
              <div className="flex gap-2 overflow-x-auto pb-1 lg:grid lg:grid-cols-1 lg:gap-1.5 lg:overflow-visible lg:pb-0 snap-x snap-mandatory">
                {quickPrompts.map((qp, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleSendMessage(qp.prompt)}
                    disabled={loading}
                    className={`shrink-0 snap-start flex items-center gap-2.5 px-3 py-2.5 rounded-xl border ${qp.bg} ${qp.border} text-left transition-all disabled:opacity-50 w-36 lg:w-auto`}
                  >
                    <div className={`shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br ${qp.accent} flex items-center justify-center shadow-sm`}>
                      <qp.icon className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className={`text-xs font-medium ${qp.iconColor} leading-tight`}>{qp.text}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Plan summary */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-xl shadow-gray-100/60 p-4"
            >
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Event Details</h3>
              <div className="space-y-2.5">
                {[
                  { icon: Calendar, label: plan.eventType.replace(/_/g, " "), sub: "Event type" },
                  { icon: MapPin, label: plan.location || "—", sub: "Location" },
                  { icon: Users, label: `${plan.guestCount} guests`, sub: "Attendance" },
                  { icon: DollarSign, label: `₦${plan.budget.toLocaleString()}`, sub: "Total budget" },
                  { icon: Clock, label: new Date(plan.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }), sub: "Event date" },
                ].map(({ icon: Icon, label, sub }, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                      <Icon className="h-3.5 w-3.5 text-purple-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate capitalize">{label}</p>
                      <p className="text-[11px] text-gray-400">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* AI capabilities */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl border border-purple-100 p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-purple-500" />
                <h3 className="text-sm font-semibold text-gray-900">Capabilities</h3>
              </div>
              <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 lg:grid-cols-1">
                {aiCapabilities.map((cap, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                    <span className="text-xs text-gray-600">{cap}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
