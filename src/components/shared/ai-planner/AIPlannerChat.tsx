"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Send,
  Bot,
  User,
  Sparkles,
  RefreshCw,
  MessageSquare,
  Lightbulb,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Wand2,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Download,
  Share2,
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
    text: "Optimize my budget allocation",
    prompt:
      "Can you help me optimize the budget allocation for better value? Look for areas where I can save money or get better deals.",
    color: "bg-green-100 text-green-700 hover:bg-green-200",
  },
  {
    icon: Users,
    text: "Find more vendor options",
    prompt:
      "I need more vendor recommendations, especially for catering and entertainment. Can you suggest additional options with different price ranges?",
    color: "bg-blue-100 text-blue-700 hover:bg-blue-200",
  },
  {
    icon: Clock,
    text: "Improve event timeline",
    prompt:
      "Can you help me create a more detailed timeline with better flow between activities? I want to ensure guests are engaged throughout.",
    color: "bg-purple-100 text-purple-700 hover:bg-purple-200",
  },
  {
    icon: Lightbulb,
    text: "Add creative ideas",
    prompt:
      "I want to make this event more unique and memorable. Can you suggest some creative ideas that fit my theme and budget?",
    color: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
  },
  {
    icon: TrendingUp,
    text: "Enhance sustainability",
    prompt:
      "How can I make this event more eco-friendly and sustainable? I want to reduce environmental impact while maintaining quality.",
    color: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
  },
  {
    icon: AlertCircle,
    text: "Risk mitigation",
    prompt:
      "What potential risks should I be aware of for this event? Can you help me create contingency plans for common issues?",
    color: "bg-orange-100 text-orange-700 hover:bg-orange-200",
  },
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initialize with welcome message
    const welcomeMessage: ChatMessage = {
      id: "welcome",
      role: "assistant",
      content: `Hello! I'm your AI event planning assistant. I can see you're working on a ${plan.eventType.replace(
        "_",
        " "
      )} event for ${
        plan.guestCount
      } guests with a budget of ₦${plan.budget.toLocaleString()}. 

I can help you:
• Optimize your budget and timeline
• Find better vendor options
• Add creative ideas and enhancements
• Improve sustainability
• Plan for potential risks
• Answer any questions about your event

What would you like to work on first?`,
      timestamp: new Date().toISOString(),
      planId: plan.id,
    };

    setMessages([welcomeMessage]);
  }, [plan]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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
      const response = await aiPlannerService.chatWithAI(
        plan.id,
        text,
        messages
      );

      // Simulate typing delay
      setTimeout(() => {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response.response,
          timestamp: new Date().toISOString(),
          planId: plan.id,
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setIsTyping(false);

        // Update plan if AI made changes
        if (response.updatedPlan) {
          onPlanUpdated(response.updatedPlan);
        }
      }, 1500);
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
        timestamp: new Date().toISOString(),
        planId: plan.id,
      };

      setMessages((prev) => [...prev, errorMessage]);
      setIsTyping(false);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    // You could add a toast notification here
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 ${className}`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 mb-6 lg:mb-8"
        >
          <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors self-start sm:mr-4"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Back to Plan
            </button>
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl mr-3 sm:mr-4">
                <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  AI Chat Assistant
                </h1>
                <p className="text-sm sm:text-base text-gray-600 capitalize">
                  {plan.eventType.replace("_", " ")} • {plan.guestCount} guests
                  • ₦{plan.budget.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-end">
            <button
              onClick={() => {
                // Export chat functionality
                const chatContent = messages
                  .map(
                    (msg) =>
                      `${msg.role === "user" ? "You" : "AI"}: ${msg.content}`
                  )
                  .join("\n\n");
                const blob = new Blob([chatContent], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `ai-chat-${plan.eventType}-${Date.now()}.txt`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              className="flex items-center px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm w-full sm:w-auto justify-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Chat
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Chat Area */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl lg:rounded-2xl shadow-lg h-[400px] sm:h-[500px] lg:h-[600px] flex flex-col"
            >
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 space-y-3 lg:space-y-4">
                <AnimatePresence>
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex ${
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-[80%] ${
                          message.role === "user"
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                            : "bg-gray-100 text-gray-900"
                        } rounded-2xl px-3 sm:px-4 py-2 sm:py-3 relative group`}
                      >
                        <div className="flex items-start space-x-2 sm:space-x-3">
                          <div
                            className={`p-1.5 sm:p-2 rounded-full flex-shrink-0 ${
                              message.role === "user"
                                ? "bg-white/20"
                                : "bg-green-100"
                            }`}
                          >
                            {message.role === "user" ? (
                              <User className="h-3 w-3 sm:h-4 sm:w-4" />
                            ) : (
                              <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed">
                              {message.content}
                            </div>
                            <div
                              className={`text-xs mt-1 sm:mt-2 ${
                                message.role === "user"
                                  ? "text-white/70"
                                  : "text-gray-500"
                              }`}
                            >
                              {formatTime(message.timestamp)}
                            </div>
                          </div>
                        </div>

                        {/* Message Actions */}
                        {message.role === "assistant" && (
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => copyMessage(message.content)}
                                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                title="Copy message"
                              >
                                <Copy className="h-3 w-3" />
                              </button>
                              <button
                                className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                                title="Good response"
                              >
                                <ThumbsUp className="h-3 w-3" />
                              </button>
                              <button
                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                title="Poor response"
                              >
                                <ThumbsDown className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Typing Indicator */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-gray-100 rounded-2xl px-4 py-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-full">
                          <Bot className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-200 p-3 sm:p-4">
                <div className="flex items-end space-x-2 sm:space-x-3">
                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything about your event plan..."
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent pr-10 sm:pr-12 text-sm sm:text-base"
                      disabled={loading}
                    />
                    {loading && (
                      <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5 absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 animate-spin" />
                    )}
                  </div>
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputMessage.trim() || loading}
                    className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                  >
                    <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 lg:space-y-6 order-1 lg:order-2">
            {/* Quick Prompts */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-4 lg:p-6"
            >
              <div className="flex items-center mb-3 lg:mb-4">
                <Sparkles className="h-4 w-4 lg:h-5 lg:w-5 text-purple-600 mr-2" />
                <h3 className="text-base lg:text-lg font-semibold text-gray-900">
                  Quick Actions
                </h3>
              </div>
              <div className="space-y-2 lg:space-y-3">
                {quickPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickPrompt(prompt.prompt)}
                    disabled={loading}
                    className={`w-full flex items-center p-2.5 lg:p-3 rounded-xl text-xs lg:text-sm font-medium transition-colors disabled:opacity-50 ${prompt.color}`}
                  >
                    <prompt.icon className="h-3 w-3 lg:h-4 lg:w-4 mr-2 lg:mr-3 flex-shrink-0" />
                    <span className="text-left">{prompt.text}</span>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Plan Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Current Plan
              </h3>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 text-gray-400 mr-3" />
                  <span className="text-gray-600">Event:</span>
                  <span className="ml-2 font-medium capitalize">
                    {plan.eventType.replace("_", " ")}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 text-gray-400 mr-3" />
                  <span className="text-gray-600">Location:</span>
                  <span className="ml-2 font-medium">{plan.location}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Users className="h-4 w-4 text-gray-400 mr-3" />
                  <span className="text-gray-600">Guests:</span>
                  <span className="ml-2 font-medium">{plan.guestCount}</span>
                </div>
                <div className="flex items-center text-sm">
                  <DollarSign className="h-4 w-4 text-gray-400 mr-3" />
                  <span className="text-gray-600">Budget:</span>
                  <span className="ml-2 font-medium">
                    ₦{plan.budget.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 text-gray-400 mr-3" />
                  <span className="text-gray-600">Date:</span>
                  <span className="ml-2 font-medium">
                    {new Date(plan.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* AI Capabilities */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center mb-4">
                <Wand2 className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">
                  AI Capabilities
                </h3>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Budget optimization
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Vendor recommendations
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Timeline planning
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Risk assessment
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Creative suggestions
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Sustainability tips
                </div>
              </div>
            </motion.div>

            {/* Tips */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6"
            >
              <div className="flex items-center mb-3">
                <Lightbulb className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Pro Tips
                </h3>
              </div>
              <div className="space-y-2 text-sm text-gray-700">
                <p>• Be specific about your needs and preferences</p>
                <p>• Ask for alternatives and comparisons</p>
                <p>• Request detailed explanations for recommendations</p>
                <p>• Use follow-up questions to refine suggestions</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
