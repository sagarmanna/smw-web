// components/ModalHeader.tsx
import * as React from 'react';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ModalHeaderProps {
  amountNeeded: number;
}

/**
 * Modal header component with title and amount needed display
 * Following Single Responsibility Principle - handles only header display
 */
export const ModalHeader: React.FC<ModalHeaderProps> = ({ amountNeeded }) => (
  <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
    <div className="flex justify-between items-center">
      <DialogTitle className="text-xl">Receive Payment</DialogTitle>
      <div className="text-sm">
        Amount Needed{' '}
        <span className="text-lg font-bold ml-2">
          ${amountNeeded.toFixed(2)}
        </span>
      </div>
    </div>
  </DialogHeader>
);