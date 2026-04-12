"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Wand2,
  RefreshCw,
  Heart,
  Gift,
  Users,
  Star,
  Target,
  Zap,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  Palette,
  Music,
  Utensils,
  CheckCircle,
  User,
  Mail,
  Phone,
} from "lucide-react";
import {
  AIEventPlan,
  EventPlanningRequest,
} from "@/services/ai-planner.service";
import aiPlannerService from "@/services/ai-planner.service";
import { LocationData } from "@/services/location.service";
import LocationForm from "@/components/shared/location/LocationForm";

interface AIPlannerFormProps {
  userType: "admin" | "planner" | "vendor";
  existingPlan?: AIEventPlan | null;
  onPlanCreated: (plan: AIEventPlan) => void;
  onPlanUpdated: (plan: AIEventPlan) => void;
  onBack: () => void;
  className?: string;
}

interface FormData {
  eventType: string;
  budget: number;
  guestCount: number;
  date: string;
  location: LocationData;
  duration: number;
  preferences: {
    theme?: string;
    style?: string;
    dietary?: string[];
    accessibility?: string[];
    entertainment?: string[];
    special_requests?: string;
  };
  clientInfo: {
    name: string;
    email: string;
    phone?: string;
  };
}

const eventTypes = [
  { value: "wedding", label: "Wedding", icon: Heart, color: "bg-pink-500" },
  {
    value: "birthday",
    label: "Birthday Party",
    icon: Gift,
    color: "bg-blue-500",
  },
  {
    value: "corporate",
    label: "Corporate Event",
    icon: Users,
    color: "bg-gray-500",
  },
  {
    value: "conference",
    label: "Conference",
    icon: Users,
    color: "bg-indigo-500",
  },
  {
    value: "graduation",
    label: "Graduation",
    icon: Star,
    color: "bg-green-500",
  },
  {
    value: "anniversary",
    label: "Anniversary",
    icon: Heart,
    color: "bg-purple-500",
  },
  {
    value: "baby_shower",
    label: "Baby Shower",
    icon: Gift,
    color: "bg-yellow-500",
  },
  {
    value: "engagement",
    label: "Engagement",
    icon: Heart,
    color: "bg-rose-500",
  },
  {
    value: "fundraiser",
    label: "Fundraiser",
    icon: Target,
    color: "bg-orange-500",
  },
  {
    value: "product_launch",
    label: "Product Launch",
    icon: Zap,
    color: "bg-cyan-500",
  },
];

const themes = [
  "Elegant & Classic",
  "Modern & Minimalist",
  "Rustic & Natural",
  "Vintage & Retro",
  "Bohemian & Artistic",
  "Luxury & Glamorous",
  "Tropical & Exotic",
  "Industrial & Urban",
  "Garden & Outdoor",
  "Cultural & Traditional",
];

const entertainmentOptions = [
  "Live Band",
  "DJ",
  "Acoustic Music",
  "Dancing",
  "Photo Booth",
  "Games & Activities",
  "Keynote Speaker",
  "Workshop",
  "Live Performance",
  "Interactive Entertainment",
];

const dietaryOptions = [
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Halal",
  "Kosher",
  "Dairy-Free",
  "Nut-Free",
  "Keto",
  "Paleo",
  "No Restrictions",
];

const accessibilityOptions = [
  "Wheelchair Accessible",
  "Sign Language Interpreter",
  "Audio Assistance",
  "Large Print Materials",
  "Quiet Space Available",
  "Service Animal Friendly",
  "Accessible Parking",
  "Elevator Access",
];

export default function AIPlannerForm({
  userType,
  existingPlan,
  onPlanCreated,
  onPlanUpdated,
  onBack,
  className = "",
}: AIPlannerFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    eventType: "",
    budget: 0,
    guestCount: 0,
    date: "",
    location: {
      address: "",
      city: "",
      state: "",
      country: "Nigeria",
      coordinates: { lat: 0, lng: 0 },
    },
    duration: 4,
    preferences: {
      theme: "",
      style: "formal",
      dietary: [],
      accessibility: [],
      entertainment: [],
      special_requests: "",
    },
    clientInfo: {
      name: "",
      email: "",
      phone: "",
    },
  });

  useEffect(() => {
    if (existingPlan) {
      // Parse existing location string into LocationData format
      const locationStr = existingPlan.location ?? "";
      const locationParts = locationStr.split(", ");
      const locationData: LocationData = {
        address: locationStr,
        city: locationParts[0] || "",
        state: locationParts[1] || "",
        country: locationParts[2] || "Nigeria",
        coordinates: { lat: 0, lng: 0 }, // Default coordinates
      };

      const dateStr = existingPlan.date ?? new Date().toISOString();

      setFormData({
        eventType: existingPlan.eventType ?? "",
        budget: existingPlan.budget ?? 0,
        guestCount: existingPlan.guestCount ?? 0,
        date: dateStr.split("T")[0],
        location: locationData,
        duration: 4, // Default duration
        preferences: {
          theme: "",
          style: "formal",
          dietary: [],
          accessibility: [],
          entertainment: [],
          special_requests: "",
        },
        clientInfo: {
          name: "",
          email: "",
          phone: "",
        },
      });
    }
  }, [existingPlan]);

  const handleInputChange = (field: string, value: any) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...((prev[parent as keyof FormData] as object) || {}),
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleArrayChange = (
    field: string,
    value: string,
    checked: boolean
  ) => {
    const [parent, child] = field.split(".");
    setFormData((prev) => {
      const currentArray = (prev[parent as keyof FormData] as any)[child] || [];
      const newArray = checked
        ? [...currentArray, value]
        : currentArray.filter((item: string) => item !== value);

      return {
        ...prev,
        [parent]: {
          ...((prev[parent as keyof FormData] as object) || {}),
          [child]: newArray,
        },
      };
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Format location for backend compatibility
      const locationString = [
        formData.location.address,
        formData.location.city,
        formData.location.state,
        formData.location.country,
      ]
        .filter((part) => part && part.trim())
        .join(", ");

      const request: EventPlanningRequest = {
        ...formData,
        location: locationString, // Convert LocationData back to string for backend
        date: new Date(formData.date).toISOString(),
      };

      if (existingPlan) {
        const updatedPlan = await aiPlannerService.updateEventPlan(
          existingPlan.id,
          request
        );
        onPlanUpdated(updatedPlan);
      } else {
        const newPlan = await aiPlannerService.createEventPlan(request);
        onPlanCreated(newPlan);
      }
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Unknown error";
      console.error("Failed to save plan:", error);
      alert(`Failed to save plan: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.eventType &&
          formData.date &&
          formData.location.address &&
          formData.location.city &&
          formData.location.country &&
          formData.guestCount > 0 &&
          formData.budget > 0
        );
      case 2:
        return true; // Preferences are optional
      case 3:
        return true; // Requirements are optional
      case 4:
        return formData.clientInfo.name && formData.clientInfo.email;
      default:
        return false;
    }
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 ${className}`}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Plans
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {existingPlan ? "Edit Event Plan" : "Create New Event Plan"}
          </h1>
          <div></div>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
            <span>Step {currentStep} of 4</span>
            <span>{Math.round((currentStep / 4) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-4">
            <div
              className={`text-xs ${
                currentStep >= 1
                  ? "text-purple-600 font-medium"
                  : "text-gray-400"
              }`}
            >
              Event Basics
            </div>
            <div
              className={`text-xs ${
                currentStep >= 2
                  ? "text-purple-600 font-medium"
                  : "text-gray-400"
              }`}
            >
              Preferences
            </div>
            <div
              className={`text-xs ${
                currentStep >= 3
                  ? "text-purple-600 font-medium"
                  : "text-gray-400"
              }`}
            >
              Requirements
            </div>
            <div
              className={`text-xs ${
                currentStep >= 4
                  ? "text-purple-600 font-medium"
                  : "text-gray-400"
              }`}
            >
              Client Info
            </div>
          </div>
        </motion.div>

        {/* Form Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          <AnimatePresence mode="wait">
            {/* Step 1: Event Basics */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Event Basics
                  </h3>
                  <p className="text-gray-600">
                    Let's start with the fundamental details of your event.
                  </p>
                </div>

                {/* Event Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Event Type *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {eventTypes.map((type) => (
                      <button
                        key={type.value}
                        onClick={() =>
                          handleInputChange("eventType", type.value)
                        }
                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                          formData.eventType === type.value
                            ? "border-purple-500 bg-purple-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div
                          className={`p-2 rounded-lg ${type.color} text-white w-fit mx-auto mb-2`}
                        >
                          <type.icon className="h-5 w-5" />
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {type.label}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date and Duration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Date *
                    </label>
                    <div className="relative">
                      <Calendar className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) =>
                          handleInputChange("date", e.target.value)
                        }
                        className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (hours) *
                    </label>
                    <div className="relative">
                      <Clock className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                      <input
                        type="number"
                        min="1"
                        max="24"
                        value={formData.duration}
                        onChange={(e) =>
                          handleInputChange(
                            "duration",
                            parseInt(e.target.value)
                          )
                        }
                        className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Event Location *
                  </label>
                  <LocationForm
                    value={formData.location}
                    onChange={(location) =>
                      handleInputChange("location", location)
                    }
                    required={true}
                    className="bg-gray-50 rounded-xl p-4 border border-gray-200"
                  />
                </div>

                {/* Guest Count and Budget */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expected Guests *
                    </label>
                    <div className="relative">
                      <Users className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                      <input
                        type="number"
                        min="1"
                        placeholder="e.g., 100"
                        value={formData.guestCount || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "guestCount",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Budget (₦) *
                    </label>
                    <div className="relative">
                      <DollarSign className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                      <input
                        type="number"
                        min="0"
                        placeholder="e.g., 1000000"
                        value={formData.budget || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "budget",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Preferences */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Event Preferences
                  </h3>
                  <p className="text-gray-600">
                    Customize the style and atmosphere of your event.
                  </p>
                </div>

                {/* Theme Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Theme & Style
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {themes.map((theme) => (
                      <button
                        key={theme}
                        onClick={() =>
                          handleInputChange("preferences.theme", theme)
                        }
                        className={`p-3 rounded-xl border-2 text-sm transition-all duration-200 ${
                          formData.preferences.theme === theme
                            ? "border-purple-500 bg-purple-50 text-purple-700"
                            : "border-gray-200 hover:border-gray-300 text-gray-700"
                        }`}
                      >
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Style */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Formality Level
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {["casual", "semi-formal", "formal"].map((style) => (
                      <button
                        key={style}
                        onClick={() =>
                          handleInputChange("preferences.style", style)
                        }
                        className={`p-3 rounded-xl border-2 text-sm capitalize transition-all duration-200 ${
                          formData.preferences.style === style
                            ? "border-purple-500 bg-purple-50 text-purple-700"
                            : "border-gray-200 hover:border-gray-300 text-gray-700"
                        }`}
                      >
                        {style.replace("-", " ")}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Entertainment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Entertainment Options
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {entertainmentOptions.map((option) => (
                      <label
                        key={option}
                        className="flex items-center p-3 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={
                            formData.preferences.entertainment?.includes(
                              option
                            ) || false
                          }
                          onChange={(e) =>
                            handleArrayChange(
                              "preferences.entertainment",
                              option,
                              e.target.checked
                            )
                          }
                          className="mr-3 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Special Requests */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Requests
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Any specific requirements, cultural considerations, or special requests..."
                    value={formData.preferences.special_requests || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "preferences.special_requests",
                        e.target.value
                      )
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </motion.div>
            )}

            {/* Step 3: Requirements */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Special Requirements
                  </h3>
                  <p className="text-gray-600">
                    Ensure your event is inclusive and accommodating for all
                    guests.
                  </p>
                </div>

                {/* Dietary Requirements */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Dietary Requirements
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {dietaryOptions.map((option) => (
                      <label
                        key={option}
                        className="flex items-center p-3 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={
                            formData.preferences.dietary?.includes(option) ||
                            false
                          }
                          onChange={(e) =>
                            handleArrayChange(
                              "preferences.dietary",
                              option,
                              e.target.checked
                            )
                          }
                          className="mr-3 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Accessibility */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Accessibility Requirements
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {accessibilityOptions.map((option) => (
                      <label
                        key={option}
                        className="flex items-center p-3 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={
                            formData.preferences.accessibility?.includes(
                              option
                            ) || false
                          }
                          onChange={(e) =>
                            handleArrayChange(
                              "preferences.accessibility",
                              option,
                              e.target.checked
                            )
                          }
                          className="mr-3 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Client Information */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Client Information
                  </h3>
                  <p className="text-gray-600">
                    Contact details for plan delivery and communication.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Client Name *
                    </label>
                    <div className="relative">
                      <User className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Full name"
                        value={formData.clientInfo.name}
                        onChange={(e) =>
                          handleInputChange("clientInfo.name", e.target.value)
                        }
                        className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                      <input
                        type="email"
                        placeholder="client@example.com"
                        value={formData.clientInfo.email}
                        onChange={(e) =>
                          handleInputChange("clientInfo.email", e.target.value)
                        }
                        className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="tel"
                      placeholder="+234 xxx xxx xxxx"
                      value={formData.clientInfo.phone || ""}
                      onChange={(e) =>
                        handleInputChange("clientInfo.phone", e.target.value)
                      }
                      className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">
                    Plan Summary
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Event Type:</span>
                      <div className="font-medium capitalize">
                        {formData.eventType.replace("_", " ")}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Date:</span>
                      <div className="font-medium">{formData.date}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Guests:</span>
                      <div className="font-medium">{formData.guestCount}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Budget:</span>
                      <div className="font-medium">
                        ₦{formData.budget.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Location:</span>
                      <div className="font-medium">
                        {[
                          formData.location.address,
                          formData.location.city,
                          formData.location.state,
                          formData.location.country,
                        ]
                          .filter((part) => part && part.trim())
                          .join(", ") || "Not specified"}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Duration:</span>
                      <div className="font-medium">
                        {formData.duration} hours
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-8 border-t border-gray-200 mt-8">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </button>

            {currentStep < 4 ? (
              <button
                onClick={nextStep}
                disabled={!isStepValid()}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!isStepValid() || loading}
                className="flex items-center px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    {existingPlan ? "Updating..." : "Generating..."}
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    {existingPlan ? "Update Plan" : "Generate AI Plan"}
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
