# Design Document: WebContainer Terminal Integration

## Overview

This design document outlines the architecture for integrating WebContainers into the SRM OS Virtual Labs platform. The solution replaces the current simulated command mapping system with a full-featured Linux environment running entirely in the browser via WebAssembly. The design prioritizes zero server costs, scalability to 10,000+ students, and seamless integration with existing Firebase authentication and AI features.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Student Browser                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Next.js Application                        │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │ │
│  │  │   Terminal   │  │  WebContainer│  │  AI Helper  │  │ │
│  │  │   Component  │◄─┤   Manager    │  │  Component  │  │ │
│  │  └──────────────┘  └──────────────┘  └─────────────┘  │ │
│  │         │                  │                  │         │ │
│  │         ▼                  ▼                  ▼         │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │ │
│  │  │   xterm.js   │  │ WebContainer │  │   Genkit    │  │ │
│  │  │   Renderer   │  │     API      │  │   AI Flow   │  │ │
│  │  └──────────────┘  └──────────────┘  └─────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
│                              │                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Browser Storage Layer                      │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │ │
│  │  │  IndexedDB   │  │ LocalStorage │  │   Cache     │  │ │
│  │  │ (Filesystem) │  │  (Settings)  │  │  (Assets)   │  │ │
│  │  └──────────────┘  └──────────────┘  └─────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Firebase Cloud  │
                    │  ┌────────────┐  │
                    │  │  Firestore │  │ (Optional Sync)
                    │  │   (Backup) │  │
                    │  └────────────┘  │
                    │  ┌────────────┐  │
                    │  │    Auth    │  │
                    │  └────────────┘  │
                    └──────────────────┘
```

### Component Architecture

```
src/
├── components/
│   ├── webcontainer-terminal/
│   │   ├── WebContainerTerminal.tsx      # Main terminal component
│   │   ├── TerminalUI.tsx                # xterm.js wrapper
│   │   ├── LoadingState.tsx              # Loading indicator
│   │   ├── ErrorBoundary.tsx             # Error handling
│   │   └── ControlPanel.tsx              # Reset, settings buttons
│   └── command-hints/
│       └── CommandHints.tsx              # Updated for WebContainer
├── lib/
│   ├── webcontainer/
│   │   ├── manager.ts                    # WebContainer lifecycle
│   │   ├── filesystem-sync.ts            # IndexedDB ↔ WebContainer
│   │   ├── command-executor.ts           # Command execution wrapper
│   │   └── types.ts                      # TypeScript types
│   ├── storage/
│   │   ├── indexeddb.ts                  # IndexedDB operations
│   │   └── firebase-sync.ts              # Optional cloud sync
│   └── utils/
│       ├── browser-compat.ts             # Browser detection
│       └── performance.ts                # Performance monitoring
└── hooks/
    ├── useWebContainer.ts                # WebContainer React hook
    ├── useTerminal.ts                    # Terminal state management
    └── useFilesystemSync.ts              # Sync state management
```

## Components and Interfaces

### 1. WebContainer Manager

**Purpose:** Manages WebContainer lifecycle, initialization, and command execution.

```typescript
// src/lib/webcontainer/manager.ts

export interface WebContainerConfig {
  workdir?: string;
  coep?: 'credentialless' | 'require-corp';
}

export interface CommandResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

export class WebContainerManager {
  private instance: WebContainer | null = null;
  private isInitialized: boolean = false;
  
  async initialize(config?: WebContainerConfig): Promise<void>;
  async executeCommand(command: string): Promise<CommandResult>;
  async writeFile(path: string, content: string): Promise<void>;
  async readFile(path: string): Promise<string>;
  async listDirectory(path: string): Promise<string[]>;
  async reset(): Promise<void>;
  async destroy(): Promise<void>;
  
  getStatus(): 'uninitialized' | 'loading' | 'ready' | 'error';
  onOutput(callback: (data: string) => void): void;
  onError(callback: (error: Error) => void): void;
}
```

### 2. Terminal UI Component

**Purpose:** Renders terminal using xterm.js and handles user input.

```typescript
// src/components/webcontainer-terminal/TerminalUI.tsx

export interface TerminalUIProps {
  onCommand: (command: string) => Promise<void>;
  onResize?: (cols: number, rows: number) => void;
  theme?: ITheme;
  readOnly?: boolean;
}

export const TerminalUI: React.FC<TerminalUIProps> = ({
  onCommand,
  onResize,
  theme,
  readOnly = false,
}) => {
  // xterm.js integration
  // Keyboard event handling
  // Output rendering
  // Clipboard support
};
```

### 3. Filesystem Sync Service

**Purpose:** Syncs WebContainer filesystem with IndexedDB and optionally Firebase.

```typescript
// src/lib/webcontainer/filesystem-sync.ts

export interface FilesystemSnapshot {
  timestamp: number;
  files: Record<string, string>;
  directories: string[];
}

export class FilesystemSync {
  async saveSnapshot(snapshot: FilesystemSnapshot): Promise<void>;
  async loadSnapshot(): Promise<FilesystemSnapshot | null>;
  async syncToFirebase(userId: string): Promise<void>;
  async restoreFromFirebase(userId: string): Promise<FilesystemSnapshot | null>;
  async clearLocal(): Promise<void>;
}
```

### 4. React Hook for WebContainer

**Purpose:** Provides React integration for WebContainer management.

```typescript
// src/hooks/useWebContainer.ts

export interface UseWebContainerReturn {
  status: 'uninitialized' | 'loading' | 'ready' | 'error';
  error: Error | null;
  executeCommand: (command: string) => Promise<CommandResult>;
  reset: () => Promise<void>;
  isReady: boolean;
}

export function useWebContainer(): UseWebContainerReturn;
```

## Data Models

### WebContainer State

```typescript
interface WebContainerState {
  status: 'uninitialized' | 'loading' | 'ready' | 'error';
  instance: WebContainer | null;
  error: Error | null;
  workdir: string;
  lastActivity: Date;
}
```

### Filesystem Snapshot

```typescript
interface FilesystemSnapshot {
  version: number;
  timestamp: number;
  userId?: string;
  files: {
    [path: string]: {
      content: string;
      permissions: number;
      modified: Date;
    };
  };
  directories: string[];
  metadata: {
    totalSize: number;
    fileCount: number;
  };
}
```

### Terminal Session

```typescript
interface TerminalSession {
  id: string;
  userId?: string;
  startTime: Date;
  lastActivity: Date;
  commandHistory: string[];
  workingDirectory: string;
  environment: Record<string, string>;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Command Execution Consistency
*For any* valid Linux command string, executing it in the WebContainer should produce output consistent with standard Linux behavior
**Validates: Requirements 1.5, 3.1, 3.2, 3.3, 3.4**

### Property 2: Filesystem Persistence Round-Trip
*For any* filesystem state, saving to IndexedDB and then restoring should produce an equivalent filesystem state
**Validates: Requirements 2.1, 2.2**

### Property 3: Filesystem Operation Correctness
*For any* file manipulation command (cp, mv, rm, mkdir), the resulting filesystem state should reflect the expected changes
**Validates: Requirements 3.2**

### Property 4: Command History Navigation
*For any* command history list, pressing up/down arrows should cycle through commands in reverse chronological order
**Validates: Requirements 4.2**

### Property 5: Autocompletion Validity
*For any* partial command or path, tab completion suggestions should be valid completions that exist in the filesystem or command list
**Validates: Requirements 4.3**

### Property 6: Reset Idempotence
*For any* filesystem state, performing a reset should always result in the same default initial state
**Validates: Requirements 5.2, 5.3**

### Property 7: Firebase Sync Consistency
*For any* authenticated user, filesystem changes should eventually be reflected in Firestore (eventual consistency)
**Validates: Requirements 2.3**

### Property 8: AI Command Safety Validation
*For any* AI-suggested command, it should pass safety validation before being marked as executable
**Validates: Requirements 10.4**

## Error Handling

### Error Categories

1. **Initialization Errors**
   - Browser incompatibility
   - WebContainer API unavailable
   - Memory constraints
   - Network failures during asset download

2. **Runtime Errors**
   - Command execution failures
   - Filesystem operation errors
   - Process crashes
   - Memory exhaustion

3. **Storage Errors**
   - IndexedDB quota exceeded
   - Firestore sync failures
   - Corrupted snapshot data

4. **User Input Errors**
   - Invalid commands
   - Permission denied
   - File not found

### Error Handling Strategy

```typescript
class WebContainerError extends Error {
  constructor(
    message: string,
    public code: string,
    public recoverable: boolean,
    public userMessage: string
  ) {
    super(message);
  }
}

// Error codes
const ErrorCodes = {
  INIT_FAILED: 'INIT_FAILED',
  BROWSER_UNSUPPORTED: 'BROWSER_UNSUPPORTED',
  MEMORY_INSUFFICIENT: 'MEMORY_INSUFFICIENT',
  STORAGE_QUOTA_EXCEEDED: 'STORAGE_QUOTA_EXCEEDED',
  COMMAND_FAILED: 'COMMAND_FAILED',
  SYNC_FAILED: 'SYNC_FAILED',
} as const;
```

### Recovery Mechanisms

1. **Automatic Retry**: Network-related errors retry with exponential backoff
2. **Graceful Degradation**: If Firebase sync fails, continue with local-only mode
3. **State Recovery**: If WebContainer crashes, attempt to restore from last snapshot
4. **User Notification**: Clear error messages with actionable steps

## Testing Strategy

### Unit Testing

**Framework:** Jest + React Testing Library

**Coverage:**
- WebContainer Manager initialization and lifecycle
- Filesystem sync operations (save/load/sync)
- Command parsing and validation
- Error handling and recovery
- Browser compatibility detection

**Example Tests:**
```typescript
describe('WebContainerManager', () => {
  it('should initialize successfully', async () => {
    const manager = new WebContainerManager();
    await manager.initialize();
    expect(manager.getStatus()).toBe('ready');
  });
  
  it('should execute commands and return results', async () => {
    const result = await manager.executeCommand('echo "hello"');
    expect(result.stdout).toBe('hello\n');
    expect(result.exitCode).toBe(0);
  });
});
```

### Property-Based Testing

**Framework:** fast-check (JavaScript property testing library)

**Configuration:** Minimum 100 iterations per property test

**Property Tests:**

1. **Property 1: Command Execution Consistency**
   ```typescript
   // Feature: webcontainer-terminal, Property 1: Command Execution Consistency
   it('should execute commands consistently', async () => {
     await fc.assert(
       fc.asyncProperty(
         fc.array(fc.string(), { minLength: 1, maxLength: 10 }),
         async (commands) => {
           for (const cmd of commands) {
             const result1 = await executeCommand(cmd);
             const result2 = await executeCommand(cmd);
             expect(result1.stdout).toBe(result2.stdout);
           }
         }
       ),
       { numRuns: 100 }
     );
   });
   ```

2. **Property 2: Filesystem Persistence Round-Trip**
   ```typescript
   // Feature: webcontainer-terminal, Property 2: Filesystem Persistence Round-Trip
   it('should preserve filesystem state through save/load cycle', async () => {
     await fc.assert(
       fc.asyncProperty(
         fc.record({
           files: fc.dictionary(fc.string(), fc.string()),
           directories: fc.array(fc.string()),
         }),
         async (fsState) => {
           await saveFilesystem(fsState);
           const restored = await loadFilesystem();
           expect(restored).toEqual(fsState);
         }
       ),
       { numRuns: 100 }
     );
   });
   ```

3. **Property 6: Reset Idempotence**
   ```typescript
   // Feature: webcontainer-terminal, Property 6: Reset Idempotence
   it('should always reset to same initial state', async () => {
     await fc.assert(
       fc.asyncProperty(
         fc.anything(),
         async (_) => {
           await reset();
           const state1 = await getFilesystemState();
           await reset();
           const state2 = await getFilesystemState();
           expect(state1).toEqual(state2);
         }
       ),
       { numRuns: 100 }
     );
   });
   ```

### Integration Testing

**Scenarios:**
- Full terminal session workflow (init → execute commands → save → restore)
- Firebase authentication and sync integration
- AI Command Helper integration with WebContainer
- Error recovery scenarios

### Performance Testing

**Metrics:**
- Initial load time (target: < 5 seconds on 4G)
- Command execution latency (target: < 100ms for simple commands)
- Memory usage (target: < 200MB for typical session)
- IndexedDB operation time (target: < 50ms for save/load)

## Performance Optimization

### 1. Lazy Loading
- Load WebContainer only when Terminal section is accessed
- Use dynamic imports for xterm.js and addons

### 2. Caching Strategy
- Service Worker for WebContainer assets
- Cache-first strategy with background updates
- IndexedDB for filesystem snapshots

### 3. Memory Management
- Limit command history to last 1000 commands
- Periodic cleanup of unused file handles
- Garbage collection hints for large operations

### 4. Network Optimization
- CDN for WebContainer assets
- Compression for filesystem snapshots
- Debounced Firebase sync (max 1 sync per 5 seconds)

## Security Considerations

### 1. Sandboxing
- WebContainer runs in isolated browser context
- No access to user's actual filesystem
- Limited network access (only to allowed origins)

### 2. Command Validation
- Whitelist of safe commands for AI suggestions
- Warning for potentially dangerous operations (rm -rf, etc.)
- No execution of commands with sudo/root privileges

### 3. Data Privacy
- Filesystem data stored locally by default
- Optional cloud sync with user consent
- No command logging without explicit opt-in

### 4. Resource Limits
- Maximum filesystem size: 100MB per user
- Maximum command execution time: 30 seconds
- Rate limiting for command execution

## Deployment Strategy

### Phase 1: Development (Week 1-2)
- Set up WebContainer integration
- Implement core terminal UI
- Basic filesystem operations

### Phase 2: Testing (Week 3)
- Unit and property tests
- Performance testing
- Browser compatibility testing

### Phase 3: Beta Release (Week 4)
- Deploy to staging environment
- Limited user testing (100 students)
- Monitor performance and errors

### Phase 4: Production (Week 5)
- Full rollout to all students
- Monitor usage and performance
- Iterate based on feedback

## Monitoring and Analytics

### Key Metrics
- WebContainer initialization success rate
- Average command execution time
- Error rates by category
- Browser compatibility issues
- Storage usage per user
- Firebase sync success rate

### Logging
- Client-side error logging to Firebase
- Performance metrics to Analytics
- Optional command history (with consent)

## Migration Plan

### From Current System to WebContainer

1. **Parallel Running**: Keep both systems available initially
2. **Feature Flag**: Toggle between old and new terminal
3. **Gradual Rollout**: Enable for 10% → 50% → 100% of users
4. **Data Migration**: No migration needed (fresh start for all users)
5. **Fallback**: Ability to revert to old system if critical issues

## Future Enhancements

1. **Collaborative Terminals**: Multiple students sharing same terminal session
2. **Recording/Playback**: Record terminal sessions for review
3. **Custom Environments**: Pre-configured environments for specific experiments
4. **IDE Integration**: Code editor alongside terminal
5. **Package Management**: Install additional tools (gcc, python, etc.)
