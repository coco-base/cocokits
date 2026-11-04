import { render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { accordionAnatomy, accordionMeta } from '@cocokits/machines/accordion';
import { describe, expect, it } from 'vitest';
import { CckAccordionImports } from '../index';

describe('Accordion data attributes', () => {
  it('only emits data-* declared in the meta, on every part', async () => {
    const user = userEvent.setup();
    await render(
      `<div cckAccordion>
        <div cckAccordionItem label="A" [expanded]="true">A body</div>
        <div cckAccordionItem label="B" disabled>B body</div>
      </div>`,
      { imports: [...CckAccordionImports] },
    );
    await user.tab();
    const declared: Readonly<Record<string, readonly string[]>> = accordionMeta.dataAttrs;
    let checked = 0;
    for (const [part, allowed] of Object.entries(declared)) {
      for (const el of document.querySelectorAll(`.${(accordionAnatomy.classes as Record<string, string>)[part]}`)) {
        const names = Array.from(el.attributes, (a) => a.name).filter((n) => n.startsWith('data-'));
        expect(
          names.filter((n) => !allowed.includes(n)),
          part,
        ).toEqual([]);
        checked++;
      }
    }
    expect(checked).toBeGreaterThan(5);
  });

  it('renders data-focus-visible on the trigger that the keyboard focused', async () => {
    const user = userEvent.setup();
    await render(`<div cckAccordion><div cckAccordionItem label="A">A</div></div>`, {
      imports: [...CckAccordionImports],
    });
    await user.tab();
    expect(document.querySelector('button')?.hasAttribute('data-focus-visible')).toBe(true);
  });
});
