'use client';

import React, { Component, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
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
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Terminal Error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-gray-900 rounded-lg p-8">
          <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-white text-2xl font-bold mb-2">Terminal Error</h2>
          <p className="text-gray-400 text-center mb-4 max-w-md">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <Button onClick={this.handleReset} variant="default">
            Reload Terminal
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
