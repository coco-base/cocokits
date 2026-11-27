import { Component, signal } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { provideCckTheme } from '@cocokits/angular-core';
import { CckDividerImports } from '@cocokits/angular/divider';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { describe, expect, it } from 'vitest';
import { CckDividerTheme, type CckDividerColor, type CckDividerSize } from '../src/index';
import { providers } from './helpers';

@Component({
  imports: [CckDividerImports, CckDividerTheme],
  template: `<hr cckDivider data-testid="divider" [size]="size()" [color]="color()" />`,
})
class Host {
  readonly size = signal<CckDividerSize | null | undefined>(undefined);
  readonly color = signal<CckDividerColor | null | undefined>(undefined);
}

@Component({
  imports: [CckDividerImports, CckDividerTheme],
  template: `<hr cckDivider data-testid="divider" [size]="size" color="dark" orientation="vertical" />`,
})
class Static {
  readonly size = 'lg';
}

const themed = { providers };
const divider = (): HTMLElement => screen.getByTestId('divider');
const attrs = (): Record<string, string | null> => ({
  size: divider().getAttribute('data-size'),
  color: divider().getAttribute('data-color'),
});

describe('CckDividerTheme', () => {
  it('renders the config defaults next to the base attributes', async () => {
    await render(Host, themed);
    expect(attrs()).toEqual({ size: 'md', color: 'default' });
    expect(divider().tagName).toBe('HR');
    expect(divider().getAttribute('data-orientation')).toBe('horizontal');
    expect(divider().hasAttribute('data-cck-color')).toBe(false);
  });

  it.each([
    ['size', 'data-size', ['md', 'lg']],
    ['color', 'data-color', ['light', 'default', 'dark']],
  ] as const)('the %s input renders %s', async (option, attrName, values) => {
    const { fixture } = await render(Host, themed);
    for (const value of values) {
      (fixture.componentInstance[option] as { set(v: string): void }).set(value);
      await fixture.whenStable();
      expect(divider().getAttribute(attrName)).toBe(value);
    }
  });

  it('removes an attribute with null and restores the default with undefined', async () => {
    const { fixture } = await render(Host, themed);
    fixture.componentInstance.size.set(null);
    fixture.componentInstance.color.set(null);
    await fixture.whenStable();
    expect(attrs()).toEqual({ size: null, color: null });
    fixture.componentInstance.size.set(undefined);
    fixture.componentInstance.color.set(undefined);
    await fixture.whenStable();
    expect(attrs()).toEqual({ size: 'md', color: 'default' });
  });

  it('lets an own input win over a provider override', async () => {
    await render(Static, {
      providers: [provideCckTheme(cocokitsThemeConfig, { divider: { size: 'md', color: 'light' } })],
    });
    expect(attrs()).toEqual({ size: 'lg', color: 'dark' });
    expect(divider().getAttribute('data-orientation')).toBe('vertical');
  });

  it('lets a provider override win over the config default', async () => {
    await render(Host, { providers: [provideCckTheme(cocokitsThemeConfig, { divider: { color: 'dark' } })] });
    expect(attrs()).toEqual({ size: 'md', color: 'dark' });
  });

  it('renders no theme data-* without a theme provider', async () => {
    await render(Host);
    expect(attrs()).toEqual({ size: null, color: null });
  });
});
