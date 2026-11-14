import { Component, signal } from '@angular/core';
import { render } from '@testing-library/angular';
import { provideCckTheme } from '@cocokits/angular-core';
import { CckChipImports } from '@cocokits/angular/chip';
import { CckChipListImports } from '@cocokits/angular/chip-list';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { describe, expect, it } from 'vitest';
import { CckChipListTheme, CckChipTheme, type CckChipListSize, type CckChipSize } from '../src/index';
import { providers } from './helpers';

@Component({
  imports: [CckChipImports, CckChipTheme],
  template: `<cck-chip removable [size]="size()">Pizza</cck-chip>`,
})
class ChipHost {
  readonly size = signal<CckChipSize | null | undefined>(undefined);
}

@Component({
  imports: [CckChipListImports, CckChipListTheme],
  template: `<cck-chip-list aria-label="Toppings" [value]="['Ham', 'Olives']" [size]="size()" />`,
})
class ListHost {
  readonly size = signal<CckChipListSize | null | undefined>(undefined);
}

@Component({
  imports: [CckChipImports, CckChipTheme, CckChipListImports, CckChipListTheme],
  template: `
    <cck-chip size="sm">Pizza</cck-chip>
    <cck-chip-list [attr.aria-label]="label" size="lg" />
  `,
})
class Fixed {
  readonly label = 'Toppings';
}

const themed = { providers };
const first = (container: Element, selector: string): Element => {
  const element = container.querySelector(selector);
  if (!element) throw new Error(`no ${selector}`);
  return element;
};

describe.each([
  ['chip', ChipHost, '.cck-chip'],
  ['chip-list', ListHost, '.cck-chip-list'],
] as const)('theme directive on the %s', (name, Host, selector) => {
  const option = cocokitsThemeConfig.components[name].size;
  const overrides = { providers: [provideCckTheme(cocokitsThemeConfig, { [name]: { size: 'lg' } })] };

  it('renders the config default on the host root', async () => {
    const { container } = await render(Host, themed);
    expect(first(container, selector).getAttribute('data-size')).toBe('md');
  });

  it('renders data-size for every value', async () => {
    const { container, fixture } = await render(Host, themed);
    for (const value of option.values) {
      (fixture.componentInstance.size as { set(v: string): void }).set(value);
      await fixture.whenStable();
      expect(first(container, selector).getAttribute('data-size')).toBe(value);
    }
  });

  it('removes the attribute with null and restores the default with undefined', async () => {
    const { container, fixture } = await render(Host, themed);
    const size = fixture.componentInstance.size as { set(v: string | null | undefined): void };
    size.set(null);
    await fixture.whenStable();
    expect(first(container, selector).hasAttribute('data-size')).toBe(false);
    size.set(undefined);
    await fixture.whenStable();
    expect(first(container, selector).getAttribute('data-size')).toBe('md');
  });

  it('lets a provider override win over the config default', async () => {
    const { container } = await render(Host, overrides);
    expect(first(container, selector).getAttribute('data-size')).toBe('lg');
  });

  it('renders no theme data-* without a theme provider', async () => {
    const { container } = await render(Host);
    expect(first(container, selector).hasAttribute('data-size')).toBe(false);
  });
});

describe('theme directives of the chip and the chip list', () => {
  it('lets the own input win over a provider override', async () => {
    const { container } = await render(Fixed, {
      providers: [provideCckTheme(cocokitsThemeConfig, { chip: { size: 'lg' }, 'chip-list': { size: 'sm' } })],
    });
    expect(first(container, '.cck-chip').getAttribute('data-size')).toBe('sm');
    expect(first(container, '.cck-chip-list').getAttribute('data-size')).toBe('lg');
  });

  it('renders data-size on the chips of a list and keeps the remove icon of the theme', async () => {
    const { container } = await render(ListHost, themed);
    const chips = container.querySelectorAll('.cck-chip-list > .cck-chip');
    expect(chips).toHaveLength(2);
    for (const chip of chips) {
      expect(chip.getAttribute('data-size')).toBe('md');
      expect(chip.querySelector('.cck-chip__remove .cck-svg-icon')?.getAttribute('data-icon')).toBe('close');
    }
  });

  it('draws the icon the theme names for the remove button', async () => {
    const { container } = await render(ChipHost, themed);
    const icon = first(container, '.cck-chip__remove .cck-svg-icon');
    expect(cocokitsThemeConfig.components.chip.icons.remove).toBe('close');
    expect(icon.getAttribute('data-icon')).toBe('close');
    expect(icon.querySelectorAll('path')).toHaveLength(1);
  });
});
