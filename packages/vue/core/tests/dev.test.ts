import { afterEach, describe, expect, it, vi } from 'vitest';
import { isDevelopment } from '../src/dev';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('isDevelopment', () => {
  it('follows NODE_ENV', () => {
    vi.stubEnv('NODE_ENV', 'development');
    expect(isDevelopment()).toBe(true);
    vi.stubEnv('NODE_ENV', 'production');
    expect(isDevelopment()).toBe(false);
  });

  it('is false when there is no process and nothing replaced the expression', () => {
    vi.stubGlobal('process', undefined);
    expect(isDevelopment()).toBe(false);
  });
});
