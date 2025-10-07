import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import Button from '../Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showFooter?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className = '',
  showFooter = false
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      const focusableElements = document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement.focus();
              e.preventDefault();
            }
          }
        }
      };

      document.addEventListener('keydown', handleTabKey);
      if (firstElement) firstElement.focus();

      return () => {
        document.removeEventListener('keydown', handleTabKey);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="modal-backdrop">
      {/* Modal */}
      <div className={`modal-content w-full mx-4 ${sizeClasses[size]} ${className} sm:mx-auto`}>
        {/* Header */}
        {title && (
          <div className="modal-header">
            <h3 className="modal-title">{title}</h3>
            <button
              onClick={onClose}
              className="modal-close-button p-1 rounded-full hover:bg-[var(--color-bg-hover)]"
            >
              <X size={24} />
            </button>
          </div>
        )}

        {/* Content */}
        <div className={`modal-body text-[var(--color-text-secondary)] ${showFooter ? 'max-h-[calc(90vh-180px)]' : 'max-h-[calc(90vh-120px)]'}`}>
          {children}
        </div>

        {/* Footer - Optional for actions */}
        {showFooter && (
          <div className="modal-footer">
            <Button
              onClick={onClose}
              variant="secondary"
              size="sm"
            >
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;