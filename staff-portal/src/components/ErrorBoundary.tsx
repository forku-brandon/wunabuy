import React, { Component, ErrorInfo, ReactNode } from 'react';
import { securityLogger } from '../services/security/securityLogger';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorId: string | null;
  errorMessage: string | null;
}

/**
 * Enterprise React Error Boundary Component — Wunabuy Staff Portal (OWASP A10:2025 Mitigation)
 * 
 * Prevents application crashes, masks raw technical stack traces from end-users,
 * logs exception details to the security audit logger, and offers single-click session recovery.
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorId: null,
    errorMessage: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    const errorId = 'err_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6);
    return {
      hasError: true,
      errorId,
      errorMessage: error.message || 'An unexpected application exception occurred.',
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log exception telemetry securely
    securityLogger.logEvent({
      action_code: 'APP_EXCEPTION_CAUGHT',
      action_description: `React Error Boundary caught exception [${error.name}]: ${error.message}`,
      security_level: 'CRITICAL',
      meta: {
        errorName: error.name,
        errorMessage: error.message,
        componentStack: errorInfo.componentStack ? errorInfo.componentStack.slice(0, 500) : 'N/A',
      },
    });

    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary caught error]:', error, errorInfo);
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, errorId: null, errorMessage: null });
    window.location.href = '/';
  };

  private handleClearSession = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-white p-6 font-sans">
          <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl text-center">
            {/* Header Icon */}
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-400">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <span className="inline-block px-3 py-1 bg-red-500/20 text-red-300 text-xs font-semibold rounded-full uppercase tracking-wider mb-3">
              Security Shield System Guard
            </span>

            <h1 className="text-2xl font-bold text-slate-100 mb-2">
              Application Exception Intercepted
            </h1>

            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              An unexpected runtime condition occurred. Technical details have been logged to the corporate Security Operations Center.
            </p>

            {/* Error Reference Box */}
            <div className="bg-slate-900/80 border border-slate-700/60 rounded-xl p-4 mb-6 text-left font-mono text-xs text-slate-300">
              <div className="flex justify-between items-center mb-1 text-slate-500">
                <span>Incident Reference ID:</span>
                <span className="text-teal-400 font-semibold">{this.state.errorId}</span>
              </div>
              <div className="text-red-400 font-sans truncate">
                {this.state.errorMessage}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-500 text-white font-medium text-sm rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reload Executive Portal
              </button>

              <button
                onClick={this.handleClearSession}
                className="w-full py-2.5 px-4 bg-slate-700/50 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-xl border border-slate-600 transition-colors"
              >
                Reset Session &amp; Return to Login
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
