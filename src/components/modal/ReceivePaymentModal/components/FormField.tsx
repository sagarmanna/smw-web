// components/FormField.tsx
import * as React from 'react';
import { Label } from '@/components/ui/label';

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  htmlFor?: string;
}

/**
 * Reusable form field component
 * Following Single Responsibility Principle - handles only form field layout
 */
export const FormField: React.FC<FormFieldProps> = ({ 
  label, 
  children, 
  required = false,
  htmlFor 
}) => (
  <div className="space-y-1.5">
    <Label className="text-sm" htmlFor={htmlFor}>
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </Label>
    {children}
  </div>
);
