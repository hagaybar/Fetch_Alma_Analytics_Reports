import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import { TaskList, TaskForm, DeleteConfirmModal } from '../components/tasks';
import { RunReportModal } from '../components/reports';
import { useTasks, useJobs } from '../hooks';
import type { Task, TaskCreate, TaskUpdate } from '../types';

export function TasksPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { tasks, loading, fetchTasks, createTask, updateTask, deleteTask } = useTasks();
  const { runReport } = useJobs(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [runningTask, setRunningTask] = useState<Task | null>(null);
  const [testMode, setTestMode] = useState(false);

  const handleCreate = () => {
    setEditingTask(null);
    setFormOpen(true);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: TaskCreate | TaskUpdate) => {
    try {
      if (editingTask) {
        await updateTask(editingTask.name, data as TaskUpdate);
        showToast('Task updated successfully', 'success');
      } else {
        await createTask(data as TaskCreate);
        showToast('Task created successfully', 'success');
      }
      setFormOpen(false);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save task', 'error');
      throw err;
    }
  };

  const handleDelete = async () => {
    if (!deletingTask) return;
    try {
      await deleteTask(deletingTask.name);
      showToast('Task deleted successfully', 'success');
      setDeletingTask(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete task', 'error');
    }
  };

  const handleRun = (task: Task, isTestMode: boolean) => {
    setRunningTask(task);
    setTestMode(isTestMode);
  };

  const handleViewLogs = (task: Task) => {
    navigate(`/logs?task=${encodeURIComponent(task.name)}`);
  };

  return (
    <div>
      <Header
        title="Tasks"
        onRefresh={fetchTasks}
        actions={
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        }
      />

      <div className="p-6">
        <TaskList
          tasks={tasks}
          loading={loading}
          onEdit={handleEdit}
          onDelete={setDeletingTask}
          onRun={handleRun}
          onViewLogs={handleViewLogs}
        />
      </div>

      <TaskForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        task={editingTask}
      />

      <DeleteConfirmModal
        isOpen={!!deletingTask}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleDelete}
        task={deletingTask}
      />

      <RunReportModal
        isOpen={!!runningTask}
        onClose={() => setRunningTask(null)}
        task={runningTask}
        testMode={testMode}
        onRun={runReport}
      />
    </div>
  );
}
