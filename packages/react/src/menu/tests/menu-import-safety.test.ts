// @vitest-environment node
import { describe, expect, it } from 'vitest';

const PARTS = [
  'Root',
  'Trigger',
  'Content',
  'Item',
  'CheckboxItem',
  'RadioGroup',
  'RadioItem',
  'ItemIndicator',
  'Group',
  'GroupLabel',
  'ItemLeading',
  'ItemTrailing',
  'ItemSupportingText',
  'ItemShortcut',
  'Sub',
  'SubTrigger',
  'SubContent',
] as const;

describe('@cocokits/react/menu import safety', () => {
  it('imports in plain Node, without window or document, and exports the namespace and the parts', async () => {
    expect(typeof document).toBe('undefined');
    const entry = await import('../index');
    expect(Object.keys(entry).sort()).toEqual(['Menu', ...PARTS.map((part) => `Menu${part}`)].sort());
    for (const part of PARTS) {
      const component = entry[`Menu${part}` as keyof typeof entry] as { displayName: string };
      expect(entry.Menu[part]).toBe(component);
      expect(component.displayName).toBe(`Menu.${part}`);
    }
  });
});
