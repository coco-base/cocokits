// @vitest-environment node
import { describe, expect, it } from 'vitest';

describe('@cocokits/react/menu import safety', () => {
  it('imports in plain Node, without window or document, and exports the namespace and the parts', async () => {
    expect(typeof document).toBe('undefined');
    const entry = await import('../index');
    expect(Object.keys(entry).sort()).toEqual(['Menu', 'MenuContent', 'MenuItem', 'MenuRoot', 'MenuTrigger']);
    expect(entry.Menu.Root).toBe(entry.MenuRoot);
    expect(entry.Menu.Trigger).toBe(entry.MenuTrigger);
    expect(entry.Menu.Content).toBe(entry.MenuContent);
    expect(entry.Menu.Item).toBe(entry.MenuItem);
    expect(
      [entry.MenuRoot, entry.MenuTrigger, entry.MenuContent, entry.MenuItem].map((part) => part.displayName),
    ).toEqual(['Menu.Root', 'Menu.Trigger', 'Menu.Content', 'Menu.Item']);
  });
});
