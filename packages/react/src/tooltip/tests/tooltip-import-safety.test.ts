// @vitest-environment node
import { describe, expect, it } from 'vitest';

describe('@cocokits/react/tooltip import safety', () => {
  it('imports in plain Node, without window or document, and exports the namespace and the parts', async () => {
    expect(typeof document).toBe('undefined');
    const entry = await import('../index');
    expect(Object.keys(entry).sort()).toEqual([
      'Tooltip',
      'TooltipArrow',
      'TooltipContent',
      'TooltipProvider',
      'TooltipRoot',
      'TooltipTrigger',
    ]);
    expect(entry.Tooltip.Provider).toBe(entry.TooltipProvider);
    expect(entry.Tooltip.Root).toBe(entry.TooltipRoot);
    expect(entry.Tooltip.Trigger).toBe(entry.TooltipTrigger);
    expect(entry.Tooltip.Content).toBe(entry.TooltipContent);
    expect(entry.Tooltip.Arrow).toBe(entry.TooltipArrow);
    expect(
      [entry.TooltipProvider, entry.TooltipRoot, entry.TooltipTrigger, entry.TooltipContent].map(
        (part) => part.displayName,
      ),
    ).toEqual(['Tooltip.Provider', 'Tooltip.Root', 'Tooltip.Trigger', 'Tooltip.Content']);
  });
});
