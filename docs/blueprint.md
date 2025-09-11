# **App Name**: SRM Virtual Shell

## Core Features:

- Interactive Terminal Emulator: Simulate a full-width, interactive Linux terminal within the browser, styled with a black background and green prompt, supporting realistic typing and scrolling via xterm.js.
- Virtual Filesystem Simulation: Implement a client-side JavaScript simulated Linux filesystem, featuring default directories (/home/student, /etc, /bin) and mock files (e.g., /etc/passwd, f1, f2). The filesystem persists across sessions and allows for directory changes with `cd`.
- Basic Linux Command Support: Enable execution of essential Linux commands directly in the terminal, using JavaScript string manipulation, regular expressions, and mock responses, without any calls to external services.
- Reset Lab Functionality: Add a reset button to wipe the virtual filesystem and start a fresh lab session, ensuring a clean environment for each attempt.
- Helpful Hints: A tool that helps guide the student in constructing the command by providing them contextual hints using a generative AI model. This helps teach them the different features of a particular linux tool and learn by using. The student can execute these commands after approval.

## Style Guidelines:

- Primary color: Deep Royal Blue (#002366) for the main interface elements, providing a professional and academic feel.
- Background color: Desaturated Deep Royal Blue (#262B36) creating a dark, comfortable coding environment.
- Accent color: Gold (#FFD700) used sparingly for interactive elements and highlights, complementing the royal blue theme.
- Monospace font for terminal: 'Source Code Pro' monospace font, for clear code readability.
- Headings and body font: 'Inter' sans-serif font, for all titles and non-code text in the UI.
- Header includes SRM logo on the top-left, with a title bar stating 'SRM OS Virtual Lab – Experiment 2: Basic Linux Commands & Filters'.
- Centering the terminal emulator in the main section with 80% width, plus including a right-side panel containing short command summaries and examples.