// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import { createRef, type ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { svgIconAnatomy } from '@cocokits/machines/svg-icon';
import { ThemeProvider } from '@cocokits/react-core';
import { defineThemeConfig } from '@cocokits/shared';
import { SvgIcon } from '../index';
import { strictThemed, themed } from '../../internal/tests/icon-fixtures';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const rootOf = (container: HTMLElement): HTMLElement => container.firstElementChild as HTMLElement;

describe('SvgIcon (rendered contract)', () => {
  it('ignores children: the svg is still drawn from the icon name', () => {
    const { container } = render(strictThemed(<SvgIcon iconName="dots">text</SvgIcon>));
    const root = rootOf(container);
    expect(root.textContent).toBe('');
    expect(root.querySelectorAll('path')).toHaveLength(2);
  });

  it('renders the root, the svg and one path per icon path', () => {
    const { container } = render(strictThemed(<SvgIcon iconName="dots" />));
    const root = rootOf(container);
    expect(root.tagName).toBe('SPAN');
    expect(root.className).toBe(svgIconAnatomy.classes.root);
    expect(root.getAttribute('data-icon-name')).toBe('dots');
    const svg = root.querySelector('svg');
    expect(svg?.getAttribute('class')).toBe(svgIconAnatomy.classes.svg);
    expect(svg?.getAttribute('viewBox')).toBe('0 0 10 10');
    expect([...root.querySelectorAll('path')].map((path) => path.getAttribute('d'))).toEqual(['M1 1h2', 'M5 5h2']);
    expect(root.querySelector('path')?.hasAttribute('fill-rule')).toBe(false);
    expect(root.querySelector('path')?.hasAttribute('clip-rule')).toBe(false);
  });

  it('maps fillRule and clipRule to the fill-rule and clip-rule attributes', () => {
    const { container } = render(themed(<SvgIcon iconName="star" />));
    const path = container.querySelector('path');
    expect(path?.getAttribute('fill-rule')).toBe('evenodd');
    expect(path?.getAttribute('clip-rule')).toBe('nonzero');
    expect(container.innerHTML).not.toContain('fillRule');
  });

  it('is hidden from assistive technology without a label, and has no role', () => {
    const { container } = render(themed(<SvgIcon iconName="star" />));
    expect(rootOf(container).getAttribute('aria-hidden')).toBe('true');
    expect(rootOf(container).hasAttribute('role')).toBe(false);
    expect(rootOf(container).hasAttribute('aria-label')).toBe(false);
  });

  it('treats an empty label as no label', () => {
    const { container } = render(themed(<SvgIcon iconName="star" label="" />));
    expect(rootOf(container).getAttribute('aria-hidden')).toBe('true');
    expect(rootOf(container).hasAttribute('role')).toBe(false);
  });

  it('is an image with the label as its name', () => {
    const { container } = render(themed(<SvgIcon iconName="star" label="Favourite" />));
    expect(rootOf(container).getAttribute('role')).toBe('img');
    expect(rootOf(container).getAttribute('aria-label')).toBe('Favourite');
    expect(rootOf(container).hasAttribute('aria-hidden')).toBe(false);
  });

  it('joins className, merges style, passes native props and puts ref on the span', () => {
    const ref = createRef<HTMLSpanElement>();
    const { container } = render(
      themed(<SvgIcon iconName="star" className="mine" style={{ opacity: 0.5 }} id="one" data-x="1" ref={ref} />),
    );
    const root = rootOf(container);
    expect(root.className).toBe('cck-svg-icon mine');
    expect(root.style.opacity).toBe('0.5');
    expect(root.id).toBe('one');
    expect(root.getAttribute('data-x')).toBe('1');
    expect(ref.current).toBe(root);
  });

  it('puts the theme options on the root only', () => {
    const { container } = render(themed(<SvgIcon iconName="star" />));
    expect(rootOf(container).getAttribute('data-size')).toBe('sm');
    expect(container.querySelector('svg')?.getAttributeNames().sort()).toEqual(['class', 'viewBox']);
  });
});

describe('SvgIcon (icon not found)', () => {
  it.each<[string, (ui: ReactElement) => ReactElement]>([
    ['an unknown name', themed],
    ['no theme', (ui) => ui],
    [
      'a theme without icons',
      (ui) => <ThemeProvider themeConfig={defineThemeConfig({ name: 'bare', components: {} })}>{ui}</ThemeProvider>,
    ],
  ])('renders an empty svg, keeps the name and logs one error: %s', (_label, wrap) => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { container } = render(wrap(<SvgIcon iconName="nope" />));
    const root = rootOf(container);
    expect(root.getAttribute('data-icon-name')).toBe('nope');
    const svg = root.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.hasAttribute('viewBox')).toBe(false);
    expect(root.querySelectorAll('path')).toHaveLength(0);
    expect(error).toHaveBeenCalledTimes(1);
    expect(String(error.mock.calls[0]?.[0])).toMatch(/^CocoKits: .*"nope"/);
  });

  it('logs once per mount in StrictMode and once more for each new missing name', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { rerender } = render(strictThemed(<SvgIcon iconName="nope" />));
    expect(error).toHaveBeenCalledTimes(1);
    rerender(strictThemed(<SvgIcon iconName="nope" label="Same name" />));
    expect(error).toHaveBeenCalledTimes(1);
    rerender(strictThemed(<SvgIcon iconName="other" />));
    expect(error).toHaveBeenCalledTimes(2);
    rerender(strictThemed(<SvgIcon iconName="star" />));
    expect(error).toHaveBeenCalledTimes(2);
  });

  it('does not log for a found icon', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(strictThemed(<SvgIcon iconName="star" />));
    expect(error).not.toHaveBeenCalled();
  });

  it('does not take a name that only the prototype has', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { container } = render(themed(<SvgIcon iconName="constructor" />));
    expect(container.querySelectorAll('path')).toHaveLength(0);
  });
});

describe('SvgIcon (safety)', () => {
  it('renders path data that holds markup as attribute text and adds no element', () => {
    const { container } = render(themed(<SvgIcon iconName="evil" />));
    expect(container.querySelector('script')).toBeNull();
    expect([...container.querySelectorAll('*')].map((element) => element.localName)).toEqual(['span', 'svg', 'path']);
    expect(container.querySelector('path')?.getAttribute('d')).toBe('"/><script>alert(1)</script><path d="');
    expect(container.querySelector('path')?.getAttributeNames()).toEqual(['d']);
  });
});
