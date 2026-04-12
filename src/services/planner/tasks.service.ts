import api from "@/api/api";
import {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilters,
  PaginatedTasks,
} from "@/types/planner";

class TasksService {
  private baseUrl = "/planner/tasks";

  /**
   * Get all tasks with filters
   */
  async getTasks(filters?: TaskFilters): Promise<PaginatedTasks> {
    const params = new URLSearchParams();
    if (filters?.event) params.append("eventId", filters.event);
    if (filters?.assignee) params.append("assignedTo", filters.assignee);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.priority) params.append("priority", filters.priority);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());

    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;

    const response = await api.get(url);
    return response.data;
  }

  /**
   * Get single task
   */
  async getTask(taskId: string): Promise<{ task: Task }> {
    const response = await api.get(`${this.baseUrl}/${taskId}`);
    return response.data;
  }

  /**
   * Create task
   */
  async createTask(data: CreateTaskInput): Promise<{ task: Task }> {
    const response = await api.post(this.baseUrl, data);
    return response.data;
  }

  /**
   * Update task
   */
  async updateTask(
    taskId: string,
    data: UpdateTaskInput
  ): Promise<{ task: Task }> {
    const response = await api.put(`${this.baseUrl}/${taskId}`, data);
    return response.data;
  }

  /**
   * Delete task
   */
  async deleteTask(taskId: string): Promise<{ success: boolean }> {
    const response = await api.delete(`${this.baseUrl}/${taskId}`);
    return response.data;
  }

  /**
   * Mark task as complete
   */
  async completeTask(taskId: string): Promise<{ task: Task }> {
    const response = await api.patch(`${this.baseUrl}/${taskId}/complete`);
    return response.data;
  }

  /**
   * Add comment to task
   */
  async addComment(taskId: string, content: string): Promise<{ comment: any }> {
    const response = await api.post(`${this.baseUrl}/${taskId}/comments`, {
      content,
    });
    return response.data;
  }

  /**
   * Get upcoming tasks
   */
  async getUpcomingTasks(): Promise<{ tasks: Task[] }> {
    const response = await api.get(`${this.baseUrl}/upcoming`);
    return response.data;
  }

  /**
   * Get overdue tasks
   */
  async getOverdueTasks(): Promise<{ tasks: Task[] }> {
    const response = await api.get(`${this.baseUrl}/overdue`);
    return response.data;
  }

  /**
   * Bulk operations on tasks
   */
  async bulkAction(
    taskIds: string[],
    action: "complete" | "delete" | "updatePriority" | "updateDueDate",
    data?: any
  ): Promise<boolean> {
    try {
      await api.post("/planner/tasks/bulk-action", {
        taskIds,
        action,
        data,
      });
      return true;
    } catch (error) {
      console.error("Failed to perform bulk action on tasks:", error);
      throw error;
    }
  }
}

export const tasksService = new TasksService();
