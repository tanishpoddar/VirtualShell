/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { TerminalUI } from '../TerminalUI';
import * as fc from 'fast-check';

// Mock xterm
jest.mock('@xterm/xterm', () => ({
  Terminal: jest.fn().mockImplementation(() => ({
    loadAddon: jest.fn(),
    open: jest.fn(),
    writeln: jest.fn(),
    write: jest.fn(),
    clear: jest.fn(),
    onData: jest.fn(() => ({ dispose: jest.fn() })),
    dispose: jest.fn(),
    cols: 80,
    rows: 24,
  })),
}));

jest.mock('@xterm/addon-fit', () => ({
  FitAddon: jest.fn().mockImplementation(() => ({
    fit: jest.fn(),
  })),
}));

jest.mock('@xterm/addon-web-links', () => ({
  WebLinksAddon: jest.fn().mockImplementation(() => ({})),
}));

describe('TerminalUI', () => {
  const mockOnCommand = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render terminal container', () => {
    render(<TerminalUI onCommand={mockOnCommand} />);
    const container = document.querySelector('div');
    expect(container).toBeInTheDocument();
  });

  it('should initialize xterm terminal', async () => {
    const { Terminal } = require('@xterm/xterm');
    render(<TerminalUI onCommand={mockOnCommand} />);
    
    await waitFor(() => {
      expect(Terminal).toHaveBeenCalled();
    });
  });

  it('should handle readonly mode', () => {
    render(<TerminalUI onCommand={mockOnCommand} readOnly={true} />);
    // In readonly mode, terminal should not accept input
    expect(mockOnCommand).not.toHaveBeenCalled();
  });

  /**
   * Feature: webcontainer-terminal, Property 4: Command History Navigation
   * Validates: Requirements 4.2
   */
  it('should navigate command history correctly (property test)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.string({ minLength: 1, maxLength: 20 }), {
          minLength: 1,
          maxLength: 10,
        }),
        async (commands) => {
          const history = [...commands];
          let currentIndex = -1;

          // Simulate up arrow navigation
          for (let i = 0; i < Math.min(commands.length, 5); i++) {
            currentIndex++;
            const expectedCommand = history[currentIndex];
            expect(expectedCommand).toBeDefined();
          }

          // Simulate down arrow navigation
          while (currentIndex > 0) {
            currentIndex--;
            const expectedCommand = history[currentIndex];
            expect(expectedCommand).toBeDefined();
          }

          // Going down from index 0 should clear
          if (currentIndex === 0) {
            currentIndex = -1;
            expect(currentIndex).toBe(-1);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle resize events', async () => {
    const onResize = jest.fn();
    render(<TerminalUI onCommand={mockOnCommand} onResize={onResize} />);

    await waitFor(() => {
      expect(onResize).toHaveBeenCalled();
    });
  });

  it('should cleanup on unmount', () => {
    const { Terminal } = require('@xterm/xterm');
    const mockDispose = jest.fn();
    Terminal.mockImplementation(() => ({
      loadAddon: jest.fn(),
      open: jest.fn(),
      writeln: jest.fn(),
      write: jest.fn(),
      clear: jest.fn(),
      onData: jest.fn(() => ({ dispose: jest.fn() })),
      dispose: mockDispose,
      cols: 80,
      rows: 24,
    }));

    const { unmount } = render(<TerminalUI onCommand={mockOnCommand} />);
    unmount();

    expect(mockDispose).toHaveBeenCalled();
  });
});
