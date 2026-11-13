import { Component, signal } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { provideCckTheme } from '@cocokits/angular-core';
import { CckSvgIcon } from '@cocokits/angular/svg-icon';
import { cocokitsIcons, cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { describe, expect, it } from 'vitest';
import { CckSvgIconTheme, type CckSvgIconColor, type CckSvgIconSize } from '../src/index';
import { providers } from './helpers';

@Component({
  imports: [CckSvgIcon, CckSvgIconTheme],
  template: `
    <cck-svg-icon iconName="heart" data-testid="icon" [size]="size()" [color]="color()" [rtlMirror]="rtlMirror()" />
  `,
})
class Host {
  readonly size = signal<CckSvgIconSize | null | undefined>(undefined);
  readonly color = signal<CckSvgIconColor | null | undefined>(undefined);
  readonly rtlMirror = signal<boolean | string | null | undefined>(undefined);
}

@Component({
  imports: [CckSvgIcon, CckSvgIconTheme],
  template: `
    <cck-svg-icon iconName="heart" data-testid="bare" rtlMirror />
    <cck-svg-icon iconName="heart" data-testid="empty" rtlMirror="" />
    <cck-svg-icon iconName="heart" data-testid="false" rtlMirror="false" />
    <cck-svg-icon iconName="heart" data-testid="size" size="2xl" />
  `,
})
class AttributeHost {
  readonly attribute = true;
}

const themed = { providers };
const attrs = (el: HTMLElement): Record<string, string | null> => ({
  color: el.getAttribute('data-cck-color'),
  size: el.getAttribute('data-size'),
  rtlMirror: el.getAttribute('data-rtl-mirror'),
});

describe('CckSvgIconTheme', () => {
  it('renders no option by default: the icon is 1em and takes the text color', async () => {
    await render(Host, themed);
    expect(attrs(screen.getByTestId('icon'))).toEqual({ color: null, size: null, rtlMirror: null });
  });

  it.each([
    ['color', 'data-cck-color', ['brand', 'neutral', 'info', 'success', 'warning', 'danger', 'contrast']],
    ['size', 'data-size', ['xs', 'sm', 'md', 'lg', 'xl', '2xl']],
  ] as const)('the %s input renders %s', async (option, attrName, values) => {
    const { fixture } = await render(Host, themed);
    for (const value of values) {
      (fixture.componentInstance[option] as { set(v: string): void }).set(value);
      await fixture.whenStable();
      expect(screen.getByTestId('icon').getAttribute(attrName)).toBe(value);
    }
    (fixture.componentInstance[option] as { set(v: null): void }).set(null);
    await fixture.whenStable();
    expect(screen.getByTestId('icon').hasAttribute(attrName)).toBe(false);
  });

  it('renders rtlMirror as a presence attribute and removes it when false', async () => {
    const { fixture } = await render(Host, themed);
    fixture.componentInstance.rtlMirror.set(true);
    await fixture.whenStable();
    expect(screen.getByTestId('icon').getAttribute('data-rtl-mirror')).toBe('');
    fixture.componentInstance.rtlMirror.set(false);
    await fixture.whenStable();
    expect(screen.getByTestId('icon').hasAttribute('data-rtl-mirror')).toBe(false);
  });

  it('reads the attribute forms', async () => {
    await render(AttributeHost, themed);
    expect(screen.getByTestId('bare').getAttribute('data-rtl-mirror')).toBe('');
    expect(screen.getByTestId('empty').getAttribute('data-rtl-mirror')).toBe('');
    expect(screen.getByTestId('false').hasAttribute('data-rtl-mirror')).toBe(false);
    expect(screen.getByTestId('size').getAttribute('data-size')).toBe('2xl');
  });

  it('lets a provider override win over the config default', async () => {
    await render(Host, { providers: [provideCckTheme(cocokitsThemeConfig, { 'svg-icon': { size: 'lg' } })] });
    expect(screen.getByTestId('icon').getAttribute('data-size')).toBe('lg');
  });

  it('draws the icon of the cocokits pack from the provided theme, and renders no option without one', async () => {
    const { container } = await render(Host, themed);
    const heart = cocokitsIcons.heart;
    expect(container.querySelector('svg')?.getAttribute('viewBox')).toBe(heart.viewBox);
    expect([...container.querySelectorAll('path')].map((path) => path.getAttribute('d'))).toEqual(
      heart.paths.map((path) => path.d),
    );
  });

  it('renders no theme data-* without a theme provider', async () => {
    await render(Host);
    expect(attrs(screen.getByTestId('icon'))).toEqual({ color: null, size: null, rtlMirror: null });
  });
});
