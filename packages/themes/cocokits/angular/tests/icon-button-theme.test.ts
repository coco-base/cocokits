import { Component, signal } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { provideCckTheme } from '@cocokits/angular-core';
import { CckIconButton, CckIconButtonAnchor } from '@cocokits/angular/icon-button';
import { defineAnatomy } from '@cocokits/shared';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { describe, expect, it } from 'vitest';
import {
  CckIconButtonTheme,
  type CckIconButtonColor,
  type CckIconButtonSize,
  type CckIconButtonVariant,
} from '../src/index';
import { providers } from './helpers';

/** The classes come from an anatomy of the same block, as the theme-config tests do; a theme may not import a machine. */
const iconButtonAnatomy = defineAnatomy({
  block: 'icon-button',
  parts: { root: { name: 'Root', description: 'The button.' } },
});

@Component({
  imports: [CckIconButton, CckIconButtonAnchor, CckIconButtonTheme],
  template: `
    <button
      cckIconButton
      aria-label="Add"
      data-testid="button"
      [variant]="variant()"
      [color]="color()"
      [size]="size()"
      [rounded]="rounded()"
    ></button>
    <a
      cckIconButton
      aria-label="Go"
      href="/x"
      data-testid="link"
      [variant]="variant()"
      [color]="color()"
      [size]="size()"
      [rounded]="rounded()"
    ></a>
  `,
})
class Host {
  readonly variant = signal<CckIconButtonVariant | null | undefined>(undefined);
  readonly color = signal<CckIconButtonColor | null | undefined>(undefined);
  readonly size = signal<CckIconButtonSize | null | undefined>(undefined);
  readonly rounded = signal<boolean | string | null | undefined>(undefined);
}

@Component({
  imports: [CckIconButton, CckIconButtonTheme],
  template: `
    <button cckIconButton aria-label="a" data-testid="bare" rounded></button>
    <button cckIconButton aria-label="b" data-testid="empty" rounded=""></button>
    <button cckIconButton aria-label="c" data-testid="false" rounded="false"></button>
    <button cckIconButton aria-label="d" data-testid="none"></button>
  `,
})
class AttributeHost {
  readonly attribute = true;
}

const themed = { providers };
const attrs = (el: HTMLElement): Record<string, string | null> => ({
  variant: el.getAttribute('data-variant'),
  color: el.getAttribute('data-cck-color'),
  size: el.getAttribute('data-size'),
  rounded: el.getAttribute('data-rounded'),
});

describe('CckIconButtonTheme', () => {
  it.each(['button', 'link'])('%s renders the config defaults', async (id) => {
    await render(Host, themed);
    expect(attrs(screen.getByTestId(id))).toEqual({ variant: 'primary', color: 'brand', size: 'md', rounded: null });
  });

  it.each([
    ['variant', 'data-variant', ['primary', 'outline', 'light', 'basic']],
    ['color', 'data-cck-color', ['brand', 'neutral', 'info', 'success', 'warning', 'danger', 'contrast']],
    ['size', 'data-size', ['sm', 'md', 'lg']],
  ] as const)('the %s input renders %s on both directives', async (option, attrName, values) => {
    const { fixture } = await render(Host, themed);
    for (const value of values) {
      (fixture.componentInstance[option] as { set(v: string): void }).set(value);
      await fixture.whenStable();
      expect(screen.getByTestId('button').getAttribute(attrName)).toBe(value);
      expect(screen.getByTestId('link').getAttribute(attrName)).toBe(value);
    }
  });

  it('renders rounded as a presence attribute on both directives, and removes it when false', async () => {
    const { fixture } = await render(Host, themed);
    fixture.componentInstance.rounded.set(true);
    await fixture.whenStable();
    expect(screen.getByTestId('button').getAttribute('data-rounded')).toBe('');
    expect(screen.getByTestId('link').getAttribute('data-rounded')).toBe('');
    fixture.componentInstance.rounded.set(false);
    await fixture.whenStable();
    expect(screen.getByTestId('button').hasAttribute('data-rounded')).toBe(false);
  });

  it('reads the attribute form of rounded', async () => {
    await render(AttributeHost, themed);
    expect(screen.getByTestId('bare').getAttribute('data-rounded')).toBe('');
    expect(screen.getByTestId('empty').getAttribute('data-rounded')).toBe('');
    expect(screen.getByTestId('false').hasAttribute('data-rounded')).toBe(false);
    expect(screen.getByTestId('none').hasAttribute('data-rounded')).toBe(false);
  });

  it('removes an attribute with null and restores the default with undefined', async () => {
    const { fixture } = await render(Host, themed);
    fixture.componentInstance.size.set(null);
    await fixture.whenStable();
    expect(screen.getByTestId('button').hasAttribute('data-size')).toBe(false);
    fixture.componentInstance.size.set(undefined);
    await fixture.whenStable();
    expect(screen.getByTestId('button').getAttribute('data-size')).toBe('md');
  });

  it('lets a provider override win over the config default', async () => {
    await render(Host, { providers: [provideCckTheme(cocokitsThemeConfig, { 'icon-button': { size: 'lg' } })] });
    expect(screen.getByTestId('button').getAttribute('data-size')).toBe('lg');
  });

  it('renders no theme data-* without a theme provider', async () => {
    await render(Host);
    for (const id of ['button', 'link']) {
      expect(attrs(screen.getByTestId(id))).toEqual({ variant: null, color: null, size: null, rounded: null });
    }
  });

  it('does not change the behaviour of the base directive', async () => {
    await render(Host, themed);
    expect(screen.getByTestId('button').getAttribute('type')).toBe('button');
    expect(screen.getByTestId('button').classList.contains(iconButtonAnatomy.classes.root)).toBe(true);
    expect(screen.getByTestId('link').hasAttribute('type')).toBe(false);
  });
});
