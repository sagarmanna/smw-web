// components/SectionTitle.tsx
import * as React from 'react';

interface SectionTitleProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Reusable section title component
 * Following Single Responsibility Principle - handles only section title display
 */
export const SectionTitle: React.FC<SectionTitleProps> = ({ 
  children, 
  className = '' 
}) => (
  <h3 className={`text-base font-semibold mb-3 mt-6 ${className}`.trim()}>
    {children}
  </h3>
);