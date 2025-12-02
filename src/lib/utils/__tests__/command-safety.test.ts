/**
 * @jest-environment jsdom
 */

import { validateCommandSafety, isCommandAllowed, sanitizeCommand } from '../command-safety';
import * as fc from 'fast-check';

describe('Command Safety', () => {
  describe('Dangerous Commands', () => {
    it('should block rm -rf /', () => {
      const result = validateCommandSafety('rm -rf /');
      expect(result.isSafe).toBe(false);
      expect(result.isDangerous).toBe(true);
    });

    it('should block rm -rf *', () => {
      const result = validateCommandSafety('rm -rf *');
      expect(result.isSafe).toBe(false);
      expect(result.isDangerous).toBe(true);
    });

    it('should block mkfs commands', () => {
      const result = validateCommandSafety('mkfs.ext4 /dev/sda1');
      expect(result.isSafe).toBe(false);
      expect(result.isDangerous).toBe(true);
    });

    it('should block dd commands to /dev/zero', () => {
      const result = validateCommandSafety('dd if=/dev/zero of=/dev/sda');
      expect(result.isSafe).toBe(false);
      expect(result.isDangerous).toBe(true);
    });
  });

  describe('Warning Commands', () => {
    it('should warn about recursive delete', () => {
      const result = validateCommandSafety('rm -r /tmp/test');
      expect(result.isSafe).toBe(true);
      expect(result.isDangerous).toBe(false);
      expect(result.warning).toBeDefined();
    });

    it('should warn about chmod 777', () => {
      const result = validateCommandSafety('chmod -R 777 /var/www');
      expect(result.isSafe).toBe(true);
      expect(result.warning).toBeDefined();
    });
  });

  describe('Safe Commands', () => {
    it('should allow ls', () => {
      const result = validateCommandSafety('ls -la');
      expect(result.isSafe).toBe(true);
      expect(result.isDangerous).toBe(false);
      expect(result.warning).toBeUndefined();
    });

    it('should allow cat', () => {
      const result = validateCommandSafety('cat file.txt');
      expect(result.isSafe).toBe(true);
      expect(result.isDangerous).toBe(false);
    });

    it('should allow grep', () => {
      const result = validateCommandSafety('grep "pattern" file.txt');
      expect(result.isSafe).toBe(true);
      expect(result.isDangerous).toBe(false);
    });
  });

  describe('Command Sanitization', () => {
    it('should remove dangerous characters', () => {
      expect(sanitizeCommand('ls; rm -rf /')).toBe('ls rm -rf /');
      expect(sanitizeCommand('cat file.txt | grep test')).toBe('cat file.txt  grep test');
      expect(sanitizeCommand('echo `whoami`')).toBe('echo whoami');
    });
  });

  describe('isCommandAllowed', () => {
    it('should return false for dangerous commands', () => {
      expect(isCommandAllowed('rm -rf /')).toBe(false);
      expect(isCommandAllowed('mkfs.ext4 /dev/sda')).toBe(false);
    });

    it('should return true for safe commands', () => {
      expect(isCommandAllowed('ls -la')).toBe(true);
      expect(isCommandAllowed('cat file.txt')).toBe(true);
    });
  });

  /**
   * Feature: webcontainer-terminal, Property 8: AI Command Safety Validation
   * Validates: Requirements 10.4
   */
  it('should validate command safety consistently (property test)', async () => {
    await fc.assert(
      fc.property(
        fc.oneof(
          fc.constantFrom('ls', 'cat', 'grep', 'pwd', 'echo', 'cd'),
          fc.constantFrom('rm -rf /', 'mkfs', 'dd if=/dev/zero'),
          fc.string({ minLength: 1, maxLength: 50 })
        ),
        (command) => {
          const result = validateCommandSafety(command);

          // Result should always have required fields
          expect(result).toHaveProperty('isSafe');
          expect(result).toHaveProperty('isDangerous');

          // If dangerous, should not be safe
          if (result.isDangerous) {
            expect(result.isSafe).toBe(false);
            expect(result.warning).toBeDefined();
          }

          // isCommandAllowed should match safety check
          const allowed = isCommandAllowed(command);
          expect(allowed).toBe(result.isSafe && !result.isDangerous);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle edge cases', () => {
    expect(validateCommandSafety('')).toHaveProperty('isSafe');
    expect(validateCommandSafety('   ')).toHaveProperty('isSafe');
    expect(validateCommandSafety('rm')).toHaveProperty('isSafe');
  });
});
