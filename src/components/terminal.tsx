'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface TerminalProps {
  onCommand: (command: string) => void;
  history: Array<{ type: 'command' | 'output'; content: string }>;
  cwd: string;
}

const Terminal: React.FC<TerminalProps> = ({ onCommand, history, cwd }) => {
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);
  
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const command = input.trim();
      if (command) {
        onCommand(command);
        setCommandHistory(prev => [command, ...prev]);
        setHistoryIndex(-1);
      } else {
        onCommand('');
      }
      setInput('');
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (commandHistory.length > 0) {
            const newIndex = Math.min(historyIndex + 1, commandHistory.length - 1);
            setHistoryIndex(newIndex);
            setInput(commandHistory[newIndex]);
        }
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex > 0) {
            const newIndex = Math.max(historyIndex - 1, 0);
            setHistoryIndex(newIndex);
            setInput(commandHistory[newIndex]);
        } else if (historyIndex === 0) {
            setHistoryIndex(-1);
            setInput('');
        }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      onCommand('clear');
    }
  };
  
  const Prompt = ({ path }: { path: string}) => (
    <div className="flex font-code">
      <span className="text-green-500">student@srm</span>
      <span className="text-muted-foreground">:</span>
      <span className="text-blue-500">{path}</span>
      <span className="text-muted-foreground">$ &nbsp;</span>
    </div>
  );

  return (
    <div
      className="bg-gray-900 text-white font-code w-full h-[400px] md:h-[600px] flex flex-col rounded-lg border-2 border-border overflow-hidden"
      onClick={() => inputRef.current?.focus()}
    >
      <div ref={scrollRef} className="flex-grow p-4 overflow-y-auto text-sm">
        {history.map((item, index) => (
          <div key={index}>
            {item.type === 'command' ? (
              <div className="flex">
                <Prompt path={cwd} />
                <span>{item.content}</span>
              </div>
            ) : (
              <pre className="whitespace-pre-wrap break-words">{item.content}</pre>
            )}
          </div>
        ))}
        <div className="flex">
            <Prompt path={cwd} />
            <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="bg-transparent border-none outline-none text-white font-code flex-grow p-0 m-0"
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
            />
        </div>
      </div>
    </div>
  );
};

export default Terminal;
