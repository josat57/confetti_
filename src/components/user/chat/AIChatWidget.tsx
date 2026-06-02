"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Sparkles,
  X,
  Send,
  Loader2,
  ChevronDown,
  Bot,
  User,
} from "lucide-react";
import { aiAssistantService, AssistantMessage } from "@/services/ai-assistant.service";
import { format } from "date-fns";

const QUICK_PROMPTS = [
  "How do I budget for my event?",
  "What vendors do I need for a wedding?",
  "How far in advance should I book a venue?",
  "What's a good timeline for planning?",
];

const WELCOME: AssistantMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi! I'm your Confetti AI assistant. Ask me anything about event planning — budgets, vendors, timelines, or Nigerian event traditions. How can I help?",
  timestamp: new Date(),
};

function MessageBubble({ msg }: { msg: AssistantMessage }) {
  const isBot = msg.role === "assistant";
  return (
    <div className={`flex gap-2.5 ${isBot ? "" : "flex-row-reverse"} mb-3`}>
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
          isBot ? "bg-purple-100" : "bg-gray-100"
        }`}
      >
        {isBot ? (
          <Bot className="w-3.5 h-3.5 text-purple-600" />
        ) : (
          <User className="w-3.5 h-3.5 text-gray-500" />
        )}
      </div>
      <div className={`max-w-[82%] flex flex-col ${isBot ? "items-start" : "items-end"}`}>
        <div
          className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
            isBot
              ? "bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-xs"
              : "bg-purple-600 text-white rounded-tr-sm"
          }`}
        >
          {msg.content}
        </div>
        <span className="text-[10px] text-gray-400 mt-1">
          {format(msg.timestamp, "h:mm a")}
        </span>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-2.5 mb-3">
      <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
        <Bot className="w-3.5 h-3.5 text-purple-600" />
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-xs">
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}

export default function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<AssistantMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (open) {
      scrollToBottom();
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, scrollToBottom]);

  useEffect(() => {
    if (open) scrollToBottom();
  }, [messages, typing, scrollToBottom, open]);

  async function sendMessage(text: string) {
    if (!text.trim() || typing) return;

    const userMsg: AssistantMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    try {
      const reply = await aiAssistantService.sendMessage(
        text.trim(),
        messages.filter((m) => m.id !== "welcome")
      );

      const botMsg: AssistantMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
      if (!open) setUnread((n) => n + 1);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: "Sorry, I ran into an issue. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setTyping(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <>
      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-50 w-[340px] sm:w-[380px] flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
          style={{ height: "520px" }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-purple-600 text-white flex-shrink-0">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">Confetti AI</p>
              <p className="text-xs text-purple-200">Event planning assistant</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg hover:bg-purple-500 transition-colors"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50 min-h-0">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}
            {typing && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick prompts (shown only at start) */}
          {messages.length === 1 && (
            <div className="px-3 py-2 border-t border-gray-100 flex flex-wrap gap-1.5 bg-white flex-shrink-0">
              {QUICK_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => sendMessage(p)}
                  className="text-[11px] px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-full transition-colors font-medium"
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 py-2.5 border-t border-gray-100 bg-white flex-shrink-0">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about budgets, vendors, timelines…"
                rows={1}
                className="flex-1 resize-none text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[38px] max-h-24"
                style={{ height: "auto" }}
                onInput={(e) => {
                  const t = e.currentTarget;
                  t.style.height = "auto";
                  t.style.height = `${Math.min(t.scrollHeight, 96)}px`;
                }}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || typing}
                className="w-9 h-9 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
              >
                {typing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-50 w-14 h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        aria-label="Open AI assistant"
        style={{ display: open ? "none" : "flex" }}
      >
        <Sparkles className="w-6 h-6" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>
    </>
  );
}
