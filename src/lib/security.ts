/**
 * Security utilities and configurations
 */

// Rate limiting for auth operations
const authAttempts = new Map<string, { count: number; timestamp: number }>();

export const rateLimit = {
  /**
   * Check if an operation is rate limited
   * @param key - Unique identifier (e.g., IP address, user ID)
   * @param maxAttempts - Maximum attempts allowed
   * @param windowMs - Time window in milliseconds
   */
  check: (key: string, maxAttempts: number = 5, windowMs: number = 60000): boolean => {
    const now = Date.now();
    const attempt = authAttempts.get(key);

    if (!attempt) {
      authAttempts.set(key, { count: 1, timestamp: now });
      return true;
    }

    // Reset if window has passed
    if (now - attempt.timestamp > windowMs) {
      authAttempts.set(key, { count: 1, timestamp: now });
      return true;
    }

    // Check if limit exceeded
    if (attempt.count >= maxAttempts) {
      return false;
    }

    // Increment count
    attempt.count++;
    return true;
  },

  /**
   * Reset rate limit for a key
   */
  reset: (key: string): void => {
    authAttempts.delete(key);
  },

  /**
   * Clean up old entries (call periodically)
   */
  cleanup: (windowMs: number = 60000): void => {
    const now = Date.now();
    for (const [key, attempt] of authAttempts.entries()) {
      if (now - attempt.timestamp > windowMs) {
        authAttempts.delete(key);
      }
    }
  },
};

// Input sanitization
export const sanitize = {
  /**
   * Sanitize user input to prevent XSS
   */
  input: (input: string): string => {
    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  },

  /**
   * Sanitize email
   */
  email: (email: string): string => {
    return email.toLowerCase().trim();
  },

  /**
   * Validate email format
   */
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
};

// Environment validation
export const validateEnv = (): void => {
  const required = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0 && process.env.NODE_ENV === 'development') {
    console.error('Missing required environment variables:', missing);
  }
};

// Security headers validation
export const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

// Clean up rate limit cache every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => rateLimit.cleanup(), 5 * 60 * 1000);
}
