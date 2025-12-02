'use client';

export interface BrowserCompatibility {
  isSupported: boolean;
  hasWebAssembly: boolean;
  hasSharedArrayBuffer: boolean;
  hasIndexedDB: boolean;
  hasServiceWorker: boolean;
  estimatedMemory?: number;
  warnings: string[];
  errors: string[];
}

export function checkBrowserCompatibility(): BrowserCompatibility {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Check WebAssembly support
  const hasWebAssembly = typeof WebAssembly !== 'undefined';
  if (!hasWebAssembly) {
    errors.push('WebAssembly is not supported in this browser');
  }

  // Check SharedArrayBuffer support (required for WebContainer)
  const hasSharedArrayBuffer = typeof SharedArrayBuffer !== 'undefined';
  if (!hasSharedArrayBuffer) {
    errors.push('SharedArrayBuffer is not available. WebContainer requires cross-origin isolation.');
  }

  // Check IndexedDB support
  const hasIndexedDB = typeof indexedDB !== 'undefined';
  if (!hasIndexedDB) {
    warnings.push('IndexedDB is not available. Filesystem persistence will not work.');
  }

  // Check Service Worker support
  const hasServiceWorker = 'serviceWorker' in navigator;
  if (!hasServiceWorker) {
    warnings.push('Service Workers are not supported. Offline functionality will be limited.');
  }

  // Estimate available memory
  let estimatedMemory: number | undefined;
  if ('deviceMemory' in navigator) {
    estimatedMemory = (navigator as any).deviceMemory * 1024; // Convert GB to MB
    if (estimatedMemory < 2048) {
      warnings.push('Low device memory detected. WebContainer may run slowly.');
    }
  }

  const isSupported = hasWebAssembly && hasSharedArrayBuffer;

  return {
    isSupported,
    hasWebAssembly,
    hasSharedArrayBuffer,
    hasIndexedDB,
    hasServiceWorker,
    estimatedMemory,
    warnings,
    errors,
  };
}

export function getBrowserInfo(): {
  name: string;
  version: string;
  isChrome: boolean;
  isFirefox: boolean;
  isSafari: boolean;
  isEdge: boolean;
} {
  const userAgent = navigator.userAgent;

  const isChrome = /Chrome/.test(userAgent) && /Google Inc/.test(navigator.vendor);
  const isFirefox = /Firefox/.test(userAgent);
  const isSafari = /Safari/.test(userAgent) && /Apple Computer/.test(navigator.vendor);
  const isEdge = /Edg/.test(userAgent);

  let name = 'Unknown';
  let version = 'Unknown';

  if (isEdge) {
    name = 'Edge';
    const match = userAgent.match(/Edg\/(\d+)/);
    version = match ? match[1] : 'Unknown';
  } else if (isChrome) {
    name = 'Chrome';
    const match = userAgent.match(/Chrome\/(\d+)/);
    version = match ? match[1] : 'Unknown';
  } else if (isFirefox) {
    name = 'Firefox';
    const match = userAgent.match(/Firefox\/(\d+)/);
    version = match ? match[1] : 'Unknown';
  } else if (isSafari) {
    name = 'Safari';
    const match = userAgent.match(/Version\/(\d+)/);
    version = match ? match[1] : 'Unknown';
  }

  return {
    name,
    version,
    isChrome,
    isFirefox,
    isSafari,
    isEdge,
  };
}

export function getRecommendedBrowsers(): string[] {
  return [
    'Chrome 92+',
    'Edge 92+',
    'Firefox 95+',
    'Safari 16.4+',
  ];
}

export function isRecommendedBrowser(): boolean {
  const browser = getBrowserInfo();
  const version = parseInt(browser.version, 10);

  if (browser.isChrome && version >= 92) return true;
  if (browser.isEdge && version >= 92) return true;
  if (browser.isFirefox && version >= 95) return true;
  if (browser.isSafari && version >= 16) return true;

  return false;
}
