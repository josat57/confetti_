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
  AlertCircle,
} from "lucide-react";
import { messagingService, Conversation, Message, MessageRole } from "@/services/messaging.service";
import { useAuth } from "@/contexts/AuthContext";
import { format, isToday, isYesterday } from "date-fns";
import { toast } from "react-toastify";
import VideoCallButton from "@/components/meetings/VideoCallButton";

const THREAD_POLL_MS = 10_000;
const INBOX_POLL_MS = 20_000;

/** Fired after messages are read or sent, so unread badges refresh at once */
export const MESSAGES_CHANGED_EVENT = "confetti:messages-changed";
const announceChange = () => {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(MESSAGES_CHANGED_EVENT));
};

// Full class names (not interpolated) so Tailwind keeps them
const THEMES = {
  purple: {
    activeRow: "bg-purple-50 dark:bg-purple-900/30",
    activeName: "text-purple-700 dark:text-purple-300",
    avatar: "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300",
    badge: "bg-purple-600",
    mine: "bg-purple-600 text-white rounded-br-sm",
    tick: "text-purple-400",
    spinner: "text-purple-500",
    ring: "focus:ring-purple-500",
    send: "bg-purple-600 hover:bg-purple-700",
    emptyIcon: "bg-purple-50 dark:bg-purple-900/30",
    emptyIconColor: "text-purple-400 dark:text-purple-500",
  },
  teal: {
    activeRow: "bg-teal-50 dark:bg-teal-900/30",
    activeName: "text-teal-700 dark:text-teal-300",
    avatar: "bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300",
    badge: "bg-teal-600",
    mine: "bg-teal-600 text-white rounded-br-sm",
    tick: "text-teal-400",
    spinner: "text-teal-500",
    ring: "focus:ring-teal-500",
    send: "bg-teal-600 hover:bg-teal-700",
    emptyIcon: "bg-teal-50 dark:bg-teal-900/30",
    emptyIconColor: "text-teal-400 dark:text-teal-500",
  },
};
type Theme = (typeof THEMES)[keyof typeof THEMES];

function avatarInitials(name: string) {
  return (name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function formatTime(iso: string) {
  const d = new Date(iso);
  if (isToday(d)) return format(d, "h:mm a");
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMM d");
}

function ConversationItem({
  convo,
  isActive,
  onClick,
  currentUserId,
  theme,
}: {
  convo: Conversation;
  isActive: boolean;
  onClick: () => void;
  currentUserId: string;
  theme: Theme;
}) {
  const other = convo.participants.find((p) => p.userId !== currentUserId);
  const displayName = other?.name || "Unknown";

  return (
    <button
      onClick={onClick}
      className={`w-full text-left flex items-start gap-3 px-4 py-3.5 transition-colors border-b border-gray-100 dark:border-gray-700 ${
        isActive ? theme.activeRow : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
      }`}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${theme.avatar}`}>
        {avatarInitials(displayName)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className={`text-sm font-semibold truncate ${isActive ? theme.activeName : "text-gray-900 dark:text-gray-100"}`}>
            {displayName}
          </p>
          {convo.lastMessage?.createdAt && (
            <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0 ml-2">
              {formatTime(convo.lastMessage.createdAt)}
            </span>
          )}
        </div>
        {convo.subject && (
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{convo.subject}</p>
        )}
        {convo.lastMessage && (
          <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">
            {convo.lastMessage.senderName === "You" ? "You: " : ""}
            {convo.lastMessage.content}
          </p>
        )}
      </div>
      {convo.unreadCount > 0 && (
        <span className={`ml-1 mt-1 min-w-[18px] h-[18px] text-white text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0 px-1 ${theme.badge}`}>
          {convo.unreadCount > 99 ? "99+" : convo.unreadCount}
        </span>
      )}
    </button>
  );
}

function MessageBubble({ msg, isMine, theme }: { msg: Message; isMine: boolean; theme: Theme }) {
  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"} mb-3`}>
      {!isMine && (
        <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs font-bold flex items-center justify-center mr-2 flex-shrink-0 self-end mb-1">
          {avatarInitials(msg.senderName)}
        </div>
      )}
      <div className={`max-w-[70%] flex flex-col ${isMine ? "items-end" : "items-start"}`}>
        {!isMine && (
          <span className="text-xs text-gray-400 dark:text-gray-500 mb-1 ml-1">{msg.senderName}</span>
        )}
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
            isMine
              ? theme.mine
              : "bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 text-gray-800 dark:text-gray-100 shadow-xs rounded-bl-sm"
          }`}
        >
          {msg.content}
        </div>
        <span className={`text-[10px] mt-1 text-gray-400 dark:text-gray-500 flex items-center gap-1 ${isMine ? "self-end" : "self-start ml-1"}`}>
          {formatTime(msg.createdAt)}
          {isMine && msg.read && <CheckCheck className={`w-3 h-3 ${theme.tick}`} />}
        </span>
      </div>
    </div>
  );
}

interface MessagesInboxProps {
  theme?: keyof typeof THEMES;
  /** Role shown on optimistic messages until the server confirms them */
  role: MessageRole;
  /** Shown when the inbox is empty */
  emptyHint: string;
}

/**
 * Conversation inbox shared by the client, planner and vendor dashboards.
 * Open a thread directly with `?c=<conversationId>` (used by notifications and "Message" buttons).
 */
export default function MessagesInbox({ theme: themeName = "purple", role, emptyHint }: MessagesInboxProps) {
  const theme = THEMES[themeName];
  const { user } = useAuth();
  const currentUserId = (user as any)?._id || (user as any)?.id || "";

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [inboxError, setInboxError] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [showThread, setShowThread] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const threadPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeIdRef = useRef<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const loadConversations = useCallback(async (silent = false) => {
    try {
      const data = await messagingService.getConversations();
      // The open thread was just read: don't show a stale badge for it
      setConversations(data.map((c) => (c._id === activeIdRef.current ? { ...c, unreadCount: 0 } : c)));
      setInboxError(false);
      return data;
    } catch {
      if (!silent) setInboxError(true);
      return null;
    } finally {
      setLoadingConvos(false);
    }
  }, []);

  const loadMessages = useCallback(async (id: string, silent = false) => {
    if (!silent) setLoadingMessages(true);
    try {
      const { messages: data } = await messagingService.getMessages(id);
      if (activeIdRef.current !== id) return; // user switched threads meanwhile
      setMessages(data);
      const hasUnread = data.some((m) => !m.read && m.senderId !== currentUserId);
      if (hasUnread || !silent) {
        messagingService.markAsRead(id).then(announceChange).catch(() => {});
      }
      setConversations((prev) => prev.map((c) => (c._id === id ? { ...c, unreadCount: 0 } : c)));
    } catch {
      if (!silent) toast.error("Could not load messages");
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  }, [currentUserId]);

  const stopThreadPolling = () => {
    if (threadPollRef.current) {
      clearInterval(threadPollRef.current);
      threadPollRef.current = null;
    }
  };

  const selectConversation = useCallback(async (id: string) => {
    if (activeIdRef.current === id) {
      setShowThread(true);
      return;
    }
    activeIdRef.current = id;
    setActiveId(id);
    setMessages([]);
    setShowThread(true);
    stopThreadPolling();
    await loadMessages(id);
    // Still on this thread (and still mounted)? Then keep it fresh
    if (activeIdRef.current === id) {
      stopThreadPolling();
      threadPollRef.current = setInterval(() => loadMessages(id, true), THREAD_POLL_MS);
    }
  }, [loadMessages]);

  async function handleSend() {
    if (!input.trim() || !activeId || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);

    const optimistic: Message = {
      _id: `opt-${Date.now()}`,
      conversationId: activeId,
      senderId: currentUserId,
      senderRole: role,
      senderName: user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : (user?.username ?? "You"),
      content: text,
      read: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const sent = await messagingService.sendMessage(activeId, { content: text });
      setMessages((prev) => prev.map((m) => (m._id === optimistic._id ? sent : m)));
      loadConversations(true);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to send message");
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

  // First load, then open the thread named in ?c= (if any)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await loadConversations();
      if (cancelled || !data) return;
      const wanted = new URLSearchParams(window.location.search).get("c");
      if (!wanted) return;
      if (!data.some((c) => c._id === wanted)) {
        const convo = await messagingService.getConversation(wanted).catch(() => null);
        if (cancelled || !convo) return;
        setConversations((prev) => (prev.some((c) => c._id === convo._id) ? prev : [convo, ...prev]));
      }
      selectConversation(wanted);
    })();

    // New conversations and previews arrive without a page reload
    const inboxPoll = setInterval(() => loadConversations(true), INBOX_POLL_MS);
    return () => {
      cancelled = true;
      activeIdRef.current = null;
      clearInterval(inboxPoll);
      stopThreadPolling();
    };
  }, [loadConversations, selectConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const filtered = conversations.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.subject?.toLowerCase().includes(q) ||
      c.participants.some((p) => p.name?.toLowerCase().includes(q)) ||
      c.lastMessage?.content?.toLowerCase().includes(q)
    );
  });

  const activeConvo = conversations.find((c) => c._id === activeId);
  const otherParticipant = activeConvo?.participants.find((p) => p.userId !== currentUserId);

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
      {/* Conversation list */}
      <div
        className={`w-full lg:w-80 xl:w-96 flex-shrink-0 border-r border-gray-100 dark:border-gray-700 flex flex-col ${
          showThread ? "hidden lg:flex" : "flex"
        }`}
      >
        <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-700">
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search conversations…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent ${theme.ring}`}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingConvos ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className={`w-6 h-6 animate-spin ${theme.spinner}`} />
            </div>
          ) : inboxError && conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
              <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
              <p className="text-gray-700 dark:text-gray-300 font-medium">Couldn't load your messages</p>
              <button
                onClick={() => { setLoadingConvos(true); loadConversations(); }}
                className="mt-3 text-sm font-medium text-gray-600 dark:text-gray-300 underline"
              >
                Try again
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${theme.emptyIcon}`}>
                <MessageSquare className={`w-10 h-10 ${theme.emptyIconColor}`} />
              </div>
              <h3 className="text-gray-700 dark:text-gray-300 font-semibold text-lg">
                {search ? "No matching conversations" : "No conversations yet"}
              </h3>
              {!search && (
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-1 max-w-xs">{emptyHint}</p>
              )}
            </div>
          ) : (
            filtered.map((c) => (
              <ConversationItem
                key={c._id}
                convo={c}
                isActive={activeId === c._id}
                onClick={() => selectConversation(c._id)}
                currentUserId={currentUserId}
                theme={theme}
              />
            ))
          )}
        </div>
      </div>

      {/* Message thread */}
      <div className={`flex-1 flex flex-col min-w-0 ${!showThread ? "hidden lg:flex" : "flex"}`}>
        {!activeId ? (
          <div className="flex flex-col items-center justify-center h-full py-20 text-center px-6">
            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3">
              <MessageSquare className="w-8 h-8 text-gray-300 dark:text-gray-500" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Select a conversation to view messages</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
              <button
                onClick={() => setShowThread(false)}
                className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className={`w-9 h-9 rounded-full text-sm font-bold flex items-center justify-center flex-shrink-0 ${theme.avatar}`}>
                {otherParticipant ? avatarInitials(otherParticipant.name) : <User className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {otherParticipant?.name || "Conversation"}
                </p>
                {activeConvo?.subject && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{activeConvo.subject}</p>
                )}
              </div>
              {activeId && <VideoCallButton key={activeId} conversationId={activeId} defaultTitle={`Call with ${otherParticipant?.name || "you"}`} />}
              <button
                onClick={() => activeId && loadMessages(activeId)}
                title="Refresh"
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50 dark:bg-gray-900/50">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className={`w-6 h-6 animate-spin ${theme.spinner}`} />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-12 h-12 bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-full flex items-center justify-center mb-3 shadow-sm">
                    <MessageSquare className="w-5 h-5 text-gray-300 dark:text-gray-500" />
                  </div>
                  <p className="text-gray-400 dark:text-gray-500 text-sm">No messages yet. Say hello!</p>
                </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <MessageBubble key={msg._id} msg={msg} isMine={msg.senderId === currentUserId} theme={theme} />
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message… (Enter to send, Shift+Enter for newline)"
                  rows={1}
                  maxLength={5000}
                  className={`flex-1 resize-none px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent min-h-[42px] max-h-32 ${theme.ring}`}
                  onInput={(e) => {
                    const t = e.currentTarget;
                    t.style.height = "auto";
                    t.style.height = `${Math.min(t.scrollHeight, 128)}px`;
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  className={`w-10 h-10 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${theme.send}`}
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5 ml-1">
                Messages refresh automatically every 10 seconds
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
