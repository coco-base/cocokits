// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Tag as BaseTag } from '@cocokits/react/tag';
import { ThemeProvider } from '@cocokits/react-core';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { Tag } from '../src/index';
import { themed } from './helpers';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const tag = (): HTMLElement => screen.getByTestId('tag');
const { variant, color, size, dot } = cocokitsThemeConfig.components.tag;

describe('theme Tag', () => {
  it('renders the config defaults, the class and the text', () => {
    render(themed(<Tag data-testid="tag">Paid</Tag>));
    expect(tag().tagName).toBe('SPAN');
    expect(tag().getAttribute('data-variant')).toBe('soft');
    expect(tag().getAttribute('data-cck-color')).toBe('brand');
    expect(tag().getAttribute('data-size')).toBe('md');
    expect(tag().hasAttribute('data-dot')).toBe(false);
    expect(tag().className).toBe('cck-tag');
    expect(tag().textContent).toBe('Paid');
  });

  it.each([
    ['variant', 'data-variant', variant.values],
    ['color', 'data-cck-color', color.values],
    ['size', 'data-size', size.values],
  ] as const)('moves %s to every value', (option, attribute, values) => {
    for (const value of values) {
      render(themed(<Tag data-testid="tag" {...{ [option]: value }} />));
      expect(tag().getAttribute(attribute)).toBe(value);
      cleanup();
    }
  });

  it('renders data-dot while dot is true', () => {
    expect(dot.values).toEqual([true, false]);
    render(themed(<Tag data-testid="tag" dot />));
    expect(tag().getAttribute('data-dot')).toBe('');
    cleanup();
    render(themed(<Tag data-testid="tag" dot={false} />));
    expect(tag().hasAttribute('data-dot')).toBe(false);
  });

  it('removes an attribute with null', () => {
    render(themed(<Tag data-testid="tag" variant={null} color={null} size={null} dot={null} />));
    for (const name of ['data-variant', 'data-cck-color', 'data-size', 'data-dot']) {
      expect(tag().hasAttribute(name)).toBe(false);
    }
  });

  it('lets a provider override win over the default and the own prop over the override', () => {
    render(
      <ThemeProvider themeConfig={cocokitsThemeConfig} overrides={{ tag: { variant: 'outline', size: 'lg' } }}>
        <Tag data-testid="tag" size="sm" />
      </ThemeProvider>,
    );
    expect(tag().getAttribute('data-variant')).toBe('outline');
    expect(tag().getAttribute('data-size')).toBe('sm');
  });

  it('updates a mounted root: value, null, then undefined restores the default', () => {
    const { rerender } = render(themed(<Tag data-testid="tag" variant="solid" />));
    const element = tag();
    expect(element.getAttribute('data-variant')).toBe('solid');
    rerender(themed(<Tag data-testid="tag" variant={null} />));
    expect(tag()).toBe(element);
    expect(element.hasAttribute('data-variant')).toBe(false);
    rerender(themed(<Tag data-testid="tag" variant={undefined} />));
    expect(tag()).toBe(element);
    expect(element.getAttribute('data-variant')).toBe('soft');
  });

  it('renders no theme data-* for a base without a theme provider', () => {
    render(<BaseTag data-testid="tag" />);
    expect(
      tag()
        .getAttributeNames()
        .filter((name) => /^data-(variant|cck-color|size|dot)$/.test(name)),
    ).toEqual([]);
  });

  it('passes the base props through: render, native props and ref', () => {
    let element: HTMLElement | null = null;
    render(
      themed(
        <Tag data-testid="tag" render={<strong />} title="Status" ref={(node) => void (element = node)} color="danger">
          Failed
        </Tag>,
      ),
    );
    expect(tag().tagName).toBe('STRONG');
    expect(tag().getAttribute('title')).toBe('Status');
    expect(tag().getAttribute('data-cck-color')).toBe('danger');
    expect(element).toBe(tag());
  });

  it('does not log and names itself Tag', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(themed(<Tag>Beta</Tag>));
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    expect(Tag.displayName).toBe('Tag');
  });
});
