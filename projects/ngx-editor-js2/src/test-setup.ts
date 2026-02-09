import 'zone.js';
import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

// Initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
);

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
