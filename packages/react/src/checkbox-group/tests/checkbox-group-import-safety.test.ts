// @vitest-environment node
import { describe, expect, it } from 'vitest';

describe('@cocokits/react/checkbox-group import safety', () => {
  it('imports without window or document and exports the component', async () => {
    expect(typeof document).toBe('undefined');
    const entry = await import('../index');
    expect(Object.keys(entry)).toEqual(['CheckboxGroup']);
    expect(entry.CheckboxGroup.displayName).toBe('CheckboxGroup');
  });
});
