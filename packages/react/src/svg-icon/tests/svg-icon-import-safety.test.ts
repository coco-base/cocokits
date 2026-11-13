// @vitest-environment node
import { describe, expect, it } from 'vitest';

describe('@cocokits/react/svg-icon import safety', () => {
  it('imports without window or document', async () => {
    expect(typeof document).toBe('undefined');
    const mod = await import('../index');
    expect(typeof mod.SvgIcon).toBe('function');
    expect(mod.SvgIcon.displayName).toBe('SvgIcon');
    // The first dynamic import compiles the whole entry; under a parallel run it can pass the default timeout.
  }, 60_000);
});
