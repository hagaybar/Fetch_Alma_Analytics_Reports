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
  task?: Task | null;
}

const formatOptions = [
  { value: 'xlsx', label: 'Excel (xlsx)' },
  { value: 'csv', label: 'CSV' },
  { value: 'tsv', label: 'TSV' },
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
};

export function TaskForm({ isOpen, onClose, onSubmit, task }: TaskFormProps) {
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Task: ${task.name}` : 'Create New Task'}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {errors.submit && (
          <p className="text-sm text-[hsl(var(--destructive))]">{errors.submit}</p>
        )}

        <Input
          label="Task Name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          error={errors.name}
          disabled={isEditing}
          placeholder="e.g., aas_loans"
        />

        <Input
          label="Alma Report Path"
          value={formData.alma_report_path}
          onChange={(e) => handleChange('alma_report_path', e.target.value)}
          error={errors.alma_report_path}
          placeholder="URL-encoded path to the report"
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Output Path"
            value={formData.output_path}
            onChange={(e) => handleChange('output_path', e.target.value)}
            error={errors.output_path}
            placeholder="/path/to/output"
          />
          <Input
            label="Output File Name"
            value={formData.output_file_name}
            onChange={(e) => handleChange('output_file_name', e.target.value)}
            error={errors.output_file_name}
            placeholder="report.xlsx"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
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
            placeholder="/path/to/logs"
          />
        </div>

        <div className="border-t border-[hsl(var(--border))] pt-4">
          <h4 className="mb-3 text-sm font-medium">Test Mode Settings</h4>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Test Output Path"
              value={formData.test_output_path || ''}
              onChange={(e) => handleChange('test_output_path', e.target.value)}
              placeholder="Optional"
            />
            <Input
              label="Test Log Directory"
              value={formData.test_log_dir || ''}
              onChange={(e) => handleChange('test_log_dir', e.target.value)}
              placeholder="Optional"
            />
          </div>
          <div className="mt-4">
            <Input
              label="Test Row Limit"
              type="number"
              value={formData.test_row_limit}
              onChange={(e) => handleChange('test_row_limit', parseInt(e.target.value) || 25)}
              min={1}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
