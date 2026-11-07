// @vitest-environment node
import { describe, expect, it } from 'vitest';

describe('@cocokits/react/select import safety', () => {
  it('imports in plain Node, without window or document, and exports the namespace and the parts', async () => {
    expect(typeof document).toBe('undefined');
    const entry = await import('../index');
    const parts = [
      'Root',
      'Trigger',
      'Value',
      'Icon',
      'Content',
      'Item',
      'ItemText',
      'ItemIndicator',
      'Group',
      'Label',
      'Separator',
    ];
    expect(Object.keys(entry).sort()).toEqual(['Select', ...parts.map((part) => `Select${part}`)].sort());
    expect(Object.keys(entry.Select).sort()).toEqual([...parts].sort());
    for (const part of parts) {
      const exported = entry[`Select${part}` as keyof typeof entry];
      expect(entry.Select[part as keyof typeof entry.Select]).toBe(exported);
      expect((exported as { displayName: string }).displayName).toBe(`Select.${part}`);
    }
  });
});
