'use client';

import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase-config';

export interface SessionData {
  sessionId: string;
  userId?: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  commandCount: number;
  errorCount: number;
  browserInfo: {
    name: string;
    version: string;
  };
}

export class SessionTracker {
  private sessionData: SessionData;
  private isTracking: boolean = false;

  constructor(userId?: string) {
    this.sessionData = {
      sessionId: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      startTime: new Date(),
      commandCount: 0,
      errorCount: 0,
      browserInfo: this.getBrowserInfo(),
    };
  }

  private getBrowserInfo(): { name: string; version: string } {
    const userAgent = navigator.userAgent;
    let name = 'Unknown';
    let version = 'Unknown';

    if (/Chrome/.test(userAgent)) {
      name = 'Chrome';
      const match = userAgent.match(/Chrome\/(\d+)/);
      version = match ? match[1] : 'Unknown';
    } else if (/Firefox/.test(userAgent)) {
      name = 'Firefox';
      const match = userAgent.match(/Firefox\/(\d+)/);
      version = match ? match[1] : 'Unknown';
    } else if (/Safari/.test(userAgent)) {
      name = 'Safari';
      const match = userAgent.match(/Version\/(\d+)/);
      version = match ? match[1] : 'Unknown';
    }

    return { name, version };
  }

  async startTracking(): Promise<void> {
    this.isTracking = true;
    await this.saveSession();
  }

  incrementCommandCount(): void {
    if (this.isTracking) {
      this.sessionData.commandCount++;
    }
  }

  incrementErrorCount(): void {
    if (this.isTracking) {
      this.sessionData.errorCount++;
    }
  }

  async endTracking(): Promise<void> {
    if (!this.isTracking) return;

    this.isTracking = false;
    this.sessionData.endTime = new Date();
    this.sessionData.duration =
      this.sessionData.endTime.getTime() - this.sessionData.startTime.getTime();

    await this.saveSession();
  }

  private async saveSession(): Promise<void> {
    if (!this.sessionData.userId) {
      // Don't save sessions for anonymous users
      return;
    }

    try {
      const docRef = doc(
        db,
        'terminal_sessions',
        this.sessionData.sessionId
      );

      await setDoc(docRef, {
        ...this.sessionData,
        startTime: this.sessionData.startTime.toISOString(),
        endTime: this.sessionData.endTime?.toISOString(),
        lastUpdated: serverTimestamp(),
      });
    } catch (err) {
      console.error('Failed to save session:', err);
    }
  }

  getSessionData(): SessionData {
    return { ...this.sessionData };
  }
}
