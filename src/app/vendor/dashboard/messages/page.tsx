"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Send,
  Search,
  MessageSquare,
  ChevronLeft,
  CheckCheck,
  Loader2,
  User,
  RefreshCw,
} from "lucide-react";
import { messagingService, Conversation, Message } from "@/services/messaging.service";
import { useAuth } from "@/contexts/AuthContext";
import { format, isToday, isYesterday } from "date-fns";
import { toast } from "react-toastify";

const POLL_INTERVAL = 10_000;

function avatarInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function formatMessageTime(iso: string) {
  const d = new Date(iso);
  if (isToday(d)) return format(d, "h:mm a");
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMM d");
}

function formatConversationTime(iso: string) {
  const d = new Date(iso);
  if (isToday(d)) return format(d, "h:mm a");
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMM d");
}

function EmptyInbox() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-20 text-center px-6">
      <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mb-4">
        <MessageSquare className="w-10 h-10 text-purple-400" />
      </div>
      <h3 className="text-gray-700 font-semibold text-lg">No conversations yet</h3>
      <p className="text-gray-400 text-sm mt-1 max-w-xs">
        When clients or planners message you, conversations will appear here.
      </p>
    </div>
  );
}

function EmptyThread() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-20 text-center px-6">
      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
        <MessageSquare className="w-8 h-8 text-gray-300" />
      </div>
      <p className="text-gray-500 text-sm">Select a conversation to view messages</p>
    </div>
  );
}

function ConversationItem({
  convo,
  isActive,
  onClick,
  currentUserId,
}: {
  convo: Conversation;
  isActive: boolean;
  onClick: () => void;
  currentUserId: string;
}) {
  const other = convo.participants.find((p) => p.userId !== currentUserId);
  const displayName = other?.name || "Client";
  const initials = avatarInitials(displayName);

  return (
    <button
      onClick={onClick}
      className={`w-full text-left flex items-start gap-3 px-4 py-3.5 transition-colors border-b border-gray-50 ${
        isActive ? "bg-purple-50" : "hover:bg-gray-50"
      }`}
    >
      <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0 text-sm font-bold">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className={`text-sm font-semibold truncate ${isActive ? "text-purple-700" : "text-gray-900"}`}>
            {displayName}
          </p>
          {convo.lastMessage?.createdAt && (
            <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
              {formatConversationTime(convo.lastMessage.createdAt)}
            </span>
          )}
        </div>
        {convo.subject && (
          <p className="text-xs text-gray-500 truncate">{convo.subject}</p>
        )}
        {convo.lastMessage && (
          <p className="text-xs text-gray-400 truncate mt-0.5">
            {convo.lastMessage.content}
          </p>
        )}
      </div>
      {convo.unreadCount > 0 && (
        <span className="ml-1 mt-1 min-w-[18px] h-[18px] bg-purple-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0 px-1">
          {convo.unreadCount > 99 ? "99+" : convo.unreadCount}
        </span>
      )}
    </button>
  );
}

function MessageBubble({ msg, isMine }: { msg: Message; isMine: boolean }) {
  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"} mb-3`}>
      {!isMine && (
        <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-600 text-xs font-bold flex items-center justify-center mr-2 flex-shrink-0 self-end mb-1">
          {avatarInitials(msg.senderName)}
        </div>
      )}
      <div className={`max-w-[70%] flex flex-col ${isMine ? "items-end" : "items-start"}`}>
        {!isMine && (
          <span className="text-xs text-gray-400 mb-1 ml-1">{msg.senderName}</span>
        )}
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isMine
              ? "bg-purple-600 text-white rounded-br-sm"
              : "bg-white border border-gray-100 text-gray-800 shadow-xs rounded-bl-sm"
          }`}
        >
          {msg.content}
        </div>
        <span className={`text-[10px] mt-1 text-gray-400 flex items-center gap-1 ${isMine ? "self-end" : "self-start ml-1"}`}>
          {formatMessageTime(msg.createdAt)}
          {isMine && msg.read && <CheckCheck className="w-3 h-3 text-purple-400" />}
        </span>
      </div>
    </div>
  );
}

export default function VendorMessagesPage() {
  const { user } = useAuth();
  const currentUserId = (user as any)?._id || (user as any)?.id || "";

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [showThread, setShowThread] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  async function loadConversations() {
    try {
      const data = await messagingService.getConversations();
      setConversations(data);
    } catch {
      // silent
    } finally {
      setLoadingConvos(false);
    }
  }

  async function loadMessages(id: string, silent = false) {
    if (!silent) setLoadingMessages(true);
    try {
      const { messages: data } = await messagingService.getMessages(id);
      setMessages(data);
      messagingService.markAsRead(id).catch(() => {});
      setConversations((prev) =>
        prev.map((c) => (c._id === id ? { ...c, unreadCount: 0 } : c))
      );
    } catch {
      if (!silent) toast.error("Could not load messages");
    } finally {
      setLoadingMessages(false);
    }
  }

  async function selectConversation(id: string) {
    if (activeId === id) return;
    setActiveId(id);
    setMessages([]);
    setShowThread(true);
    stopPolling();
    await loadMessages(id);
    startPolling(id);
  }

  function startPolling(id: string) {
    stopPolling();
    pollRef.current = setInterval(() => {
      loadMessages(id, true);
    }, POLL_INTERVAL);
  }

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  async function handleSend() {
    if (!input.trim() || !activeId || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);

    const optimistic: Message = {
      _id: `opt-${Date.now()}`,
      conversationId: activeId,
      senderId: currentUserId,
      senderRole: "vendor",
      senderName: user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : (user?.username ?? "You"),
      content: text,
      read: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const sent = await messagingService.sendMessage(activeId, { content: text });
      setMessages((prev) =>
        prev.map((m) => (m._id === optimistic._id ? sent : m))
      );
      loadConversations();
    } catch {
      toast.error("Failed to send message");
      setMessages((prev) => prev.filter((m) => m._id !== optimistic._id));
      setInput(text);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  useEffect(() => {
    loadConversations();
    return () => stopPolling();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const filtered = conversations.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.subject?.toLowerCase().includes(q) ||
      c.participants.some((p) => p.name.toLowerCase().includes(q)) ||
      c.lastMessage?.content.toLowerCase().includes(q)
    );
  });

  const activeConvo = conversations.find((c) => c._id === activeId);
  const otherParticipant = activeConvo?.participants.find(
    (p) => p.userId !== currentUserId
  );

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
      {/* Conversation list */}
      <div
        className={`w-full lg:w-80 xl:w-96 flex-shrink-0 border-r border-gray-100 flex flex-col ${
          showThread ? "hidden lg:flex" : "flex"
        }`}
      >
        <div className="px-4 py-4 border-b border-gray-100">
          <h1 className="text-lg font-bold text-gray-900 mb-3">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search conversations…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingConvos ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyInbox />
          ) : (
            filtered.map((c) => (
              <ConversationItem
                key={c._id}
                convo={c}
                isActive={activeId === c._id}
                onClick={() => selectConversation(c._id)}
                currentUserId={currentUserId}
              />
            ))
          )}
        </div>
      </div>

      {/* Message thread */}
      <div
        className={`flex-1 flex flex-col min-w-0 ${
          !showThread ? "hidden lg:flex" : "flex"
        }`}
      >
        {!activeId ? (
          <EmptyThread />
        ) : (
          <>
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 bg-white">
              <button
                onClick={() => setShowThread(false)}
                className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 text-sm font-bold flex items-center justify-center flex-shrink-0">
                {otherParticipant ? avatarInitials(otherParticipant.name) : <User className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {otherParticipant?.name || "Conversation"}
                </p>
                {activeConvo?.subject && (
                  <p className="text-xs text-gray-500 truncate">{activeConvo.subject}</p>
                )}
              </div>
              <button
                onClick={() => activeId && loadMessages(activeId)}
                title="Refresh"
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-12 h-12 bg-white border border-gray-100 rounded-full flex items-center justify-center mb-3 shadow-sm">
                    <MessageSquare className="w-5 h-5 text-gray-300" />
                  </div>
                  <p className="text-gray-400 text-sm">No messages yet. Say hello!</p>
                </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <MessageBubble
                      key={msg._id}
                      msg={msg}
                      isMine={msg.senderId === currentUserId}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            <div className="px-4 py-3 border-t border-gray-100 bg-white">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message… (Enter to send, Shift+Enter for newline)"
                  rows={1}
                  className="flex-1 resize-none px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[42px] max-h-32"
                  style={{ height: "auto" }}
                  onInput={(e) => {
                    const t = e.currentTarget;
                    t.style.height = "auto";
                    t.style.height = `${Math.min(t.scrollHeight, 128)}px`;
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  className="w-10 h-10 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-1.5 ml-1">
                Messages refresh automatically every 10 seconds
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
