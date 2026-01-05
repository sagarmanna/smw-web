"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component for catching and handling React errors
 * 
 * This component catches errors in its children and displays a fallback UI
 * instead of crashing the entire application.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="w-full max-w-lg mx-auto">
          <CardHeader className="text-center">
            <ShieldX className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle>Something Went Wrong</CardTitle>
            <CardDescription className="mt-2">
              We encountered an unexpected error while rendering this component.
              {this.state.error && (
                <span className="block mt-2 text-sm text-muted-foreground">
                  {this.state.error.message}
                </span>
              )}
            </CardDescription>
            <Button
              onClick={this.handleReset}
              variant="outline"
              className="mt-4"
            >
              Try Again
            </Button>
          </CardHeader>
        </Card>
      );
    }

    return this.props.children;
  }
}

