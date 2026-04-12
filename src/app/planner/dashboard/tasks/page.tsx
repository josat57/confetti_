"use client";

import { useState, useEffect } from "react";
import { Plus, Filter, LayoutGrid, List, Loader2 } from "lucide-react";
import TaskCard from "@/components/planner/tasks/TaskCard";
import TaskForm from "@/components/planner/tasks/TaskForm";
import { tasksService } from "@/services/planner/tasks.service";
import {
  Task,
  CreateTaskInput,
  TaskStatus,
  TaskPriority,
} from "@/types/planner";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState({
    event: "",
    status: "" as TaskStatus | "",
    priority: "" as TaskPriority | "",
  });

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await tasksService.getTasks({
        event: filters.event || undefined,
        status: filters.status || undefined,
        priority: filters.priority || undefined,
      });
      setTasks(response.tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (data: CreateTaskInput) => {
    try {
      await tasksService.createTask(data);
      setShowTaskForm(false);
      fetchTasks();
    } catch (error) {
      console.error("Error creating task:", error);
      alert("Failed to create task");
    }
  };

  const handleUpdateTask = async (data: CreateTaskInput) => {
    if (!selectedTask) return;

    try {
      await tasksService.updateTask(selectedTask._id, data);
      setSelectedTask(null);
      setShowTaskForm(false);
      fetchTasks();
    } catch (error) {
      console.error("Error updating task:", error);
      alert("Failed to update task");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      await tasksService.deleteTask(taskId);
      fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Failed to delete task");
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      await tasksService.completeTask(taskId);
      fetchTasks();
    } catch (error) {
      console.error("Error completing task:", error);
      alert("Failed to complete task");
    }
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setShowTaskForm(true);
  };

  const handleFormCancel = () => {
    setShowTaskForm(false);
    setSelectedTask(null);
  };

  // Calculate completion percentage
  const completedTasks =
    tasks && Array.isArray(tasks)
      ? tasks.filter((t) => t.status === "Completed").length
      : 0;
  const completionPercentage =
    tasks && tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
            <p className="text-gray-600 mt-1">
              Manage and track your event planning tasks
            </p>
          </div>
          <button
            onClick={() => setShowTaskForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Task
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Overall Progress
          </span>
          <span className="text-sm font-medium text-gray-900">
            {completedTasks} of {tasks ? tasks.length : 0} completed (
            {completionPercentage.toFixed(0)}%)
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-teal-600 h-3 rounded-full transition-all"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Filters and View Toggle */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value as any })
                }
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <select
              value={filters.priority}
              onChange={(e) =>
                setFilters({ ...filters, priority: e.target.value as any })
              }
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>

            {(filters.status || filters.priority) && (
              <button
                onClick={() =>
                  setFilters({ event: "", status: "", priority: "" })
                }
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900"
              >
                Clear Filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === "grid"
                  ? "bg-teal-100 text-teal-600"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === "list"
                  ? "bg-teal-100 text-teal-600"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Tasks Grid/List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
        </div>
      ) : !tasks || tasks.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-teal-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No tasks yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first task to start organizing your event planning
            </p>
            <button
              onClick={() => setShowTaskForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Task
            </button>
          </div>
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }
        >
          {tasks &&
            tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
                onComplete={handleCompleteTask}
              />
            ))}
        </div>
      )}

      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskForm
          initialData={selectedTask || undefined}
          onSubmit={selectedTask ? handleUpdateTask : handleCreateTask}
          onCancel={handleFormCancel}
          isEdit={!!selectedTask}
        />
      )}
    </div>
  );
}
