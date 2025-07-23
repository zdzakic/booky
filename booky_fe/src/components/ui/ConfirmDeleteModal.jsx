import React from 'react';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

const ConfirmDeleteModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  cancelText, 
  confirmText 
}) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col items-center text-center p-4">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-error-light dark:bg-error-dark/30">
          <AlertTriangle className="h-6 w-6 text-error dark:text-error-light" />
        </div>
        <h3 className="text-lg font-semibold text-neutral-darkest dark:text-neutral-lightest">{title}</h3>
        <p className="mt-2 text-sm text-neutral-dark dark:text-neutral-light">{message}</p>
        <div className="mt-6 flex gap-4">
          <button
            onClick={onClose}
            className="
              px-4 py-2 rounded-md text-sm font-medium
              text-neutral-dark dark:text-neutral-lightest
              bg-neutral-white dark:bg-neutral-dark
              border border-neutral-medium dark:border-neutral-dark
              hover:bg-neutral-lightest dark:hover:bg-neutral-darker
              transition-colors
            "
          >
            {cancelText || 'Cancel'}
          </button>
          <button
            onClick={onConfirm}
            className="
              px-4 py-2 rounded-md text-sm font-medium
              text-neutral-white
              bg-error hover:bg-error-dark
              transition-colors
            "
          >
            {confirmText || 'Confirm Delete'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDeleteModal;
