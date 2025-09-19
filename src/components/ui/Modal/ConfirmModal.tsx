import React from 'react';
import Modal from './Modal';
import Button from '../Button';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info'
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const getButtonVariant = () => {
    switch (variant) {
      case 'danger':
        return 'secondary';
      case 'warning':
        return 'primary';
      default:
        return 'primary';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        <p className="text-[var(--color-text-body)]">{message}</p>
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            {cancelText}
          </Button>
          <Button variant={getButtonVariant()} onClick={handleConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;