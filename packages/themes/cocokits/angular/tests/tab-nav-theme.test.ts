import { Component, signal } from '@angular/core';
import { render } from '@testing-library/angular';
import { provideCckTheme } from '@cocokits/angular-core';
import { CckTabNavImports } from '@cocokits/angular/tab-nav';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { describe, expect, it } from 'vitest';
import {
  CckTabNavTheme,
  type CckTabNavColor,
  type CckTabNavHeaderAlign,
  type CckTabNavSize,
  type CckTabNavVariant,
} from '../src/index';
import { providers } from './helpers';

@Component({
  imports: [CckTabNavImports, CckTabNavTheme],
  template: `
    <nav
      cckTabNav
      aria-label="Project"
      [variant]="variant()"
      [color]="color()"
      [size]="size()"
      [headerAlign]="headerAlign()"
    >
      <a cckTabNavLink href="#account" active>Account</a>
      <a cckTabNavLink href="#password">Password</a>
    </nav>
  `,
})
class Host {
  readonly variant = signal<CckTabNavVariant | null | undefined>(undefined);
  readonly color = signal<CckTabNavColor | null | undefined>(undefined);
  readonly size = signal<CckTabNavSize | null | undefined>(undefined);
  readonly headerAlign = signal<CckTabNavHeaderAlign | null | undefined>(undefined);
}

@Component({
  imports: [CckTabNavImports, CckTabNavTheme],
  template: `
    <nav cckTabNav aria-label="Project" size="sm">
      <a cckTabNavLink href="#account" active>Account</a>
      <a cckTabNavLink href="#password" [disabled]="off">Password</a>
    </nav>
  `,
})
class Fixed {
  protected readonly off = true;
}

const options = cocokitsThemeConfig.components['tab-nav'];
const ATTRIBUTES = ['data-variant', 'data-cck-color', 'data-size', 'data-header-align'] as const;
const themed = { providers };
const root = (container: Element): Element => {
  const element = container.querySelector('.cck-tab-nav');
  if (!element) throw new Error('no .cck-tab-nav');
  return element;
};

describe('theme directive on the tab nav', () => {
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

  const overrides = {
    providers: [provideCckTheme(cocokitsThemeConfig, { 'tab-nav': { variant: 'line', size: 'lg' } })],
  };

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

  it('keeps the base behaviour under the theme: the active link, a disabled link and no tab roles', async () => {
    const { container } = await render(Fixed, themed);
    const links = container.querySelectorAll('a.cck-tab-nav__link');
    expect(links).toHaveLength(2);
    expect(links.item(0).getAttribute('aria-current')).toBe('page');
    expect(links.item(1).hasAttribute('data-disabled')).toBe(true);
    expect(container.querySelector('[role="tab"]')).toBeNull();
    for (const part of ['.cck-tab-nav__list', '.cck-tab-nav__indicator', '.cck-tab-nav__link']) {
      expect(container.querySelector(part)?.hasAttribute('data-variant')).toBe(false);
    }
  });

  it('keeps the theme options on the root and gives the linked panel the part class and no theme attribute', async () => {
    const { container } = await render(
      '<nav cckTabNav aria-label="Project" [tabPanel]="panel"><a cckTabNavLink href="#a" active>A</a></nav>' +
        '<cck-tab-nav-panel #panel="cckTabNavPanel">Outlet</cck-tab-nav-panel>',
      { imports: [...CckTabNavImports, CckTabNavTheme], ...themed },
    );
    expect(root(container).getAttribute('data-variant')).toBe('border');
    expect(container.querySelector('.cck-tab-nav__list')?.getAttribute('role')).toBe('tablist');
    const panel = container.querySelector('.cck-tab-nav__panel');
    expect(panel?.getAttribute('role')).toBe('tabpanel');
    expect(panel?.hasAttribute('data-variant')).toBe(false);
    expect(container.querySelector('[role="tab"]')?.getAttribute('aria-selected')).toBe('true');
  });

  it('renders no theme data-* without a theme provider', async () => {
    const { container } = await render(Host);
    for (const name of ATTRIBUTES) expect(root(container).hasAttribute(name)).toBe(false);
  });
});
