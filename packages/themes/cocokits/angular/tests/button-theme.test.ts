import { Component, signal } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { provideCckTheme } from '@cocokits/angular-core';
import { CckButton, CckButtonAnchor } from '@cocokits/angular/button';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { describe, expect, it } from 'vitest';
import { CckButtonTheme, type CckButtonColor, type CckButtonSize, type CckButtonVariant } from '../src/index';
import { providers } from './helpers';

@Component({
  imports: [CckButton, CckButtonAnchor, CckButtonTheme],
  template: `
    <button cckButton data-testid="button" [variant]="variant()" [color]="color()" [size]="size()">Save</button>
    <a cckButton href="/x" data-testid="link" [variant]="variant()" [color]="color()" [size]="size()">Go</a>
  `,
})
class Host {
  readonly variant = signal<CckButtonVariant | null | undefined>(undefined);
  readonly color = signal<CckButtonColor | null | undefined>(undefined);
  readonly size = signal<CckButtonSize | null | undefined>(undefined);
}

const themed = { providers };
const attrs = (el: HTMLElement): Record<string, string | null> => ({
  variant: el.getAttribute('data-variant'),
  color: el.getAttribute('data-cck-color'),
  size: el.getAttribute('data-size'),
});

describe('CckButtonTheme', () => {
  it.each(['button', 'link'])('%s renders the config defaults', async (id) => {
    await render(Host, themed);
    expect(attrs(screen.getByTestId(id))).toEqual({ variant: 'primary', color: 'brand', size: 'md' });
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
    await render(Host, {
      providers: [provideCckTheme(cocokitsThemeConfig, { button: { size: 'lg' } })],
    });
    expect(screen.getByTestId('button').getAttribute('data-size')).toBe('lg');
  });

  it('renders no theme data-* without a theme provider', async () => {
    await render(Host);
    for (const id of ['button', 'link']) {
      expect(attrs(screen.getByTestId(id))).toEqual({ variant: null, color: null, size: null });
    }
  });

  it('does not change the behaviour of the base directive', async () => {
    await render(Host, themed);
    expect(screen.getByTestId('button').getAttribute('type')).toBe('button');
    expect(screen.getByTestId('button').classList.contains('cck-button')).toBe(true);
    expect(screen.getByTestId('link').hasAttribute('type')).toBe(false);
  });
});
