import { describe, expect, it } from 'vitest';

describe('@cocokits/cdk/presence import safety', () => {
  it('imports in node without window or document', async () => {
    expect(typeof document).toBe('undefined');
    const entry = await import('../index');
    expect(Object.keys(entry)).toEqual(['createPresence', 'waitForAnimations']);
  });
});
