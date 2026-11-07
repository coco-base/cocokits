import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { accordionAnatomy, accordionMeta } from '@cocokits/machines/accordion';
import { CckAccordionImports } from '../index';

const imports = [...CckAccordionImports];

const TEMPLATE = `
  <div cckAccordion>
    <div cckAccordionItem label="Shipping">Orders leave in two days.</div>
    <div cckAccordionItem label="Returns" [expanded]="true">Send it back.</div>
    <div cckAccordionItem label="Warranty" disabled>One year.</div>
  </div>`;

describe('Accordion accessibility', () => {
  it('has no axe violations when closed, open and disabled', async () => {
    const user = userEvent.setup();
    const { container } = await render(TEMPLATE, { imports });
    expect((await axe(container)).violations).toEqual([]);
    await user.click(screen.getByRole('button', { name: 'Shipping' }));
    expect((await axe(container)).violations).toEqual([]);
  });

  it('has no axe violations with a label template and a heading level', async () => {
    const { container } = await render(
      `<div cckAccordion multi>
        <div cckAccordionItem headingLevel="2"><ng-template cckAccordionLabel><b>Returns</b> policy</ng-template>Body</div>
      </div>`,
      { imports },
    );
    expect((await axe(container)).violations).toEqual([]);
  });

  it('follows the APG accordion pattern: a heading holds one button; the region is named by it', async () => {
    await render(TEMPLATE, { imports });
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(3);
    for (const heading of screen.getAllByRole('heading', { level: 3 })) expect(heading.children).toHaveLength(1);
    expect(screen.getByRole('region', { name: 'Returns' }).textContent).toContain('Send it back.');
    expect(accordionMeta.roles).toMatchObject({ content: 'region' });
    expect(accordionMeta.apg).toContain('/patterns/accordion/');
    expect(Object.keys(accordionAnatomy.parts)).toContain('trigger');
  });
});
