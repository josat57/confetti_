"use client";

import { useEffect, useState } from "react";
import { Calendar, MapPin, Clock } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { bookingsService } from "@/services/bookings.service";

interface Booking {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  status: "confirmed" | "pending" | "completed";
}

export default function UpcomingBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await bookingsService.getUpcoming(5);
        setBookings(
          data.map((b) => ({
            id: b._id,
            title: `${b.event.type} — ${b.client.name}`,
            date: new Date(b.event.date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            }),
            time: new Date(b.event.date).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            }),
            location: b.event.location,
            status: (
              b.status === "in_progress"
                ? "confirmed"
                : b.status === "cancelled" || b.status === "refunded"
                ? "completed"
                : b.status
            ) as Booking["status"],
          }))
        );
      } catch (error) {
        console.error("Failed to fetch upcoming bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const statusColors = {
    confirmed: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    completed: "bg-gray-100 text-gray-800",
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Upcoming Bookings
        </h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-4 border border-gray-200 rounded-lg animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Upcoming Bookings
        </h2>
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No upcoming bookings</p>
          <Link
            href="/vendor/dashboard/calendar"
            className="inline-block mt-4 text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            View Calendar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Upcoming Bookings
      </h2>
      <div className="space-y-4">
        {bookings.map((booking, index) => (
          <motion.div
            key={booking.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-medium text-gray-900">{booking.title}</h3>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  statusColors[booking.status]
                }`}
              >
                {booking.status}
              </span>
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{booking.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{booking.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{booking.location}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <Link
        href="/vendor/dashboard/bookings"
        className="block w-full mt-4 text-center text-sm text-purple-600 hover:text-purple-700 font-medium"
      >
        View all bookings
      </Link>
    </div>
  );
}
