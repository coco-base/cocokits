// @vitest-environment node
import { describe, expect, it } from 'vitest';

describe('@cocokits/react/popover import safety', () => {
  it('imports in plain Node, without window or document, and exports the namespace and the parts', async () => {
    expect(typeof document).toBe('undefined');
    const entry = await import('../index');
    expect(Object.keys(entry).sort()).toEqual([
      'Popover',
      'PopoverAnchor',
      'PopoverArrow',
      'PopoverClose',
      'PopoverContent',
      'PopoverDescription',
      'PopoverRoot',
      'PopoverTitle',
      'PopoverTrigger',
    ]);
    expect(entry.Popover.Root).toBe(entry.PopoverRoot);
    expect(entry.Popover.Trigger).toBe(entry.PopoverTrigger);
    expect(entry.Popover.Content).toBe(entry.PopoverContent);
    expect(entry.Popover.Close).toBe(entry.PopoverClose);
    expect(entry.Popover.Anchor).toBe(entry.PopoverAnchor);
    expect(entry.Popover.Arrow).toBe(entry.PopoverArrow);
    expect(entry.Popover.Title).toBe(entry.PopoverTitle);
    expect(entry.Popover.Description).toBe(entry.PopoverDescription);
    expect(
      [entry.PopoverRoot, entry.PopoverTrigger, entry.PopoverContent, entry.PopoverClose].map(
        (part) => part.displayName,
      ),
    ).toEqual(['Popover.Root', 'Popover.Trigger', 'Popover.Content', 'Popover.Close']);
  });
});
