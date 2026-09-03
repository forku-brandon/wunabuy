import { apiRequest } from './apiClient';

export interface AssignedStaffTask {
  id: string;
  assigned_to_id: string;
  assigned_to_name: string;
  assigned_to_role: string;
  assigned_by_name: string;
  task_title: string;
  task_description: string;
  recurrence: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  due_date: string;
  status: 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED';
  created_at: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  accepted_at?: string;
  completed_at?: string;
}

export const tasksApi = {
  /**
   * Fetch dispatched work directive tasks.
   * API Endpoint: GET /api/v1/staff/tasks
   */
  getDispatchedTasks: async () => {
    return apiRequest<AssignedStaffTask[]>('/staff/tasks', {
      method: 'GET',
    });
  },

  /**
   * Create and assign a new work directive task.
   * API Endpoint: POST /api/v1/staff/tasks
   */
  createTaskDirective: async (payload: Omit<AssignedStaffTask, 'id' | 'created_at' | 'status'>) => {
    return apiRequest<AssignedStaffTask>('/staff/tasks', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Update task status (e.g. Accept or Mark Completed).
   * API Endpoint: PATCH /api/v1/staff/tasks/{id}/status
   */
  updateTaskStatus: async (id: string, status: 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED') => {
    return apiRequest<AssignedStaffTask>(`/staff/tasks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};
