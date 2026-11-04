import { Component, signal } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { provideCckTheme } from '@cocokits/angular-core';
import { CckBadgeImports } from '@cocokits/angular/badge';
import { CckBadgeContainerImports } from '@cocokits/angular/badge-container';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { describe, expect, it } from 'vitest';
import { CckBadgeTheme, type CckBadgeColor, type CckBadgeSize, type CckBadgeVariant } from '../src/index';

@Component({
  imports: [CckBadgeImports, CckBadgeTheme],
  template: `<span
    cckBadge
    data-testid="badge"
    [content]="5"
    [variant]="variant()"
    [color]="color()"
    [size]="size()"
  ></span>`,
})
class Host {
  readonly variant = signal<CckBadgeVariant | null | undefined>(undefined);
  readonly color = signal<CckBadgeColor | null | undefined>(undefined);
  readonly size = signal<CckBadgeSize | null | undefined>(undefined);
}

@Component({
  imports: [CckBadgeImports, CckBadgeContainerImports, CckBadgeTheme],
  template: `<div cckBadgeContainer [position]="position">
    <span cckBadge data-testid="badge" color="danger"></span>
  </div>`,
})
class InContainer {
  readonly position = 'bottom-left';
}

@Component({
  imports: [CckBadgeImports, CckBadgeTheme],
  template: `<strong cckBadge data-testid="badge" [size]="size"></strong>`,
})
class OnStrong {
  readonly size = 'lg';
}

const themed = { providers: [provideCckTheme(cocokitsThemeConfig)] };
const badge = (): HTMLElement => screen.getByTestId('badge');
const attrs = (): Record<string, string | null> => ({
  variant: badge().getAttribute('data-variant'),
  color: badge().getAttribute('data-cck-color'),
  size: badge().getAttribute('data-size'),
});

describe('CckBadgeTheme', () => {
  it('renders the config defaults', async () => {
    await render(Host, themed);
    expect(attrs()).toEqual({ variant: 'rounded', color: 'contrast', size: 'md' });
  });

  it.each([
    ['variant', 'data-variant', ['rounded', 'rectangle']],
    ['color', 'data-cck-color', ['brand', 'neutral', 'info', 'success', 'warning', 'danger', 'contrast']],
    ['size', 'data-size', ['sm', 'md', 'lg', 'xl']],
  ] as const)('the %s input renders %s', async (option, attrName, values) => {
    const { fixture } = await render(Host, themed);
    for (const value of values) {
      (fixture.componentInstance[option] as { set(v: string): void }).set(value);
      await fixture.whenStable();
      expect(badge().getAttribute(attrName)).toBe(value);
    }
  });

  it('removes an attribute with null and restores the default with undefined', async () => {
    const { fixture } = await render(Host, themed);
    fixture.componentInstance.size.set(null);
    await fixture.whenStable();
    expect(badge().hasAttribute('data-size')).toBe(false);
    fixture.componentInstance.size.set(undefined);
    await fixture.whenStable();
    expect(badge().getAttribute('data-size')).toBe('md');
  });

  it('lets a provider override win over the config default', async () => {
    await render(Host, { providers: [provideCckTheme(cocokitsThemeConfig, { badge: { size: 'xl' } })] });
    expect(badge().getAttribute('data-size')).toBe('xl');
  });

  it('lets an own input win over a provider override', async () => {
    const { fixture } = await render(Host, {
      providers: [provideCckTheme(cocokitsThemeConfig, { badge: { size: 'xl', variant: 'rectangle' } })],
    });
    fixture.componentInstance.size.set('sm');
    await fixture.whenStable();
    expect(badge().getAttribute('data-size')).toBe('sm');
    expect(badge().getAttribute('data-variant')).toBe('rectangle');
  });

  it('renders no theme data-* without a theme provider', async () => {
    await render(Host);
    expect(attrs()).toEqual({ variant: null, color: null, size: null });
  });

  it('keeps the container position and the badge free of it', async () => {
    await render(InContainer, themed);
    expect(badge().parentElement?.getAttribute('data-position')).toBe('bottom-left');
    expect(badge().hasAttribute('data-position')).toBe(false);
    expect(badge().getAttribute('data-cck-color')).toBe('danger');
  });

  it('themes the attribute selector on a non-span element', async () => {
    await render(OnStrong, themed);
    expect(badge().tagName).toBe('STRONG');
    expect(attrs()).toEqual({ variant: 'rounded', color: 'contrast', size: 'lg' });
  });
});
