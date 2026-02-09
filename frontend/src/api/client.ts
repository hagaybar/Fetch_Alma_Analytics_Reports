import axios from 'axios';
import type { Task, TaskCreate, TaskUpdate, Job, LogFile, LogContent } from '../types';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const tasksApi = {
  list: () => api.get<Task[]>('/tasks').then((r) => r.data),
  get: (name: string) => api.get<Task>(`/tasks/${name}`).then((r) => r.data),
  create: (task: TaskCreate) => api.post<Task>('/tasks', task).then((r) => r.data),
  update: (name: string, task: TaskUpdate) =>
    api.put<Task>(`/tasks/${name}`, task).then((r) => r.data),
  delete: (name: string) => api.delete(`/tasks/${name}`),
};

export const reportsApi = {
  run: (taskName: string, testMode: boolean) =>
    api.post<Job>('/reports/run', { task_name: taskName, test_mode: testMode }).then((r) => r.data),
  listJobs: (limit = 50) => api.get<Job[]>(`/reports/jobs?limit=${limit}`).then((r) => r.data),
  getJob: (jobId: string) => api.get<Job>(`/reports/jobs/${jobId}`).then((r) => r.data),
  cancelJob: (jobId: string) => api.post(`/reports/jobs/${jobId}/cancel`),
};

export const logsApi = {
  listFiles: (taskName: string, testMode = false) =>
    api.get<LogFile[]>(`/logs/${taskName}?test_mode=${testMode}`).then((r) => r.data),
  readFile: (taskName: string, filename: string, testMode = false, tail = 500) =>
    api
      .get<LogContent>(`/logs/${taskName}/${filename}?test_mode=${testMode}&tail=${tail}`)
      .then((r) => r.data),
};

export default api;
