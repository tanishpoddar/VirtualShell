'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import '@xterm/xterm/css/xterm.css';
import { AutocompleteService } from '@/lib/webcontainer/autocomplete';

export interface TerminalUIProps {
  onCommand: (command: string) => Promise<void>;
  onResize?: (cols: number, rows: number) => void;
  autocompleteService?: AutocompleteService;
  currentDirectory?: string;
  readOnly?: boolean;
  className?: string;
}

export const TerminalUI: React.FC<TerminalUIProps> = ({
  onCommand,
  onResize,
  autocompleteService,
  currentDirectory = '/',
  readOnly = false,
  className = '',
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [currentLine, setCurrentLine] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [cursorPosition, setCursorPosition] = useState(0);

  useEffect(() => {
    if (!terminalRef.current || xtermRef.current) return;

    const terminal = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Source Code Pro, monospace',
      theme: {
        background: '#1a1b26',
        foreground: '#a9b1d6',
        cursor: '#c0caf5',
        black: '#32344a',
        red: '#f7768e',
        green: '#9ece6a',
        yellow: '#e0af68',
        blue: '#7aa2f7',
        magenta: '#ad8ee6',
        cyan: '#449dab',
        white: '#787c99',
        brightBlack: '#444b6a',
        brightRed: '#ff7a93',
        brightGreen: '#b9f27c',
        brightYellow: '#ff9e64',
        brightBlue: '#7da6ff',
        brightMagenta: '#bb9af7',
        brightCyan: '#0db9d7',
        brightWhite: '#acb0d0',
      },
      allowProposedApi: true,
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();

    terminal.loadAddon(fitAddon);
    terminal.loadAddon(webLinksAddon);

    terminal.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = terminal;
    fitAddonRef.current = fitAddon;

    terminal.writeln('Welcome to SRM OS Virtual Labs Terminal');
    terminal.writeln('Type your commands below. Press Ctrl+L to clear screen.');
    terminal.writeln('');
    writePrompt(terminal);

    if (onResize) {
      onResize(terminal.cols, terminal.rows);
    }

    const resizeObserver = new ResizeObserver(() => {
      fitAddon.fit();
      if (onResize) {
        onResize(terminal.cols, terminal.rows);
      }
    });

    if (terminalRef.current) {
      resizeObserver.observe(terminalRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      terminal.dispose();
      xtermRef.current = null;
      fitAddonRef.current = null;
    };
  }, [onResize]);

  useEffect(() => {
    const terminal = xtermRef.current;
    if (!terminal) return;

    const handleData = async (data: string) => {
      if (readOnly) return;

      const code = data.charCodeAt(0);

      // Enter key
      if (code === 13) {
        terminal.writeln('');
        const command = currentLine.trim();
        
        if (command) {
          setCommandHistory((prev) => [command, ...prev]);
          setHistoryIndex(-1);
          
          try {
            await onCommand(command);
          } catch (err) {
            terminal.writeln(`\x1b[31mError: ${err}\x1b[0m`);
          }
        }
        
        setCurrentLine('');
        setCursorPosition(0);
        writePrompt(terminal);
        return;
      }

      // Backspace
      if (code === 127) {
        if (cursorPosition > 0) {
          const newLine =
            currentLine.slice(0, cursorPosition - 1) +
            currentLine.slice(cursorPosition);
          setCurrentLine(newLine);
          setCursorPosition(cursorPosition - 1);
          
          terminal.write('\b \b');
          if (cursorPosition < currentLine.length) {
            terminal.write(newLine.slice(cursorPosition - 1));
            terminal.write(' ');
            terminal.write('\b'.repeat(newLine.length - cursorPosition + 2));
          }
        }
        return;
      }

      // Ctrl+C
      if (code === 3) {
        terminal.writeln('^C');
        setCurrentLine('');
        setCursorPosition(0);
        writePrompt(terminal);
        return;
      }

      // Ctrl+L
      if (code === 12) {
        terminal.clear();
        writePrompt(terminal);
        terminal.write(currentLine);
        return;
      }

      // Tab key for autocompletion
      if (code === 9) {
        if (autocompleteService && currentLine.trim()) {
          try {
            const completions = await autocompleteService.getCompletions(
              currentLine,
              currentDirectory
            );
            
            if (completions.length === 1) {
              // Single completion - auto-complete
              const completion = completions[0];
              replaceCurrentLine(terminal, currentLine, completion);
              setCurrentLine(completion);
              setCursorPosition(completion.length);
            } else if (completions.length > 1) {
              // Multiple completions - show options
              terminal.writeln('');
              terminal.writeln(completions.join('  '));
              writePrompt(terminal);
              terminal.write(currentLine);
              
              // Try to complete common prefix
              const commonPrefix = await autocompleteService.getCommonCompletion(completions);
              if (commonPrefix && commonPrefix.length > currentLine.length) {
                replaceCurrentLine(terminal, currentLine, commonPrefix);
                setCurrentLine(commonPrefix);
                setCursorPosition(commonPrefix.length);
              }
            }
          } catch (err) {
            console.error('Autocomplete error:', err);
          }
        }
        return;
      }

      // Arrow keys and other escape sequences
      if (code === 27) {
        const seq = data.slice(1);
        
        // Up arrow
        if (seq === '[A') {
          if (historyIndex < commandHistory.length - 1) {
            const newIndex = historyIndex + 1;
            const historicalCommand = commandHistory[newIndex];
            setHistoryIndex(newIndex);
            replaceCurrentLine(terminal, currentLine, historicalCommand);
            setCurrentLine(historicalCommand);
            setCursorPosition(historicalCommand.length);
          }
          return;
        }
        
        // Down arrow
        if (seq === '[B') {
          if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            const historicalCommand = commandHistory[newIndex];
            setHistoryIndex(newIndex);
            replaceCurrentLine(terminal, currentLine, historicalCommand);
            setCurrentLine(historicalCommand);
            setCursorPosition(historicalCommand.length);
          } else if (historyIndex === 0) {
            setHistoryIndex(-1);
            replaceCurrentLine(terminal, currentLine, '');
            setCurrentLine('');
            setCursorPosition(0);
          }
          return;
        }
        
        // Left arrow
        if (seq === '[D') {
          if (cursorPosition > 0) {
            setCursorPosition(cursorPosition - 1);
            terminal.write('\x1b[D');
          }
          return;
        }
        
        // Right arrow
        if (seq === '[C') {
          if (cursorPosition < currentLine.length) {
            setCursorPosition(cursorPosition + 1);
            terminal.write('\x1b[C');
          }
          return;
        }
        
        return;
      }

      // Regular character input
      if (code >= 32 && code < 127) {
        const newLine =
          currentLine.slice(0, cursorPosition) +
          data +
          currentLine.slice(cursorPosition);
        setCurrentLine(newLine);
        setCursorPosition(cursorPosition + 1);
        
        terminal.write(data);
        if (cursorPosition < currentLine.length) {
          terminal.write(newLine.slice(cursorPosition + 1));
          terminal.write('\b'.repeat(newLine.length - cursorPosition - 1));
        }
      }
    };

    const disposable = terminal.onData(handleData);

    return () => {
      disposable.dispose();
    };
  }, [currentLine, cursorPosition, commandHistory, historyIndex, onCommand, readOnly]);

  const writePrompt = (terminal: Terminal) => {
    terminal.write('\x1b[32mstudent@srm\x1b[0m:\x1b[34m~\x1b[0m$ ');
  };

  const replaceCurrentLine = (
    terminal: Terminal,
    oldLine: string,
    newLine: string
  ) => {
    terminal.write('\r\x1b[K');
    writePrompt(terminal);
    terminal.write(newLine);
  };

  const writeOutput = (output: string) => {
    const terminal = xtermRef.current;
    if (!terminal) return;
    
    terminal.writeln(output);
  };

  useEffect(() => {
    if (xtermRef.current) {
      (xtermRef.current as any).writeOutput = writeOutput;
    }
  }, []);

  return (
    <div
      ref={terminalRef}
      className={`w-full h-full ${className}`}
      style={{ minHeight: '400px' }}
    />
  );
};

export default TerminalUI;
