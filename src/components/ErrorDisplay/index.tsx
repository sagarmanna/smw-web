'use client';

import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ErrorDisplayProps {
  error?: string | null;
  title?: string;
  fallbackMessage?: string;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export function ErrorDisplay({
  error,
  title = 'Unable to Load Data',
  fallbackMessage = 'An unexpected error occurred. Please try again later.',
  className = '',
  maxWidth = '2xl',
}: ErrorDisplayProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full',
  };

  const errorMessage = error || fallbackMessage;

  const alertContent = (
    <Alert variant="destructive" className={`${maxWidthClasses[maxWidth]} mx-auto ${className}`}>
      <AlertTriangle className="h-5 w-5" />
      <div className="flex-1">
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className="mt-2">{errorMessage}</AlertDescription>
      </div>
    </Alert>
  );

  return alertContent;
}

