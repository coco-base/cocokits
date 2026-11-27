// @vitest-environment node
import { describe, expect, it } from 'vitest';

describe('@cocokits/react/icon-button import safety', () => {
  it('imports without window or document', async () => {
    expect(typeof document).toBe('undefined');
    const mod = await import('../index');
    expect(typeof mod.IconButton).toBe('function');
    expect(mod.IconButton.displayName).toBe('IconButton');
  });
});
