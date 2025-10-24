// components/ModalFooter.tsx
import * as React from 'react';
import { Button } from '@/components/ui/button';

interface ModalFooterProps {
  onClose: () => void;
  onSave: () => void;
  isSaveDisabled?: boolean;
  isLoading?: boolean;
}

/**
 * Modal footer component with action buttons
 * Following Single Responsibility Principle - handles only footer actions
 */
export const ModalFooter: React.FC<ModalFooterProps> = ({ 
  onClose, 
  onSave,
  isSaveDisabled = false,
  isLoading = false
}) => (
  <div className="px-6 py-4 border-t bg-gray-50 flex-shrink-0">
    <div className="flex justify-end gap-3">
      <Button
        variant="outline"
        onClick={onClose}
        className="px-6 h-9"
        disabled={isLoading}
      >
        Close
      </Button>
      <Button
        onClick={onSave}
        disabled={isSaveDisabled || isLoading}
        className="bg-[#f3573f] hover:bg-[#e24d39] text-white px-6 h-9"
      >
        {isLoading ? 'Saving...' : 'Save'}
      </Button>
    </div>
  </div>
);