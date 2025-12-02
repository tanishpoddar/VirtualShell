// Polyfill for localStorage on server-side
if (typeof window === 'undefined') {
  // @ts-ignore
  global.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
    key: () => null,
    length: 0,
  };
}

export {};
