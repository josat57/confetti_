"use client";

import { useState } from "react";
import { Plus, Filter, LayoutGrid, List, Loader2 } from "lucide-react";
import TaskCard from "@/components/planner/tasks/TaskCard";
import TaskForm from "@/components/planner/tasks/TaskForm";
import { CreateTaskInput, TaskStatus, TaskPriority } from "@/types/planner";
import {
  usePlannerTasks,
  useCreatePlannerTask,
  useUpdatePlannerTask,
  useDeletePlannerTask,
  useCompletePlannerTask,
  TaskFilters,
} from "@/hooks/usePlannerTasks";
import { toast } from "react-toastify";

export default function TasksPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [filters, setFilters] = useState<TaskFilters>({
    event: "",
    status: "",
    priority: "",
  });

  const { data, isLoading } = usePlannerTasks(filters);
  const createTask = useCreatePlannerTask();
  const updateTask = useUpdatePlannerTask();
  const deleteTask = useDeletePlannerTask();
  const completeTask = useCompletePlannerTask();

  const tasks = data?.tasks || [];
  const completedCount = tasks.filter((t: any) => t.status === "Completed").length;
  const completionPct = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  const handleSubmit = async (formData: CreateTaskInput) => {
    try {
      if (selectedTask) {
        await updateTask.mutateAsync({ id: selectedTask._id, data: formData });
        toast.success("Task updated");
      } else {
        await createTask.mutateAsync(formData);
        toast.success("Task created");
      }
      setShowTaskForm(false);
      setSelectedTask(null);
    } catch {
      toast.error("Failed to save task");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await deleteTask.mutateAsync(id);
      toast.success("Task deleted");
    } catch {
      toast.error("Failed to delete task");
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await completeTask.mutateAsync(id);
    } catch {
      toast.error("Failed to complete task");
    }
  };

  const selectCls = "px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-teal-500 focus:outline-none";
  const viewBtnCls = (active: boolean) =>
    `p-2 rounded-lg transition-colors ${active ? "bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"}`;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Tasks</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and track your event planning tasks
          </p>
        </div>
        <button
          onClick={() => { setSelectedTask(null); setShowTaskForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors text-sm font-medium"
        >
          <Plus className="w-5 h-5" />
          Add Task
        </button>
      </div>

      {/* Progress Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Progress</span>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {completedCount} of {tasks.length} completed ({completionPct.toFixed(0)}%)
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className="bg-teal-600 h-3 rounded-full transition-all"
            style={{ width: `${completionPct}%` }}
          />
        </div>
      </div>

      {/* Filters + View Toggle */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as TaskStatus | "" })}
                className={selectCls}
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
              onChange={(e) => setFilters({ ...filters, priority: e.target.value as TaskPriority | "" })}
              className={selectCls}
            >
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
            {(filters.status || filters.priority) && (
              <button
                onClick={() => setFilters({ event: "", status: "", priority: "" })}
                className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                Clear Filters
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setViewMode("grid")} className={viewBtnCls(viewMode === "grid")}>
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button onClick={() => setViewMode("list")} className={viewBtnCls(viewMode === "list")}>
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Tasks */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-teal-600 dark:text-teal-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No tasks yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first task to start organizing your event planning
            </p>
            <button
              onClick={() => { setSelectedTask(null); setShowTaskForm(true); }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              <Plus className="w-5 h-5" />
              Create Task
            </button>
          </div>
        </div>
      ) : (
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {tasks.map((task: any) => (
            <TaskCard
              key={task._id}
              task={task}
              onEdit={(t) => { setSelectedTask(t); setShowTaskForm(true); }}
              onDelete={handleDelete}
              onComplete={handleComplete}
            />
          ))}
        </div>
      )}

      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskForm
          initialData={selectedTask || undefined}
          onSubmit={handleSubmit}
          onCancel={() => { setShowTaskForm(false); setSelectedTask(null); }}
          isEdit={!!selectedTask}
        />
      )}
    </div>
  );
}
