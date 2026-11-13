// @vitest-environment node
import { describe, expect, it } from 'vitest';

describe('@cocokits/react/svg-icon import safety', () => {
  it('imports without window or document', async () => {
    expect(typeof document).toBe('undefined');
    const mod = await import('../index');
    expect(typeof mod.SvgIcon).toBe('function');
    expect(mod.SvgIcon.displayName).toBe('SvgIcon');
  });
});
