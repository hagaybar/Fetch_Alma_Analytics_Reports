import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import type { Task, TaskCreate, TaskUpdate } from '../../types';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: TaskCreate | TaskUpdate) => Promise<void>;
  onDelete?: (task: Task) => void;
  task?: Task | null;
}

const formatOptions = [
  { value: 'xlsx', label: 'Excel (xlsx)' },
  { value: 'csv', label: 'CSV (csv)' },
  { value: 'tsv', label: 'TSV (tsv)' },
];

const frequencyOptions = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
];

const defaultValues: TaskCreate = {
  name: '',
  alma_report_path: '',
  output_path: '',
  output_file_name: '',
  output_format: 'xlsx',
  log_dir: '',
  test_output_path: '',
  test_log_dir: '',
  test_row_limit: 25,
  frequency: 'daily',
};

export function TaskForm({ isOpen, onClose, onSubmit, onDelete, task }: TaskFormProps) {
  const [formData, setFormData] = useState<TaskCreate>(defaultValues);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!task;

  useEffect(() => {
    if (task) {
      setFormData({
        name: task.name,
        alma_report_path: task.alma_report_path,
        output_path: task.output_path,
        output_file_name: task.output_file_name,
        output_format: task.output_format,
        log_dir: task.log_dir,
        test_output_path: task.test_output_path || '',
        test_log_dir: task.test_log_dir || '',
        test_row_limit: task.test_row_limit,
        frequency: task.frequency || 'daily',
      });
    } else {
      setFormData(defaultValues);
    }
    setErrors({});
  }, [task, isOpen]);

  const handleChange = (field: keyof TaskCreate, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.alma_report_path.trim()) newErrors.alma_report_path = 'Report path is required';
    if (!formData.output_path.trim()) newErrors.output_path = 'Output path is required';
    if (!formData.output_file_name.trim()) newErrors.output_file_name = 'Output file name is required';
    if (!formData.log_dir.trim()) newErrors.log_dir = 'Log directory is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      if (isEditing) {
        const { name, ...updateData } = formData;
        await onSubmit(updateData);
      } else {
        await onSubmit(formData);
      }
      onClose();
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : 'Failed to save task' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (task && onDelete) {
      onDelete(task);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Task: ${task.name}` : 'Create New Task'}
      subtitle="Update your report configuration and test settings"
      footer={
        <div className="w-full flex items-center justify-between">
          {/* Delete link on the left */}
          {isEditing && onDelete ? (
            <button
              type="button"
              onClick={handleDelete}
              className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Delete Task
            </button>
          ) : (
            <div />
          )}
          {/* Cancel and Save buttons on the right */}
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Task'}
            </Button>
          </div>
        </div>
      }
    >
      <form className="space-y-8">
        {errors.submit && (
          <p className="text-sm text-red-500">{errors.submit}</p>
        )}

        {/* BASIC INFO Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-primary flex items-center justify-center">
              <span className="material-icons-round text-sm">info</span>
            </span>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Basic Info
            </h3>
          </div>
          <div className="space-y-4">
            <Input
              label="Task Name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              error={errors.name}
              disabled={isEditing}
              placeholder="e.g., aas_loans"
            />
            <div>
              <Input
                label="Alma Report Path"
                value={formData.alma_report_path}
                onChange={(e) => handleChange('alma_report_path', e.target.value)}
                error={errors.alma_report_path}
                placeholder="/shared/Tel Aviv University/Reports/..."
                className="font-mono text-sm"
              />
              <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
                The internal path within the Alma Analytics repository.
              </p>
            </div>
          </div>
        </section>

        <hr className="border-gray-100 dark:border-gray-700" />

        {/* OUTPUT SETTINGS Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center">
              <span className="material-icons-round text-sm">file_download</span>
            </span>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Output Settings
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Output Path"
                value={formData.output_path}
                onChange={(e) => handleChange('output_path', e.target.value)}
                error={errors.output_path}
                placeholder="D:\Tel-Aviv University\masedet - Documents\Data\Alma\..."
              />
            </div>
            <Input
              label="Output File Name"
              value={formData.output_file_name}
              onChange={(e) => handleChange('output_file_name', e.target.value)}
              error={errors.output_file_name}
              placeholder="report.xlsx"
            />
            <Select
              label="Frequency"
              value={formData.frequency || 'daily'}
              onChange={(e) => handleChange('frequency', e.target.value)}
              options={frequencyOptions}
            />
            <Select
              label="Output Format"
              value={formData.output_format}
              onChange={(e) => handleChange('output_format', e.target.value)}
              options={formatOptions}
            />
            <Input
              label="Log Directory"
              value={formData.log_dir}
              onChange={(e) => handleChange('log_dir', e.target.value)}
              error={errors.log_dir}
              placeholder="D:\Tel-Aviv University\masedet - Logs"
            />
          </div>
        </section>

        <hr className="border-gray-100 dark:border-gray-700" />

        {/* TESTING & DEBUGGING Section */}
        <section className="bg-blue-50/50 dark:bg-blue-900/10 p-5 rounded-xl border border-blue-100 dark:border-blue-900/50">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center">
              <span className="material-icons-round text-sm">science</span>
            </span>
            <h3 className="text-sm font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
              Testing &amp; Debugging
            </h3>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Test Output Path"
                value={formData.test_output_path || ''}
                onChange={(e) => handleChange('test_output_path', e.target.value)}
                placeholder="D:\Tel-Aviv University\masedet - Test\..."
                className="bg-white dark:bg-gray-900 shadow-sm"
              />
              <Input
                label="Test Log Directory"
                value={formData.test_log_dir || ''}
                onChange={(e) => handleChange('test_log_dir', e.target.value)}
                placeholder="D:\Tel-Aviv University\masedet - Test\Logs"
                className="bg-white dark:bg-gray-900 shadow-sm"
              />
            </div>
            <div>
              <Input
                label="Test Row Limit"
                type="number"
                value={formData.test_row_limit}
                onChange={(e) => handleChange('test_row_limit', parseInt(e.target.value) || 25)}
                min={1}
                className="w-32 bg-white dark:bg-gray-900 shadow-sm"
              />
              <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
                Maximum rows retrieved during test runs
              </p>
            </div>
          </div>
        </section>
      </form>
    </Modal>
  );
}
