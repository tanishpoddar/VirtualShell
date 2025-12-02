'use client';

/**
 * ABSOLUTE SINGLETON - Only ONE terminal can exist in the entire application
 */

let TERMINAL_INSTANCE: any = null;
let SHELL_PROCESS: any = null;
let IS_INITIALIZING = false;
let TERMINAL_CONTAINER: HTMLDivElement | null = null;

export class TerminalSingleton {
  static isInitialized(): boolean {
    return TERMINAL_INSTANCE !== null && SHELL_PROCESS !== null;
  }

  static isInitializing(): boolean {
    return IS_INITIALIZING;
  }

  static async initialize(
    container: HTMLDivElement,
    webcontainer: any
  ): Promise<void> {
    // If already initialized, do nothing
    if (this.isInitialized()) {
      console.log('[TerminalSingleton] Already initialized');
      return;
    }

    // If currently initializing, wait
    if (IS_INITIALIZING) {
      console.log('[TerminalSingleton] Already initializing, waiting...');
      // Wait for initialization to complete
      while (IS_INITIALIZING) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return;
    }

    IS_INITIALIZING = true;
    TERMINAL_CONTAINER = container;

    try {
      console.log('[TerminalSingleton] Starting initialization');

      // Import xterm
      const [terminalMod, fitMod] = await Promise.all([
        import('@xterm/xterm'),
        import('@xterm/addon-fit'),
      ]);
      
      // @ts-ignore
      await import('@xterm/xterm/css/xterm.css');

      const Terminal = terminalMod.Terminal;
      const FitAddon = fitMod.FitAddon;

      // Create terminal with retro hacker aesthetic
      const terminal = new Terminal({
        cursorBlink: true,
        cursorStyle: 'block',
        fontSize: 15,
        fontFamily: '"Courier New", Courier, monospace',
        fontWeight: 'bold',
        fontWeightBold: 'bold',
        lineHeight: 1.1,
        letterSpacing: 0.5,
        scrollback: 1000,
        tabStopWidth: 8,
        theme: {
          background: '#000000',        // Pure black background
          foreground: '#00ff00',        // Neon green text
          cursor: '#00ff00',            // Neon green cursor
          cursorAccent: '#000000',      // Black cursor accent
          selectionBackground: 'rgba(0, 255, 0, 0.3)',  // Green selection
          black: '#000000',
          red: '#ff0000',
          green: '#00ff00',
          yellow: '#ffff00',
          blue: '#0000ff',
          magenta: '#ff00ff',
          cyan: '#00ffff',
          white: '#ffffff',
          brightBlack: '#555555',
          brightRed: '#ff5555',
          brightGreen: '#55ff55',
          brightYellow: '#ffff55',
          brightBlue: '#5555ff',
          brightMagenta: '#ff55ff',
          brightCyan: '#55ffff',
          brightWhite: '#ffffff',
        },
        allowProposedApi: true,
        convertEol: true,
        disableStdin: false,
        windowsMode: false,
      });

      const fitAddon = new FitAddon();
      terminal.loadAddon(fitAddon);

      terminal.open(container);
      
      // Fit terminal to container size
      setTimeout(() => {
        try {
          fitAddon.fit();
          console.log('[TerminalSingleton] Terminal fitted to container');
        } catch (err) {
          console.warn('Failed to fit terminal:', err);
        }
      }, 100);
      
      // Fit again after a short delay to ensure proper sizing
      setTimeout(() => {
        try {
          fitAddon.fit();
        } catch (err) {
          console.warn('Failed to fit terminal (second attempt):', err);
        }
      }, 500);

      TERMINAL_INSTANCE = terminal;
      console.log('[TerminalSingleton] Terminal UI created');

      // Setup resize observer with debouncing
      let resizeTimeout: NodeJS.Timeout;
      const resizeObserver = new ResizeObserver(() => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          try {
            fitAddon.fit();
            console.log('[TerminalSingleton] Terminal resized');
          } catch (err) {
            console.warn('Failed to fit terminal on resize:', err);
          }
        }, 100);
      });

      resizeObserver.observe(container);
      
      // Also handle window resize
      const handleWindowResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          try {
            fitAddon.fit();
          } catch (err) {
            console.warn('Failed to fit terminal on window resize:', err);
          }
        }, 100);
      };
      
      window.addEventListener('resize', handleWindowResize);

      // Create shell
      terminal.writeln('Starting shell...\r\n');
      console.log('[TerminalSingleton] Spawning shell');
      
      const shellProcess = await webcontainer.spawn('jsh');
      SHELL_PROCESS = shellProcess;
      
      console.log('[TerminalSingleton] Shell created, connecting streams');

      // Connect output
      const outputReader = shellProcess.output.getReader();
      
      const readOutput = async () => {
        try {
          while (true) {
            const { done, value } = await outputReader.read();
            if (done) {
              console.log('[TerminalSingleton] Output stream ended');
              break;
            }
            if (TERMINAL_INSTANCE) {
              terminal.write(value);
            }
          }
        } catch (err) {
          console.error('[TerminalSingleton] Error reading output:', err);
        }
      };
      
      readOutput();

      // Connect input
      const input = shellProcess.input.getWriter();
      
      terminal.onData((data: string) => {
        try {
          input.write(data);
        } catch (err) {
          console.error('[TerminalSingleton] Error writing input:', err);
        }
      });

      // Enable clipboard support
      // Copy: Ctrl+Shift+C or right-click copy
      terminal.attachCustomKeyEventHandler((event: KeyboardEvent) => {
        // Ctrl+Shift+C - Copy
        if (event.ctrlKey && event.shiftKey && event.key === 'C') {
          const selection = terminal.getSelection();
          if (selection) {
            navigator.clipboard.writeText(selection).then(() => {
              console.log('[TerminalSingleton] Copied to clipboard');
            }).catch(err => {
              console.error('[TerminalSingleton] Failed to copy:', err);
            });
          }
          return false;
        }
        
        // Ctrl+Shift+V - Paste
        if (event.ctrlKey && event.shiftKey && event.key === 'V') {
          event.preventDefault();
          event.stopPropagation();
          navigator.clipboard.readText().then(text => {
            if (text) {
              input.write(text);
              console.log('[TerminalSingleton] Pasted from keyboard shortcut');
            }
          }).catch(err => {
            console.error('[TerminalSingleton] Failed to paste:', err);
          });
          return false;
        }
        
        return true;
      });

      // Enable text selection
      terminal.options.rightClickSelectsWord = false; // Allow right-click for context menu

      // Prevent default paste behavior to avoid double paste
      container.addEventListener('paste', (e: ClipboardEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const text = e.clipboardData?.getData('text');
        if (text) {
          input.write(text);
          console.log('[TerminalSingleton] Pasted from browser event');
        }
      });

      // Add context menu support
      container.addEventListener('contextmenu', (e: MouseEvent) => {
        e.preventDefault();
        
        const selection = terminal.getSelection();
        
        // Create context menu
        const menu = document.createElement('div');
        menu.style.position = 'fixed';
        menu.style.left = `${e.clientX}px`;
        menu.style.top = `${e.clientY}px`;
        menu.style.backgroundColor = '#2d2d2d';
        menu.style.border = '1px solid #555';
        menu.style.borderRadius = '4px';
        menu.style.padding = '4px 0';
        menu.style.zIndex = '10000';
        menu.style.minWidth = '120px';
        menu.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';

        // Copy option
        if (selection) {
          const copyOption = document.createElement('div');
          copyOption.textContent = 'Copy';
          copyOption.style.padding = '6px 12px';
          copyOption.style.cursor = 'pointer';
          copyOption.style.color = '#fff';
          copyOption.style.fontSize = '13px';
          copyOption.onmouseover = () => copyOption.style.backgroundColor = '#404040';
          copyOption.onmouseout = () => copyOption.style.backgroundColor = 'transparent';
          copyOption.onclick = () => {
            navigator.clipboard.writeText(selection);
            document.body.removeChild(menu);
          };
          menu.appendChild(copyOption);
        }

        // Paste option
        const pasteOption = document.createElement('div');
        pasteOption.textContent = 'Paste';
        pasteOption.style.padding = '6px 12px';
        pasteOption.style.cursor = 'pointer';
        pasteOption.style.color = '#fff';
        pasteOption.style.fontSize = '13px';
        pasteOption.onmouseover = () => pasteOption.style.backgroundColor = '#404040';
        pasteOption.onmouseout = () => pasteOption.style.backgroundColor = 'transparent';
        pasteOption.onclick = () => {
          navigator.clipboard.readText().then(text => {
            if (text) {
              input.write(text);
            }
          });
          document.body.removeChild(menu);
        };
        menu.appendChild(pasteOption);

        document.body.appendChild(menu);

        // Remove menu on click outside
        const removeMenu = (event: MouseEvent) => {
          if (!menu.contains(event.target as Node)) {
            if (document.body.contains(menu)) {
              document.body.removeChild(menu);
            }
            document.removeEventListener('click', removeMenu);
          }
        };
        setTimeout(() => document.addEventListener('click', removeMenu), 0);
      });

      // Handle shell exit
      shellProcess.exit.then((code: number) => {
        console.log('[TerminalSingleton] Shell exited with code:', code);
        if (TERMINAL_INSTANCE) {
          terminal.writeln(`\r\n\x1b[31mShell exited with code ${code}\x1b[0m`);
          terminal.writeln('Refresh the page to restart.');
        }
        SHELL_PROCESS = null;
      });

      console.log('[TerminalSingleton] Initialization complete');
      IS_INITIALIZING = false;
    } catch (err) {
      console.error('[TerminalSingleton] Initialization failed:', err);
      IS_INITIALIZING = false;
      throw err;
    }
  }

  static destroy(): void {
    console.log('[TerminalSingleton] Destroying terminal');
    
    if (SHELL_PROCESS) {
      try {
        SHELL_PROCESS.kill();
      } catch (err) {
        console.error('[TerminalSingleton] Error killing shell:', err);
      }
      SHELL_PROCESS = null;
    }

    if (TERMINAL_INSTANCE) {
      try {
        TERMINAL_INSTANCE.dispose();
      } catch (err) {
        console.error('[TerminalSingleton] Error disposing terminal:', err);
      }
      TERMINAL_INSTANCE = null;
    }

    TERMINAL_CONTAINER = null;
    IS_INITIALIZING = false;
  }
}
