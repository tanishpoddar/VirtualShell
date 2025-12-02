'use client';

export interface CommandSafetyResult {
  isSafe: boolean;
  isDangerous: boolean;
  warning?: string;
  reason?: string;
}

const DANGEROUS_PATTERNS = [
  /rm\s+-rf\s+\//, // rm -rf /
  /rm\s+-rf\s+\*/, // rm -rf *
  /:\(\)\{\s*:\|:&\s*\};:/, // Fork bomb
  /dd\s+if=\/dev\/zero/, // Disk wipe
  /mkfs/, // Format filesystem
  />\s*\/dev\/sda/, // Write to disk
];

const DANGEROUS_COMMANDS = [
  'mkfs',
  'fdisk',
  'parted',
  'dd',
];

const WARNING_PATTERNS = [
  /rm\s+-r/, // Recursive delete
  /chmod\s+-R\s+777/, // Dangerous permissions
  /chown\s+-R/, // Recursive ownership change
];

export function validateCommandSafety(command: string): CommandSafetyResult {
  const trimmedCommand = command.trim();

  // Check for dangerous patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(trimmedCommand)) {
      return {
        isSafe: false,
        isDangerous: true,
        warning: 'This command is potentially destructive and has been blocked.',
        reason: 'Matches dangerous pattern that could cause system damage',
      };
    }
  }

  // Check for dangerous commands
  const firstWord = trimmedCommand.split(/\s+/)[0];
  if (DANGEROUS_COMMANDS.includes(firstWord)) {
    return {
      isSafe: false,
      isDangerous: true,
      warning: 'This command is potentially destructive and has been blocked.',
      reason: `Command '${firstWord}' is not allowed`,
    };
  }

  // Check for warning patterns
  for (const pattern of WARNING_PATTERNS) {
    if (pattern.test(trimmedCommand)) {
      return {
        isSafe: true,
        isDangerous: false,
        warning: 'This command could have unintended consequences. Proceed with caution.',
        reason: 'Command may affect multiple files or directories',
      };
    }
  }

  return {
    isSafe: true,
    isDangerous: false,
  };
}

export function sanitizeCommand(command: string): string {
  // Remove potentially dangerous characters
  return command.replace(/[;&|`$()]/g, '');
}

export function isCommandAllowed(command: string): boolean {
  const result = validateCommandSafety(command);
  return result.isSafe && !result.isDangerous;
}
