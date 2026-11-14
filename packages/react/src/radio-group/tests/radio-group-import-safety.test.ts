// @vitest-environment node
import { describe, expect, it } from 'vitest';

describe('@cocokits/react/radio-group import safety', () => {
  it('imports in plain Node, without window or document, and exports the group', async () => {
    expect(typeof document).toBe('undefined');
    const entry = await import('../index');
    expect(Object.keys(entry)).toEqual(['RadioGroup']);
    expect(entry.RadioGroup.displayName).toBe('RadioGroup');
  });
});
