import { Component, signal } from '@angular/core';
import { render } from '@testing-library/angular';
import { provideCckTheme } from '@cocokits/angular-core';
import { CckTabsImports } from '@cocokits/angular/tabs';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { describe, expect, it } from 'vitest';
import {
  CckTabsTheme,
  type CckTabsColor,
  type CckTabsHeaderAlign,
  type CckTabsSize,
  type CckTabsVariant,
} from '../src/index';

@Component({
  imports: [CckTabsImports, CckTabsTheme],
  template: `
    <div
      cckTabs
      aria-label="Account settings"
      [variant]="variant()"
      [color]="color()"
      [size]="size()"
      [headerAlign]="headerAlign()"
    >
      <div cckTab label="Account">Change your name.</div>
      <div cckTab label="Password">Change your password.</div>
    </div>
  `,
})
class Host {
  readonly variant = signal<CckTabsVariant | null | undefined>(undefined);
  readonly color = signal<CckTabsColor | null | undefined>(undefined);
  readonly size = signal<CckTabsSize | null | undefined>(undefined);
  readonly headerAlign = signal<CckTabsHeaderAlign | null | undefined>(undefined);
}

@Component({
  imports: [CckTabsImports, CckTabsTheme],
  template: `
    <div cckTabs aria-label="Account settings" size="sm">
      <div cckTab label="Account">Change your name.</div>
      <div cckTab label="Password" [disabled]="off">Change your password.</div>
    </div>
  `,
})
class Fixed {
  protected readonly off = true;
}

const options = cocokitsThemeConfig.components.tabs;
const ATTRIBUTES = ['data-variant', 'data-cck-color', 'data-size', 'data-header-align'] as const;
const themed = { providers: [provideCckTheme(cocokitsThemeConfig)] };
const root = (container: Element): Element => {
  const element = container.querySelector('.cck-tabs');
  if (!element) throw new Error('no .cck-tabs');
  return element;
};

describe('theme directive on the tabs', () => {
  it('renders the config defaults on the host root', async () => {
    const { container } = await render(Host, themed);
    expect(root(container).getAttribute('data-variant')).toBe('border');
    expect(root(container).getAttribute('data-cck-color')).toBe('neutral');
    expect(root(container).getAttribute('data-size')).toBe('md');
    expect(root(container).getAttribute('data-header-align')).toBe('start');
  });

  it.each([
    ['variant', 'data-variant'],
    ['color', 'data-cck-color'],
    ['size', 'data-size'],
    ['headerAlign', 'data-header-align'],
  ] as const)('the %s input renders %s for every value', async (option, attribute) => {
    const { container, fixture } = await render(Host, themed);
    for (const value of options[option].values) {
      (fixture.componentInstance[option] as { set(v: string): void }).set(value);
      await fixture.whenStable();
      expect(root(container).getAttribute(attribute)).toBe(value);
    }
  });

  it('renders the options on the root only', async () => {
    const { container } = await render(Host, themed);
    for (const name of ATTRIBUTES) expect(container.querySelectorAll(`[${name}]`)).toHaveLength(1);
  });

  it('removes an attribute with null and restores the default with undefined', async () => {
    const { container, fixture } = await render(Host, themed);
    fixture.componentInstance.headerAlign.set(null);
    await fixture.whenStable();
    expect(root(container).hasAttribute('data-header-align')).toBe(false);
    fixture.componentInstance.headerAlign.set(undefined);
    await fixture.whenStable();
    expect(root(container).getAttribute('data-header-align')).toBe('start');
  });

  const overrides = { providers: [provideCckTheme(cocokitsThemeConfig, { tabs: { variant: 'line', size: 'lg' } })] };

  it('lets a provider override win over the config default', async () => {
    const { container } = await render(Host, overrides);
    expect(root(container).getAttribute('data-variant')).toBe('line');
    expect(root(container).getAttribute('data-size')).toBe('lg');
  });

  it('lets the own input win over a provider override', async () => {
    const { container } = await render(Fixed, overrides);
    expect(root(container).getAttribute('data-size')).toBe('sm');
    expect(root(container).getAttribute('data-variant')).toBe('line');
  });

  it('keeps the base behaviour under the theme: roles, the selected tab and a disabled tab', async () => {
    const { container } = await render(Fixed, themed);
    const tabs = container.querySelectorAll('[role="tab"]');
    expect(tabs).toHaveLength(2);
    expect(tabs.item(0).getAttribute('aria-selected')).toBe('true');
    expect(tabs.item(1).hasAttribute('data-disabled')).toBe(true);
    expect(container.querySelector('.cck-tabs__indicator')?.hasAttribute('data-variant')).toBe(false);
  });

  it('renders no theme data-* without a theme provider', async () => {
    const { container } = await render(Host);
    for (const name of ATTRIBUTES) expect(root(container).hasAttribute(name)).toBe(false);
  });
});
