import { Component, signal } from '@angular/core';
import { render } from '@testing-library/angular';
import { provideCckTheme } from '@cocokits/angular-core';
import { CckAccordionImports } from '@cocokits/angular/accordion';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { describe, expect, it } from 'vitest';
import {
  CckAccordionTheme,
  type CckAccordionHideToggle,
  type CckAccordionSize,
  type CckAccordionTogglePosition,
  type CckAccordionVariant,
} from '../src/index';
import { providers } from './helpers';

@Component({
  imports: [CckAccordionImports, CckAccordionTheme],
  template: `
    <cck-accordion
      [variant]="variant()"
      [size]="size()"
      [togglePosition]="togglePosition()"
      [hideToggle]="hideToggle()"
    >
      <cck-accordion-item label="Shipping">Orders leave in two days.</cck-accordion-item>
      <cck-accordion-item label="Returns" [disabled]="off">Send it back within 30 days.</cck-accordion-item>
    </cck-accordion>
  `,
})
class Host {
  protected readonly off = true;
  readonly variant = signal<CckAccordionVariant | null | undefined>(undefined);
  readonly size = signal<CckAccordionSize | null | undefined>(undefined);
  readonly togglePosition = signal<CckAccordionTogglePosition | null | undefined>(undefined);
  readonly hideToggle = signal<CckAccordionHideToggle | null | undefined>(undefined);
}

@Component({
  imports: [CckAccordionImports, CckAccordionTheme],
  template: `
    <cck-accordion size="sm" hideToggle>
      <cck-accordion-item [label]="first">Orders leave in two days.</cck-accordion-item>
      <cck-accordion-item label="Returns">Send it back within 30 days.</cck-accordion-item>
    </cck-accordion>
  `,
})
class Fixed {
  protected readonly first = 'Shipping';
}

const options = cocokitsThemeConfig.components.accordion;
const ATTRIBUTES = ['data-variant', 'data-size', 'data-toggle-position', 'data-hide-toggle'] as const;
const themed = { providers };
const root = (container: Element): Element => {
  const element = container.querySelector('.cck-accordion');
  if (!element) throw new Error('no .cck-accordion');
  return element;
};

describe('theme directive on the accordion', () => {
  it('renders the config defaults on the host root', async () => {
    const { container } = await render(Host, themed);
    expect(root(container).getAttribute('data-variant')).toBe('default');
    expect(root(container).getAttribute('data-size')).toBe('md');
    expect(root(container).getAttribute('data-toggle-position')).toBe('after');
    expect(root(container).hasAttribute('data-hide-toggle')).toBe(false);
  });

  it.each([
    ['variant', 'data-variant'],
    ['size', 'data-size'],
    ['togglePosition', 'data-toggle-position'],
  ] as const)('the %s input renders %s for every value', async (option, attribute) => {
    const { container, fixture } = await render(Host, themed);
    for (const value of options[option].values) {
      (fixture.componentInstance[option] as { set(v: string): void }).set(value);
      await fixture.whenStable();
      expect(root(container).getAttribute(attribute)).toBe(value);
    }
  });

  it('renders data-hide-toggle only when hideToggle is true', async () => {
    const { container, fixture } = await render(Host, themed);
    fixture.componentInstance.hideToggle.set(true);
    await fixture.whenStable();
    expect(root(container).getAttribute('data-hide-toggle')).toBe('');
    fixture.componentInstance.hideToggle.set(false);
    await fixture.whenStable();
    expect(root(container).hasAttribute('data-hide-toggle')).toBe(false);
  });

  it('reads the attribute form of hideToggle and an own size', async () => {
    const { container } = await render(Fixed, themed);
    expect(root(container).getAttribute('data-hide-toggle')).toBe('');
    expect(root(container).getAttribute('data-size')).toBe('sm');
  });

  it('renders the options on the root only', async () => {
    const { container, fixture } = await render(Host, themed);
    fixture.componentInstance.hideToggle.set(true);
    await fixture.whenStable();
    for (const name of ATTRIBUTES) expect(container.querySelectorAll(`[${name}]`)).toHaveLength(1);
  });

  it('removes an attribute with null and restores the default with undefined', async () => {
    const { container, fixture } = await render(Host, themed);
    fixture.componentInstance.togglePosition.set(null);
    await fixture.whenStable();
    expect(root(container).hasAttribute('data-toggle-position')).toBe(false);
    fixture.componentInstance.togglePosition.set(undefined);
    await fixture.whenStable();
    expect(root(container).getAttribute('data-toggle-position')).toBe('after');
  });

  const overrides = {
    providers: [
      provideCckTheme(cocokitsThemeConfig, { accordion: { variant: 'group', size: 'sm', hideToggle: true } }),
    ],
  };

  it('lets a provider override win over the config default', async () => {
    const { container } = await render(Host, overrides);
    expect(root(container).getAttribute('data-variant')).toBe('group');
    expect(root(container).getAttribute('data-size')).toBe('sm');
    expect(root(container).getAttribute('data-hide-toggle')).toBe('');
  });

  it('lets the own input win over a provider override', async () => {
    const { container, fixture } = await render(Host, overrides);
    fixture.componentInstance.size.set('md');
    fixture.componentInstance.hideToggle.set(false);
    await fixture.whenStable();
    expect(root(container).getAttribute('data-size')).toBe('md');
    expect(root(container).hasAttribute('data-hide-toggle')).toBe(false);
    expect(root(container).getAttribute('data-variant')).toBe('group');
  });

  it('keeps the base behaviour under the theme: the button, the region and a disabled item', async () => {
    const { container, fixture } = await render(Host, themed);
    const triggers = container.querySelectorAll('button.cck-accordion__trigger');
    expect(triggers).toHaveLength(2);
    expect(triggers.item(0).getAttribute('aria-expanded')).toBe('false');
    expect((triggers.item(1) as HTMLButtonElement).disabled).toBe(true);
    (triggers.item(0) as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(triggers.item(0).getAttribute('aria-expanded')).toBe('true');
    for (const part of ['item', 'header', 'trigger', 'content']) {
      expect(container.querySelector(`.cck-accordion__${part}`)?.hasAttribute('data-variant')).toBe(false);
    }
  });

  it('renders no theme data-* without a theme provider', async () => {
    const { container } = await render(Host);
    for (const name of ATTRIBUTES) expect(root(container).hasAttribute(name)).toBe(false);
  });
});
