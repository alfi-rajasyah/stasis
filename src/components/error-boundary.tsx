"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children?: ReactNode;
  error?: Error | null;
  reset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = (): void => {
    if (this.props.reset) {
      this.props.reset();
    } else {
      this.setState({ hasError: false, error: null });
    }
  };

  render() {
    const displayError = this.props.error ?? this.state.error;

    if (displayError) {
      return (
        <div className="flex min-h-[400px] items-center justify-center p-8">
          <div className="w-full max-w-md rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.05] p-8 text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-red-500/10">
              <AlertTriangle className="size-6 text-red-400" />
            </div>
            <h2 className="mb-2 text-lg font-semibold text-white/90">
              Something went wrong
            </h2>
            <p className="mb-6 text-sm text-white/40">
              {displayError.message || "An unexpected error occurred."}
            </p>
            <Button variant="outline" onClick={this.handleReset}>
              Try again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children ?? null;
  }
}
