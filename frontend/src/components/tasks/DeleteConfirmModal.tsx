import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import type { Task } from '../../types';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  task: Task | null;
}

export function DeleteConfirmModal({ isOpen, onClose, onConfirm, task }: DeleteConfirmModalProps) {
  if (!task) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Task"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </>
      }
    >
      <p>
        Are you sure you want to delete the task <strong>{task.name}</strong>?
      </p>
      <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
        This action cannot be undone. The task configuration will be permanently removed.
      </p>
    </Modal>
  );
}
