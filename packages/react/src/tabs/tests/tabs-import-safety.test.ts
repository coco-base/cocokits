// @vitest-environment node
import { describe, expect, it } from 'vitest';

describe('@cocokits/react/tabs import safety', () => {
  it('imports in plain Node, without window or document, and exports the namespace and the parts', async () => {
    expect(typeof document).toBe('undefined');
    const entry = await import('../index');
    expect(Object.keys(entry).sort()).toEqual([
      'Tabs',
      'TabsContent',
      'TabsIndicator',
      'TabsList',
      'TabsRoot',
      'TabsTrigger',
    ]);
    expect(entry.Tabs.Root).toBe(entry.TabsRoot);
    expect(entry.Tabs.List).toBe(entry.TabsList);
    expect(entry.Tabs.Trigger).toBe(entry.TabsTrigger);
    expect(entry.Tabs.Indicator).toBe(entry.TabsIndicator);
    expect(entry.Tabs.Content).toBe(entry.TabsContent);
    expect(
      [entry.TabsRoot, entry.TabsList, entry.TabsTrigger, entry.TabsIndicator, entry.TabsContent].map(
        (part) => part.displayName,
      ),
    ).toEqual(['Tabs.Root', 'Tabs.List', 'Tabs.Trigger', 'Tabs.Indicator', 'Tabs.Content']);
  });
});
