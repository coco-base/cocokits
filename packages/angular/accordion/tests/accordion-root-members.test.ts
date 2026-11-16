import { Component, signal } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideCckDirection } from '@cocokits/angular-core';
import { describe, expect, it } from 'vitest';
import { CckAccordionImports } from '../index';

const imports = [...CckAccordionImports];
const trigger = (name: string): HTMLElement => screen.getByRole('button', { name });
const expanded = (name: string): string | null => trigger(name).getAttribute('aria-expanded');

@Component({
  imports,
  template: `
    <cck-accordion [collapsible]="collapsible()" [(value)]="open" [multi]="multi()">
      <cck-accordion-item label="Shipping" value="shipping">Shipping body</cck-accordion-item>
      <cck-accordion-item label="Returns" value="returns">Returns body</cck-accordion-item>
      <cck-accordion-item label="Warranty" value="warranty" [(expanded)]="warranty">Warranty body</cck-accordion-item>
    </cck-accordion>
  `,
})
class Valued {
  readonly collapsible = signal(false);
  readonly multi = signal(false);
  readonly open = signal<readonly string[]>([]);
  readonly warranty = signal(false);
}

describe('Accordion root members', () => {
  it('single mode: the open trigger is aria-disabled unless collapsible', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(Valued);
    await user.click(trigger('Shipping'));
    expect(trigger('Shipping').getAttribute('aria-disabled')).toBe('true');
    await user.click(trigger('Shipping'));
    expect(expanded('Shipping')).toBe('true');
    fixture.componentInstance.collapsible.set(true);
    fixture.detectChanges();
    expect(trigger('Shipping').hasAttribute('aria-disabled')).toBe(false);
    await user.click(trigger('Shipping'));
    expect(expanded('Shipping')).toBe('false');
  });

  it('disabled disables every item, and the arrow keys skip them', async () => {
    const user = userEvent.setup();
    await render(
      `<cck-accordion disabled>
        <cck-accordion-item label="A">A</cck-accordion-item>
        <cck-accordion-item label="B">B</cck-accordion-item>
      </cck-accordion>`,
      { imports },
    );
    const root = document.querySelector('cck-accordion');
    expect(root?.hasAttribute('data-disabled')).toBe(true);
    expect(root?.hasAttribute('disabled')).toBe(false);
    expect(document.querySelectorAll('.cck-accordion__item[data-disabled]')).toHaveLength(2);
    await user.click(trigger('A'));
    expect(expanded('A')).toBe('false');
  });

  const keyRows = [
    { name: 'vertical', dir: 'ltr' as const, orientation: 'vertical', key: '{ArrowDown}', next: 'B' },
    {
      name: 'vertical ignores Right Arrow',
      dir: 'ltr' as const,
      orientation: 'vertical',
      key: '{ArrowRight}',
      next: 'A',
    },
    { name: 'horizontal, Right Arrow', dir: 'ltr' as const, orientation: 'horizontal', key: '{ArrowRight}', next: 'B' },
    {
      name: 'horizontal ignores Down Arrow',
      dir: 'ltr' as const,
      orientation: 'horizontal',
      key: '{ArrowDown}',
      next: 'A',
    },
    {
      name: 'horizontal in RTL, Left Arrow',
      dir: 'rtl' as const,
      orientation: 'horizontal',
      key: '{ArrowLeft}',
      next: 'B',
    },
  ];
  it.each(keyRows)('orientation and direction: $name', async ({ dir, orientation, key, next }) => {
    const user = userEvent.setup();
    await render(
      `<cck-accordion orientation="${orientation}">
        <cck-accordion-item label="A">A</cck-accordion-item>
        <cck-accordion-item label="B">B</cck-accordion-item>
      </cck-accordion>`,
      { imports, providers: [provideCckDirection(dir)] },
    );
    expect(document.querySelector('cck-accordion')?.getAttribute('data-orientation')).toBe(orientation);
    expect(document.querySelector('cck-accordion')?.hasAttribute('orientation')).toBe(false);
    trigger('A').focus();
    await user.keyboard(key);
    expect(document.activeElement).toBe(trigger(next));
  });

  it('[(value)] follows clicks and opens items when written, in step with [(expanded)]', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(Valued);
    const host = fixture.componentInstance;
    await user.click(trigger('Returns'));
    expect(host.open()).toEqual(['returns']);
    host.open.set(['shipping']);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(expanded('Shipping')).toBe('true');
    expect(expanded('Returns')).toBe('false');
    host.warranty.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(host.open()).toEqual(['warranty']);
    expect(expanded('Shipping')).toBe('false');
    host.multi.set(true);
    fixture.detectChanges();
    await user.click(trigger('Returns'));
    expect(host.open()).toEqual(['returns', 'warranty']);
    expect(host.warranty()).toBe(true);
  });

  it('an item with a value attribute leaves no attribute on the host', async () => {
    await render(Valued);
    expect(document.querySelector('cck-accordion-item')?.hasAttribute('value')).toBe(false);
    expect(document.querySelector('cck-accordion')?.hasAttribute('value')).toBe(false);
  });
});

describe('Accordion closed content', () => {
  const rows = [
    { name: 'closed', open: false, element: true, hidden: true, children: false },
    { name: 'open', open: true, element: true, hidden: false, children: true },
  ];
  it.each(rows)('$name: element, hidden, children and aria-controls', async ({ open, element, hidden, children }) => {
    await render(
      `<cck-accordion><cck-accordion-item label="A" [expanded]="${String(open)}"><b>child</b></cck-accordion-item></cck-accordion>`,
      { imports },
    );
    const content = document.getElementById(trigger('A').getAttribute('aria-controls') ?? '');
    expect(content !== null).toBe(element);
    expect(content?.hidden).toBe(hidden);
    expect(content?.querySelector('b') !== null).toBe(children);
  });
});
