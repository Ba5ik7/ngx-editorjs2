import 'zone.js';
import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import { afterEach } from 'vitest';

// Type alias for mocked objects - compatible with Vitest
type MockedObject<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any
    ? ReturnType<typeof vi.fn> & T[K]
    : T[K];
};

// Make MockedObject available globally
declare global {
  type MockedObject<T> = {
    [K in keyof T]: T[K] extends (...args: any[]) => any
      ? ReturnType<typeof vi.fn> & T[K]
      : T[K];
  };
}

// Initialize the Angular testing environment
try {
  getTestBed().initTestEnvironment(
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting(),
  );
} catch (e) {
  // Environment might already be initialized
  console.log('Test environment already initialized');
}

// Reset test module after each test
afterEach(() => {
  try {
    getTestBed().resetTestingModule();
  } catch (e) {
    // Ignore errors on reset
  }
});
