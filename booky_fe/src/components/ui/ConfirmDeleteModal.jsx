import React from 'react';
import Modal from './Modal'; // Ažurirana putanja
import { theme } from '../../config/theme';
import { AlertTriangle } from 'lucide-react';

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, title, message, cancelText, confirmText }) => {
  if (!isOpen) return null;

  

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{message}</p>
        <div className="mt-6 flex gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {cancelText || 'Cancel'}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            {confirmText || 'Confirm Delete'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDeleteModal;
