// components/ui/ErrorBoundary.tsx
// React class component — ErrorBoundary must be a class component because
// React's getDerivedStateFromError / componentDidCatch lifecycle hooks
// are not available in function components.
//
// Usage:
//   <ErrorBoundary fallback={<p>Something went wrong.</p>}>
//     <WeatherWidget />
//   </ErrorBoundary>

"use client";

import React, { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  /** Optional custom fallback — defaults to a minimal error card */
  fallback?: ReactNode;
  /** Optional label shown in the default fallback (e.g. "Weather Widget") */
  label?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render shows the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log to console in development; swap for a real error tracking service
    // (e.g. Sentry) in production:  Sentry.captureException(error, { extra: info })
    console.error(`[ErrorBoundary] ${this.props.label ?? "Component"} crashed:`, error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // Prefer the custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI — matches the glassmorphism design language
      return (
        <div className="bg-white/70 backdrop-blur-xl border border-orange-100 rounded-2xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {this.props.label ?? "Widget"} unavailable
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                A temporary error occurred loading this section.
              </p>
            </div>
          </div>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
