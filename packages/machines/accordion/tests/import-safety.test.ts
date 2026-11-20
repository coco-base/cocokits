import { describe, expect, it } from 'vitest';

describe('@cocokits/machines/accordion import safety', () => {
  it('imports in node without window or document', async () => {
    expect(typeof document).toBe('undefined');
    expect(typeof window).toBe('undefined');
    const entry = await import('../index');
    expect(Object.keys(entry).sort()).toEqual([
      'accordionAnatomy',
      'accordionContentSizeVariables',
      'accordionIds',
      'accordionKeymap',
      'accordionMeta',
      'getAccordionItemProps',
      'getAccordionProps',
      'transitionAccordion',
    ]);
  });
});
