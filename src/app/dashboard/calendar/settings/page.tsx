"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useVendorProfile } from "@/hooks/useVendorProfile";
import { useUpdateBusinessHours } from "@/hooks/useCalendar";
import type { BusinessHours } from "@/types/calendar.types";

export default function CalendarSettingsPage() {
  const router = useRouter();
  const { data: vendor, isLoading } = useVendorProfile();
  const updateHours = useUpdateBusinessHours();

  const [businessHours, setBusinessHours] = useState<BusinessHours[]>([
    { day: "Monday", open: "09:00", close: "17:00", closed: false },
    { day: "Tuesday", open: "09:00", close: "17:00", closed: false },
    { day: "Wednesday", open: "09:00", close: "17:00", closed: false },
    { day: "Thursday", open: "09:00", close: "17:00", closed: false },
    { day: "Friday", open: "09:00", close: "17:00", closed: false },
    { day: "Saturday", open: "10:00", close: "16:00", closed: false },
    { day: "Sunday", open: "10:00", close: "16:00", closed: true },
  ]);

  useEffect(() => {
    if (vendor?.businessHours) {
      setBusinessHours(vendor.businessHours);
    }
  }, [vendor]);

  const handleHoursChange = (
    index: number,
    field: keyof BusinessHours,
    value: string | boolean
  ) => {
    setBusinessHours((prev) => {
      const newHours = [...prev];
      newHours[index] = {
        ...newHours[index],
        [field]: value,
      };
      return newHours;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateHours.mutateAsync(businessHours);
      router.push("/dashboard/calendar");
    } catch (error) {
      // Error handled by hook
    }
  };

  const copyToAll = (sourceIndex: number) => {
    const sourceHours = businessHours[sourceIndex];
    setBusinessHours((prev) =>
      prev.map((hours) => ({
        ...hours,
        open: sourceHours.open,
        close: sourceHours.close,
        closed: sourceHours.closed,
      }))
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:underline mb-4"
        >
          ← Back to Calendar
        </button>
        <h1 className="text-3xl font-bold">Calendar Settings</h1>
        <p className="text-gray-600 mt-2">
          Set your business hours and availability preferences
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Hours */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Business Hours</h2>
          <p className="text-sm text-gray-600 mb-4">
            Set your working hours for each day of the week
          </p>

          <div className="space-y-4">
            {businessHours.map((hours, index) => (
              <div
                key={hours.day}
                className="flex items-center gap-4 p-4 border rounded"
              >
                <div className="w-32">
                  <span className="font-semibold">{hours.day}</span>
                </div>

                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="checkbox"
                    checked={!hours.closed}
                    onChange={(e) =>
                      handleHoursChange(index, "closed", !e.target.checked)
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Open</span>
                </div>

                {!hours.closed && (
                  <>
                    <div className="flex items-center gap-2">
                      <label className="text-sm">From:</label>
                      <input
                        type="time"
                        value={hours.open}
                        onChange={(e) =>
                          handleHoursChange(index, "open", e.target.value)
                        }
                        className="px-3 py-2 border rounded"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-sm">To:</label>
                      <input
                        type="time"
                        value={hours.close}
                        onChange={(e) =>
                          handleHoursChange(index, "close", e.target.value)
                        }
                        className="px-3 py-2 border rounded"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => copyToAll(index)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Copy to all
                    </button>
                  </>
                )}

                {hours.closed && (
                  <span className="text-sm text-gray-500 flex-1">Closed</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => {
                setBusinessHours((prev) =>
                  prev.map((hours) => ({
                    ...hours,
                    open: "09:00",
                    close: "17:00",
                    closed: hours.day === "Sunday",
                  }))
                );
              }}
              className="w-full px-4 py-2 border rounded hover:bg-gray-50 text-left"
            >
              Set Standard Hours (9 AM - 5 PM, Mon-Sat)
            </button>

            <button
              type="button"
              onClick={() => {
                setBusinessHours((prev) =>
                  prev.map((hours) => ({
                    ...hours,
                    open: "10:00",
                    close: "18:00",
                    closed: false,
                  }))
                );
              }}
              className="w-full px-4 py-2 border rounded hover:bg-gray-50 text-left"
            >
              Set Extended Hours (10 AM - 6 PM, Every Day)
            </button>

            <button
              type="button"
              onClick={() => {
                setBusinessHours((prev) =>
                  prev.map((hours) => ({
                    ...hours,
                    closed: hours.day === "Saturday" || hours.day === "Sunday",
                  }))
                );
              }}
              className="w-full px-4 py-2 border rounded hover:bg-gray-50 text-left"
            >
              Close Weekends
            </button>
          </div>
        </div>

        {/* Availability Preferences */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            Availability Preferences
          </h2>
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4" />
                <span>Allow bookings on holidays</span>
              </label>
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4" />
                <span>Require advance booking (minimum 24 hours)</span>
              </label>
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4" />
                <span>Allow same-day bookings</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Maximum advance booking (days)
              </label>
              <input
                type="number"
                min="1"
                max="365"
                defaultValue="90"
                className="w-full px-3 py-2 border rounded"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={updateHours.isPending}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {updateHours.isPending ? "Saving..." : "Save Settings"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border rounded hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
