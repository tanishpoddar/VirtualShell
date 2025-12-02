// This file runs before any other code in Next.js
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Polyfill localStorage for server-side to fix Genkit localStorage errors
    const mockStorage = {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
      key: () => null,
      length: 0,
    };
    
    // @ts-ignore
    global.localStorage = mockStorage;
    // @ts-ignore
    global.sessionStorage = mockStorage;
    
    // Also set on globalThis for better compatibility
    // @ts-ignore
    globalThis.localStorage = mockStorage;
    // @ts-ignore
    globalThis.sessionStorage = mockStorage;
  }
}
