import { Component, signal } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { provideCckTheme } from '@cocokits/angular-core';
import { CckTagImports } from '@cocokits/angular/tag';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { describe, expect, it } from 'vitest';
import { CckTagTheme, type CckTagColor, type CckTagSize, type CckTagVariant } from '../src/index';
import { providers } from './helpers';

@Component({
  imports: [CckTagImports, CckTagTheme],
  template: `<cck-tag data-testid="tag" [variant]="variant()" [color]="color()" [size]="size()" [dot]="dot()"
    >Paid</cck-tag
  >`,
})
class Host {
  readonly variant = signal<CckTagVariant | null | undefined>(undefined);
  readonly color = signal<CckTagColor | null | undefined>(undefined);
  readonly size = signal<CckTagSize | null | undefined>(undefined);
  readonly dot = signal<boolean | string | null | undefined>(undefined);
}

@Component({
  imports: [CckTagImports, CckTagTheme],
  template: `
    <cck-tag data-testid="bare" dot>A</cck-tag>
    <cck-tag data-testid="empty" dot="">B</cck-tag>
    <cck-tag data-testid="false" dot="false">C</cck-tag>
    <cck-tag data-testid="none">{{ label }}</cck-tag>
  `,
})
class DotForms {
  readonly label = 'D';
}

const themed = { providers };
const tag = (): HTMLElement => screen.getByTestId('tag');
const attrs = (): Record<string, string | null> => ({
  variant: tag().getAttribute('data-variant'),
  color: tag().getAttribute('data-cck-color'),
  size: tag().getAttribute('data-size'),
  dot: tag().getAttribute('data-dot'),
});

describe('CckTagTheme', () => {
  it('renders the config defaults, the class and the text', async () => {
    await render(Host, themed);
    expect(attrs()).toEqual({ variant: 'soft', color: 'brand', size: 'md', dot: null });
    expect(tag().className).toBe('cck-tag');
    expect(tag().textContent).toBe('Paid');
  });

  it.each([
    ['variant', 'data-variant', ['soft', 'solid', 'outline']],
    ['color', 'data-cck-color', ['brand', 'neutral', 'info', 'success', 'warning', 'danger', 'contrast']],
    ['size', 'data-size', ['sm', 'md', 'lg']],
  ] as const)('the %s input renders %s', async (option, attrName, values) => {
    const { fixture } = await render(Host, themed);
    for (const value of values) {
      (fixture.componentInstance[option] as { set(v: string): void }).set(value);
      await fixture.whenStable();
      expect(tag().getAttribute(attrName)).toBe(value);
    }
  });

  it('renders dot as a presence attribute, and removes it when false', async () => {
    const { fixture } = await render(Host, themed);
    fixture.componentInstance.dot.set(true);
    await fixture.whenStable();
    expect(tag().getAttribute('data-dot')).toBe('');
    fixture.componentInstance.dot.set(false);
    await fixture.whenStable();
    expect(tag().hasAttribute('data-dot')).toBe(false);
  });

  it('reads the attribute form of dot', async () => {
    await render(DotForms, themed);
    expect(screen.getByTestId('bare').getAttribute('data-dot')).toBe('');
    expect(screen.getByTestId('empty').getAttribute('data-dot')).toBe('');
    expect(screen.getByTestId('false').hasAttribute('data-dot')).toBe(false);
    expect(screen.getByTestId('none').hasAttribute('data-dot')).toBe(false);
  });

  it('removes an attribute with null and restores the default with undefined', async () => {
    const { fixture } = await render(Host, themed);
    fixture.componentInstance.variant.set(null);
    await fixture.whenStable();
    expect(tag().hasAttribute('data-variant')).toBe(false);
    fixture.componentInstance.variant.set(undefined);
    await fixture.whenStable();
    expect(tag().getAttribute('data-variant')).toBe('soft');
  });

  it('lets a provider override win over the config default and an own input over the override', async () => {
    const { fixture } = await render(Host, {
      providers: [provideCckTheme(cocokitsThemeConfig, { tag: { size: 'lg', variant: 'outline' } })],
    });
    expect(attrs()).toEqual({ variant: 'outline', color: 'brand', size: 'lg', dot: null });
    fixture.componentInstance.size.set('sm');
    await fixture.whenStable();
    expect(tag().getAttribute('data-size')).toBe('sm');
  });

  it('renders no theme data-* without a theme provider', async () => {
    await render(Host);
    expect(attrs()).toEqual({ variant: null, color: null, size: null, dot: null });
  });

  it('adds no role and no tabindex to the host', async () => {
    await render(Host, themed);
    expect(tag().hasAttribute('role')).toBe(false);
    expect(tag().hasAttribute('tabindex')).toBe(false);
  });
});
