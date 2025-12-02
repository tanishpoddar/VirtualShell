'use client';

export interface PerformanceMetrics {
  initializationTime?: number;
  commandExecutionTimes: number[];
  averageCommandTime: number;
  memoryUsage?: number;
  storageUsage?: number;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    commandExecutionTimes: [],
    averageCommandTime: 0,
  };

  private initStartTime?: number;

  startInitialization(): void {
    this.initStartTime = performance.now();
  }

  endInitialization(): void {
    if (this.initStartTime) {
      this.metrics.initializationTime = performance.now() - this.initStartTime;
      this.initStartTime = undefined;
    }
  }

  recordCommandExecution(duration: number): void {
    this.metrics.commandExecutionTimes.push(duration);
    
    // Keep only last 100 commands
    if (this.metrics.commandExecutionTimes.length > 100) {
      this.metrics.commandExecutionTimes.shift();
    }

    // Update average
    this.metrics.averageCommandTime =
      this.metrics.commandExecutionTimes.reduce((a, b) => a + b, 0) /
      this.metrics.commandExecutionTimes.length;
  }

  async updateMemoryUsage(): Promise<void> {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = memory.usedJSHeapSize / (1024 * 1024); // Convert to MB
    }
  }

  async updateStorageUsage(): Promise<void> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      this.metrics.storageUsage = (estimate.usage || 0) / (1024 * 1024); // Convert to MB
    }
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  getInitializationTime(): number | undefined {
    return this.metrics.initializationTime;
  }

  getAverageCommandTime(): number {
    return this.metrics.averageCommandTime;
  }

  getMemoryUsage(): number | undefined {
    return this.metrics.memoryUsage;
  }

  reset(): void {
    this.metrics = {
      commandExecutionTimes: [],
      averageCommandTime: 0,
    };
  }
}

export const performanceMonitor = new PerformanceMonitor();

export function measureAsync<T>(
  fn: () => Promise<T>,
  onComplete?: (duration: number) => void
): Promise<T> {
  const start = performance.now();
  return fn().then((result) => {
    const duration = performance.now() - start;
    if (onComplete) {
      onComplete(duration);
    }
    return result;
  });
}

export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${Math.round(ms)}ms`;
  }
  return `${(ms / 1000).toFixed(2)}s`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes}B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)}KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
}
