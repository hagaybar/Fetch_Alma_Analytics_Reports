import { useState, useEffect, useCallback } from 'react';
import { tasksApi } from '../api/client';
import type { Task, TaskCreate, TaskUpdate } from '../types';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tasksApi.list();
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = async (task: TaskCreate) => {
    const created = await tasksApi.create(task);
    setTasks((prev) => [...prev, created]);
    return created;
  };

  const updateTask = async (name: string, task: TaskUpdate) => {
    const updated = await tasksApi.update(name, task);
    setTasks((prev) => prev.map((t) => (t.name === name ? updated : t)));
    return updated;
  };

  const deleteTask = async (name: string) => {
    await tasksApi.delete(name);
    setTasks((prev) => prev.filter((t) => t.name !== name));
  };

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  };
}
