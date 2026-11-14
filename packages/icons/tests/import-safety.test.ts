import { describe, expect, it } from 'vitest';

describe('@cocokits/icons import safety', () => {
  it('imports in node without window or document', async () => {
    expect(typeof document).toBe('undefined');
    expect(typeof window).toBe('undefined');
    const entry = await import('../src/index');
    expect(entry.checkIcon.body.length).toBeGreaterThan(0);
  });
});
