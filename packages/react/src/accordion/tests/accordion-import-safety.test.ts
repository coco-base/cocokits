// @vitest-environment node
import { describe, expect, it } from 'vitest';

describe('@cocokits/react/accordion import safety', () => {
  it('imports in plain Node, without window or document, and exports the namespace and the parts', async () => {
    expect(typeof document).toBe('undefined');
    const entry = await import('../index');
    expect(Object.keys(entry).sort()).toEqual([
      'Accordion',
      'AccordionContent',
      'AccordionHeader',
      'AccordionItem',
      'AccordionRoot',
      'AccordionTrigger',
    ]);
    expect(entry.Accordion.Root).toBe(entry.AccordionRoot);
    expect(entry.Accordion.Item).toBe(entry.AccordionItem);
    expect(entry.Accordion.Header).toBe(entry.AccordionHeader);
    expect(entry.Accordion.Trigger).toBe(entry.AccordionTrigger);
    expect(entry.Accordion.Content).toBe(entry.AccordionContent);
    expect(
      [
        entry.AccordionRoot,
        entry.AccordionItem,
        entry.AccordionHeader,
        entry.AccordionTrigger,
        entry.AccordionContent,
      ].map((part) => part.displayName),
    ).toEqual(['Accordion.Root', 'Accordion.Item', 'Accordion.Header', 'Accordion.Trigger', 'Accordion.Content']);
  });
});
