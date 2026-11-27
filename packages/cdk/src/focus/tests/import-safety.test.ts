import { describe, expect, it } from 'vitest';

describe('@cocokits/cdk/focus import safety', () => {
  it('imports in node without window or document', async () => {
    expect(typeof document).toBe('undefined');
    const entry = await import('../index');
    expect(Object.keys(entry).sort()).toEqual([
      'captureFocusReturn',
      'connectFocusGuards',
      'deepActiveElement',
      'focusFirst',
      'getTabbables',
      'makeOutsideInert',
      'scheduleFocus',
      'trackFocusVisible',
    ]);
  });
});
