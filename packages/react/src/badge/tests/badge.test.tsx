// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { badgeAnatomy, badgeMeta } from '@cocokits/machines/badge';
import { ThemeProvider } from '@cocokits/react-core';
import { defineThemeConfig } from '@cocokits/shared';
import { Badge } from '../index';
import { strict, testThemeConfig } from './fixtures';

afterEach(cleanup);

// An option that targets every part of the anatomy.
const allPartsConfig = defineThemeConfig({
  name: 'test',
  components: {
    [badgeAnatomy.block]: {
      probe: { attrName: 'probe', values: ['on'], default: 'on', partNames: Object.keys(badgeAnatomy.parts) },
    },
  },
});

const root = (): HTMLElement => screen.getByTestId('badge');
const dataNames = (): string[] =>
  root()
    .getAttributeNames()
    .filter((name) => name.startsWith('data-'));

describe('Badge (rendered contract)', () => {
  it('renders a span with the root class, a content part, no role and no data-*', () => {
    render(strict(<Badge data-testid="badge" content={5} />));
    expect(root().tagName).toBe('SPAN');
    expect(root().className).toBe('cck-badge');
    expect(root().hasAttribute('role')).toBe(false);
    expect(dataNames()).toEqual(['data-testid']);
    const parts = [...root().children];
    expect(parts.map((part) => [part.tagName, part.className, part.textContent])).toEqual([
      ['SPAN', 'cck-badge__content', '5'],
    ]);
  });

  it.each([null, undefined, '', 0])('shows no text (data-empty) for content %j', (content) => {
    render(<Badge data-testid="badge" content={content} />);
    expect(root().hasAttribute('data-empty')).toBe(true);
    expect(root().textContent).toBe('');
  });

  it('shows the string "0" as text, not empty', () => {
    render(<Badge data-testid="badge" content="0" max={99} />);
    expect(root().hasAttribute('data-empty')).toBe(false);
    expect(root().textContent).toBe('0');
  });

  it('truncates a count above max to max and a "+" indicator', () => {
    render(<Badge data-testid="badge" content={120} max={99} />);
    expect(root().hasAttribute('data-truncated')).toBe(true);
    expect(root().querySelector('.cck-badge__content')?.textContent).toBe('99');
    expect(root().querySelector('.cck-badge__max-indicator')?.textContent).toBe('+');
  });

  it('truncates the string "120" too, but never text or max 0', () => {
    const { rerender } = render(<Badge data-testid="badge" content="120" max={99} />);
    expect(root().textContent).toBe('99+');
    rerender(<Badge data-testid="badge" content="New" max={1} />);
    expect(root().textContent).toBe('New');
    rerender(<Badge data-testid="badge" content={120} max={0} />);
    expect(root().textContent).toBe('120');
    expect(root().hasAttribute('data-truncated')).toBe(false);
  });

  it('renders only the root with the native hidden attribute when hidden', () => {
    render(<Badge data-testid="badge" content={5} hide />);
    expect(root().hasAttribute('hidden')).toBe(true);
    expect(root().hasAttribute('data-empty')).toBe(false);
    expect(root().hasAttribute('data-truncated')).toBe(false);
    expect(root().children).toHaveLength(0);
  });

  it('is a plain badge outside a container', () => {
    render(<Badge data-testid="badge" content={5} />);
    expect(root().hasAttribute('data-position')).toBe(false);
    expect(root().getAttribute('style')).toBeNull();
  });

  it('joins className, merges style and puts ref on the span', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Badge data-testid="badge" ref={ref} className="mine" style={{ color: 'red' }} content={1} />);
    expect(ref.current).toBe(root());
    expect(root().className).toBe('cck-badge mine');
    expect(root().style.color).toBe('red');
  });

  it('emits only declared data-* and the theme options, with no dev warning', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const allowed = new Set([
      ...badgeMeta.dataAttrs.root,
      'data-variant',
      'data-cck-color',
      'data-size',
      'data-testid',
    ]);
    render(
      strict(
        <ThemeProvider themeConfig={testThemeConfig}>
          <Badge data-testid="badge" />
        </ThemeProvider>,
      ),
    );
    expect(dataNames().every((name) => allowed.has(name))).toBe(true);
    expect(root().getAttribute('data-variant')).toBe('rounded');
    expect(root().getAttribute('data-cck-color')).toBe('contrast');
    expect(root().getAttribute('data-size')).toBe('md');
    expect(root().hasAttribute('data-empty')).toBe(true);
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    vi.restoreAllMocks();
  });

  it('renders the default elements of the meta, and no data-hidden or inline style', () => {
    render(<Badge data-testid="badge" content={120} max={99} />);
    expect(root().tagName.toLowerCase()).toBe(badgeMeta.defaultElements?.root);
    expect(root().querySelector('.cck-badge__content')?.tagName.toLowerCase()).toBe(badgeMeta.defaultElements?.content);
    expect(root().querySelector('.cck-badge__max-indicator')?.tagName.toLowerCase()).toBe(
      badgeMeta.defaultElements?.maxIndicator,
    );
    expect(root().hasAttribute('data-hidden')).toBe(false);
    expect(root().hasAttribute('style')).toBe(false);
  });

  it('hidden wins over a direct hidden={false} prop', () => {
    render(<Badge data-testid="badge" hide hidden={false} />);
    expect(root().hasAttribute('hidden')).toBe(true);
  });
});

describe('Badge theme', () => {
  it('puts the theme attribute on every rendered part', () => {
    const { container } = render(
      <ThemeProvider themeConfig={allPartsConfig}>
        <Badge content={120} max={99} />
      </ThemeProvider>,
    );
    for (const className of Object.values(badgeAnatomy.classes)) {
      const part = container.querySelector(`.${className}`);
      expect(part, className).not.toBeNull();
      expect(part?.getAttribute('data-probe'), className).toBe('on');
    }
  });
});
