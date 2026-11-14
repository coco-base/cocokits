import { describe, expect, it } from 'vitest';

describe('shouldFocusControl import', () => {
  it('touches no window or document', async () => {
    expect(typeof (globalThis as { window?: unknown }).window).toBe('undefined');
    const { shouldFocusControl } = await import('../src/index');
    expect(typeof shouldFocusControl).toBe('function');
  });
});
