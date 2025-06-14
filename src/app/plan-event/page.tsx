"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Calendar, Users, DollarSign, Building2, Type, FileText, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MapModal from "@/components/MapModal";

export default function PlanEventPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    eventType: "",
    guestCount: "",
    location: "",
    date: "",
    venue: "",
    budget: "",
    description: ""
  });
  const [showMapModal, setShowMapModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const eventTypes = [
    "Wedding",
    "Corporate Event",
    "Birthday Party",
    "Graduation",
    "Conference",
    "Other"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(formData);
    setIsSubmitting(false);
  };

  const handleLocationSelect = (location: string) => {
    setFormData(prevData => ({ ...prevData, location }));
    setShowMapModal(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-b from-white to-purple-50"
    >
      {/* Back Button */}
      <motion.button
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        onClick={() => router.push("/")}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Home</span>
      </motion.button>

      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Plan Your Perfect Event
          </h1>
          <p className="text-lg text-gray-600">
            Tell us about your event and we'll help you plan it perfectly
          </p>
        </motion.div>

        <div className="flex gap-8">
          {/* Sticky Form */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="w-full max-w-xl"
          >

            <form className="sticky top-24 space-y-8 bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center text-gray-500 border-bottom border-gray-500">
                <p>Fill out the form to see your event plan</p>
              </div>
              {/* Event Type */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
                <label className="flex items-center text-gray-700 font-medium">
                  <Type className="w-5 h-5 mr-2" />
                  Event Type
                </label>
                <select
                  value={formData.eventType}
                  onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="">Select event type</option>
                  {eventTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </motion.div>

              {/* Guest Count */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="space-y-2"
              >
                <label className="flex items-center text-gray-700 font-medium">
                  <Users className="w-5 h-5 mr-2" />
                  Number of Guests
                </label>
                <input
                  type="number"
                  value={formData.guestCount}
                  onChange={(e) => setFormData({ ...formData, guestCount: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter number of guests"
                  min="1"
                  required
                />
              </motion.div>

              {/* Location */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="space-y-2"
              >
                <label className="flex items-center text-gray-700 font-medium">
                  <MapPin className="w-5 h-5 mr-2" />
                  Event Location
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter event location"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowMapModal(true)}
                    className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Select on Map
                  </button>
                </div>
              </motion.div>

              {/* Date */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="space-y-2"
              >
                <label className="flex items-center text-gray-700 font-medium">
                  <Calendar className="w-5 h-5 mr-2" />
                  Event Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </motion.div>

              {/* Venue */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="space-y-2"
              >
                <label className="flex items-center text-gray-700 font-medium">
                  <Building2 className="w-5 h-5 mr-2" />
                  Venue (Optional)
                </label>
                <input
                  type="text"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter venue name"
                />
              </motion.div>

              {/* Budget */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="space-y-2"
              >
                <label className="flex items-center text-gray-700 font-medium">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Budget
                </label>
                <input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your budget"
                  min="0"
                  required
                />
              </motion.div>

              {/* Description */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1 }}
                className="space-y-2"
              >
                <label className="flex items-center text-gray-700 font-medium">
                  <FileText className="w-5 h-5 mr-2" />
                  Event Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[120px]"
                  placeholder="Describe your event vision and requirements..."
                  required
                />
              </motion.div>

              {/* Submit Button */}
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.1 }}
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-purple-600 text-white py-4 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Generating Plan..." : "Get Event Plan"}
              </motion.button>
            </form>
          </motion.div>

          {/* Results Section */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex-1 bg-white rounded-2xl shadow-xl p-8"
          >
            <div className="text-center text-gray-500">
              A detailed well planned event experience based on your preferences and budget
            </div>
          </motion.div>
        </div>
      </div>

      {/* Map Modal */}
      <AnimatePresence>
        {showMapModal && (
          <MapModal
            isOpen={showMapModal}
            onClose={() => setShowMapModal(false)}
            onLocationSelect={handleLocationSelect}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
} 