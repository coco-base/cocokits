// @vitest-environment node
import { describe, expect, it } from 'vitest';

describe('@cocokits/react/tab-nav import safety', () => {
  it('imports in plain Node, without window or document, and exports the namespace and the parts', async () => {
    expect(typeof document).toBe('undefined');
    const entry = await import('../index');
    expect(Object.keys(entry).sort()).toEqual([
      'TabNav',
      'TabNavIndicator',
      'TabNavLink',
      'TabNavList',
      'TabNavPanel',
      'TabNavRoot',
    ]);
    expect(entry.TabNav.Root).toBe(entry.TabNavRoot);
    expect(entry.TabNav.List).toBe(entry.TabNavList);
    expect(entry.TabNav.Link).toBe(entry.TabNavLink);
    expect(entry.TabNav.Indicator).toBe(entry.TabNavIndicator);
    expect(entry.TabNav.Panel).toBe(entry.TabNavPanel);
    expect(
      [entry.TabNavRoot, entry.TabNavList, entry.TabNavLink, entry.TabNavIndicator, entry.TabNavPanel].map(
        (part) => part.displayName,
      ),
    ).toEqual(['TabNav.Root', 'TabNav.List', 'TabNav.Link', 'TabNav.Indicator', 'TabNav.Panel']);
  });
});
