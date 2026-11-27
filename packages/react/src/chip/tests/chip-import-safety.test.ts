// @vitest-environment node
import { describe, expect, it } from 'vitest';

describe('@cocokits/react/chip import safety', () => {
  it('imports without window or document and exports the component', async () => {
    expect(typeof document).toBe('undefined');
    const entry = await import('../index');
    expect(Object.keys(entry)).toEqual(['Chip']);
    expect(entry.Chip.displayName).toBe('Chip');
  });
});
