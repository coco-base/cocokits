// @vitest-environment node
import { describe, expect, it } from 'vitest';

describe('react-core import safety', () => {
  it('imports without window or document', async () => {
    expect(typeof document).toBe('undefined');
    const mod = await import('../src/index');
    expect(typeof mod.Portal).toBe('function');
    expect(typeof mod.DirectionProvider).toBe('function');
    expect(typeof mod.useThemeIcons).toBe('function');
  });
});
