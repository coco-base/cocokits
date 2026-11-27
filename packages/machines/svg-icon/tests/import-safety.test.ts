import { describe, expect, it } from 'vitest';

describe('@cocokits/machines/svg-icon import safety', () => {
  it('imports in node without window or document', async () => {
    expect(typeof document).toBe('undefined');
    expect(typeof window).toBe('undefined');
    const entry = await import('../index');
    expect(Object.keys(entry).sort()).toEqual(['getSvgIconProps', 'svgIconAnatomy', 'svgIconMeta']);
  });
});
