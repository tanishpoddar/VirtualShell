'use client';

import React, { useEffect, useRef, useState } from 'react';
import { TerminalSingleton } from '@/lib/webcontainer/terminal-singleton';

export interface TerminalUIProps {
  manager: any;
  className?: string;
}

export const TerminalUI: React.FC<TerminalUIProps> = ({
  manager,
  className = '',
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initAttemptedRef = useRef(false);

  useEffect(() => {
    // Prevent double initialization from React StrictMode
    if (initAttemptedRef.current) {
      console.log('[TerminalUI] Init already attempted, skipping');
      return;
    }

    if (!terminalRef.current || typeof window === 'undefined') {
      return;
    }

    initAttemptedRef.current = true;

    const initTerminal = async () => {
      try {
        console.log('[TerminalUI] Starting initialization');

        // Wait for manager to be ready
        if (!manager) {
          setError('WebContainer manager not available');
          return;
        }

        if (!manager.isReady()) {
          console.log('[TerminalUI] Waiting for WebContainer...');
          
          let attempts = 0;
          const checkReady = setInterval(() => {
            attempts++;
            if (manager.isReady()) {
              clearInterval(checkReady);
              console.log('[TerminalUI] WebContainer ready');
              startTerminal();
            } else if (attempts > 20) {
              clearInterval(checkReady);
              setError('WebContainer initialization timeout');
            }
          }, 500);
        } else {
          await startTerminal();
        }
      } catch (err) {
        console.error('[TerminalUI] Initialization error:', err);
        setError((err as Error).message);
      }
    };

    const startTerminal = async () => {
      try {
        if (!terminalRef.current) {
          setError('Terminal container not available');
          return;
        }

        const container = manager.getContainer();
        if (!container) {
          setError('WebContainer not available');
          return;
        }

        // Check if already initialized
        if (TerminalSingleton.isInitialized()) {
          console.log('[TerminalUI] Terminal already initialized');
          setIsReady(true);
          return;
        }

        // Initialize the singleton terminal
        await TerminalSingleton.initialize(terminalRef.current, container);
        
        console.log('[TerminalUI] Terminal ready');
        setIsReady(true);
      } catch (err) {
        console.error('[TerminalUI] Failed to start terminal:', err);
        setError((err as Error).message);
      }
    };

    initTerminal();

    // Cleanup on page unload
    const handleBeforeUnload = () => {
      console.log('[TerminalUI] Page unloading');
      TerminalSingleton.destroy();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      console.log('[TerminalUI] Component unmounting');
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // DON'T destroy the singleton - it persists across navigation
    };
  }, [manager]);

  if (error) {
    return (
      <div
        className={`w-full ${className} flex items-center justify-center`}
        style={{ 
          height: '600px', 
          maxHeight: '600px', 
          backgroundColor: '#000000',
          border: '2px solid #00ff00',
          boxShadow: '0 0 20px rgba(0, 255, 0, 0.3)'
        }}
      >
        <div className="text-center">
          <p className="text-red-500 text-sm mb-2 font-bold">Error: {error}</p>
          <p className="text-green-500 text-xs font-bold">Please refresh the page</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`w-full ${className} relative`} 
      style={{ 
        height: '600px', 
        maxHeight: '600px',
        border: '2px solid #00ff00',
        boxShadow: '0 0 20px rgba(0, 255, 0, 0.3), inset 0 0 20px rgba(0, 255, 0, 0.1)',
        borderRadius: '4px',
        overflow: 'hidden'
      }}
    >
      {/* Loading overlay */}
      {!isReady && (
        <div
          className="absolute inset-0 flex items-center justify-center z-10"
          style={{ backgroundColor: '#000000' }}
        >
          <div className="text-center">
            <div 
              className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
              style={{ borderColor: '#00ff00' }}
            ></div>
            <p 
              className="text-sm font-bold"
              style={{ 
                color: '#00ff00',
                textShadow: '0 0 10px rgba(0, 255, 0, 0.8)'
              }}
            >
              INITIALIZING TERMINAL...
            </p>
          </div>
        </div>
      )}
      
      {/* Terminal container - always rendered */}
      <div
        ref={terminalRef}
        className="w-full h-full"
        style={{ 
          backgroundColor: '#000000',
          padding: '8px'
        }}
      />
    </div>
  );
};

export default TerminalUI;
