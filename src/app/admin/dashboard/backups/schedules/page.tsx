"use client";

import { useState, useEffect } from "react";
import { BackupSchedule, CreateBackupScheduleRequest } from "@/types/backup";
import backupService from "@/services/admin/backup.service";
import {
  Calendar,
  Plus,
  Loader2,
  Edit2,
  Trash2,
  Play,
  Pause,
  Clock,
} from "lucide-react";
import { toast } from "react-toastify";
import Link from "next/link";

export default function BackupSchedulesPage() {
  const [schedules, setSchedules] = useState<BackupSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<BackupSchedule | null>(
    null
  );
  const [formData, setFormData] = useState<CreateBackupScheduleRequest>({
    name: "",
    description: "",
    frequency: "daily",
    time: "02:00",
    retentionDays: 30,
  });

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await backupService.getBackupSchedules();
      setSchedules(response.schedules);
    } catch (err: any) {
      console.error("Error fetching schedules:", err);
      toast.error("Failed to load backup schedules");

      // Mock data
      setSchedules([
        {
          _id: "1",
          name: "Daily Backup",
          description: "Automated daily backup at 2 AM",
          frequency: "daily",
          time: "02:00",
          retentionDays: 30,
          enabled: true,
          lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000),
          nextRun: new Date(Date.now() + 22 * 60 * 60 * 1000),
          createdBy: "admin@confetti.com",
          createdAt: new Date("2025-01-01"),
          updatedAt: new Date(),
        },
        {
          _id: "2",
          name: "Weekly Full Backup",
          description: "Complete backup every Sunday",
          frequency: "weekly",
          dayOfWeek: 0,
          time: "03:00",
          retentionDays: 90,
          enabled: true,
          lastRun: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          nextRun: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
          createdBy: "admin@confetti.com",
          createdAt: new Date("2025-01-01"),
          updatedAt: new Date(),
        },
        {
          _id: "3",
          name: "Monthly Archive",
          description: "Monthly backup for long-term storage",
          frequency: "monthly",
          dayOfMonth: 1,
          time: "01:00",
          retentionDays: 365,
          enabled: false,
          lastRun: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
          nextRun: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          createdBy: "admin@confetti.com",
          createdAt: new Date("2025-01-01"),
          updatedAt: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSchedule) {
        await backupService.updateBackupSchedule(editingSchedule._id, formData);
        toast.success("Schedule updated successfully");
      } else {
        await backupService.createBackupSchedule(formData);
        toast.success("Schedule created successfully");
      }
      setShowModal(false);
      setEditingSchedule(null);
      resetForm();
      fetchSchedules();
    } catch (err: any) {
      console.error("Error saving schedule:", err);
      toast.error("Failed to save schedule");
    }
  };

  const handleEdit = (schedule: BackupSchedule) => {
    setEditingSchedule(schedule);
    setFormData({
      name: schedule.name,
      description: schedule.description,
      frequency: schedule.frequency,
      time: schedule.time,
      dayOfWeek: schedule.dayOfWeek,
      dayOfMonth: schedule.dayOfMonth,
      retentionDays: schedule.retentionDays,
    });
    setShowModal(true);
  };

  const handleDelete = async (scheduleId: string, scheduleName: string) => {
    if (!confirm(`Delete schedule "${scheduleName}"?`)) return;

    try {
      await backupService.deleteBackupSchedule(scheduleId);
      toast.success("Schedule deleted successfully");
      fetchSchedules();
    } catch (err: any) {
      console.error("Error deleting schedule:", err);
      toast.error("Failed to delete schedule");
    }
  };

  const handleToggle = async (schedule: BackupSchedule) => {
    try {
      await backupService.toggleBackupSchedule(schedule._id, !schedule.enabled);
      toast.success(
        schedule.enabled ? "Schedule disabled" : "Schedule enabled"
      );
      fetchSchedules();
    } catch (err: any) {
      console.error("Error toggling schedule:", err);
      toast.error("Failed to toggle schedule");
    }
  };

  const handleRunNow = async (scheduleId: string, scheduleName: string) => {
    if (!confirm(`Run "${scheduleName}" now?`)) return;

    try {
      await backupService.runScheduleNow(scheduleId);
      toast.success("Backup started");
      fetchSchedules();
    } catch (err: any) {
      console.error("Error running schedule:", err);
      toast.error("Failed to run schedule");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      frequency: "daily",
      time: "02:00",
      retentionDays: 30,
    });
  };

  const getFrequencyLabel = (schedule: BackupSchedule) => {
    switch (schedule.frequency) {
      case "hourly":
        return "Every hour";
      case "daily":
        return `Daily at ${schedule.time}`;
      case "weekly":
        const days = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];
        return `Weekly on ${days[schedule.dayOfWeek || 0]} at ${schedule.time}`;
      case "monthly":
        return `Monthly on day ${schedule.dayOfMonth} at ${schedule.time}`;
      default:
        return schedule.frequency;
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return "Never";
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/dashboard/backups"
            className="text-sm text-purple-600 hover:text-purple-700 mb-2 inline-block"
          >
            ← Back to Backups
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Backup Schedules</h1>
          <p className="text-gray-600 mt-1">
            Manage automated backup schedules
          </p>
        </div>

        <button
          onClick={() => {
            setEditingSchedule(null);
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Plus className="w-5 h-5" />
          Create Schedule
        </button>
      </div>

      {/* Schedules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schedules.map((schedule) => (
          <div
            key={schedule._id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {schedule.name}
                  </h3>
                  {schedule.enabled ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Inactive
                    </span>
                  )}
                </div>
                {schedule.description && (
                  <p className="text-sm text-gray-600">
                    {schedule.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(schedule)}
                  className="text-purple-600 hover:text-purple-900"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(schedule._id, schedule.name)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Frequency:</span>
                <span className="font-medium text-gray-900">
                  {getFrequencyLabel(schedule)}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Retention:</span>
                <span className="font-medium text-gray-900">
                  {schedule.retentionDays} days
                </span>
              </div>

              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Last run: {formatDate(schedule.lastRun)}
                </p>
                <p className="text-xs text-gray-500">
                  Next run: {formatDate(schedule.nextRun)}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
              <button
                onClick={() => handleToggle(schedule)}
                className={`flex-1 px-4 py-2 rounded-lg font-medium ${
                  schedule.enabled
                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    : "bg-purple-600 text-white hover:bg-purple-700"
                }`}
              >
                {schedule.enabled ? (
                  <span className="flex items-center justify-center gap-2">
                    <Pause className="w-4 h-4" />
                    Disable
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Play className="w-4 h-4" />
                    Enable
                  </span>
                )}
              </button>
              {schedule.enabled && (
                <button
                  onClick={() => handleRunNow(schedule._id, schedule.name)}
                  className="px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 font-medium"
                >
                  Run Now
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {editingSchedule ? "Edit Schedule" : "Create Backup Schedule"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Schedule Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frequency
                </label>
                <select
                  value={formData.frequency}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      frequency: e.target.value as any,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              {formData.frequency !== "hourly" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) =>
                      setFormData({ ...formData, time: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              )}

              {formData.frequency === "weekly" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Day of Week
                  </label>
                  <select
                    value={formData.dayOfWeek || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dayOfWeek: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="0">Sunday</option>
                    <option value="1">Monday</option>
                    <option value="2">Tuesday</option>
                    <option value="3">Wednesday</option>
                    <option value="4">Thursday</option>
                    <option value="5">Friday</option>
                    <option value="6">Saturday</option>
                  </select>
                </div>
              )}

              {formData.frequency === "monthly" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Day of Month
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={formData.dayOfMonth || 1}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dayOfMonth: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Retention Period (days)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.retentionDays}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      retentionDays: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Backups older than this will be automatically deleted
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingSchedule(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  {editingSchedule ? "Update Schedule" : "Create Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
