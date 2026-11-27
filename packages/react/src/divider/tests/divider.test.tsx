// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { dividerMeta } from '@cocokits/machines/divider';
import { ThemeProvider } from '@cocokits/react-core';
import { Divider } from '../index';
import { strict, testThemeConfig } from './fixtures';

afterEach(cleanup);

const root = (): HTMLElement => screen.getByTestId('divider');
const dataNames = (): string[] =>
  root()
    .getAttributeNames()
    .filter((name) => name.startsWith('data-') && name !== 'data-testid');

describe('Divider (rendered contract)', () => {
  it('renders one hr with the class, data-orientation horizontal, no role and no aria-orientation', () => {
    const { container } = render(strict(<Divider data-testid="divider" />));
    expect(container.children).toHaveLength(1);
    expect(root().tagName).toBe('HR');
    expect(root().className).toBe('cck-divider');
    expect(root().getAttribute('data-orientation')).toBe('horizontal');
    expect(root().hasAttribute('role')).toBe(false);
    expect(root().hasAttribute('aria-orientation')).toBe(false);
    expect(root().childNodes).toHaveLength(0);
  });

  it.each([
    ['horizontal', false, null, null],
    ['vertical', false, null, 'vertical'],
    ['horizontal', true, 'none', null],
    ['vertical', true, 'none', null],
  ] as const)('orientation %s, decorative %s: role %s, aria-orientation %s', (orientation, decorative, role, aria) => {
    render(<Divider data-testid="divider" orientation={orientation} decorative={decorative} />);
    expect(root().getAttribute('data-orientation')).toBe(orientation);
    expect(root().getAttribute('role')).toBe(role);
    expect(root().getAttribute('aria-orientation')).toBe(aria);
  });

  it('emits only data attributes that the meta lists', () => {
    render(<Divider data-testid="divider" orientation="vertical" />);
    expect(dataNames().every((name) => dividerMeta.dataAttrs.root.includes(name))).toBe(true);
  });

  it('passes native attributes through and merges the class', () => {
    render(
      <Divider
        data-testid="divider"
        id="line"
        aria-label="Sections"
        className="mine"
        style={{ opacity: 0.5 }}
        hidden
      />,
    );
    expect(root().id).toBe('line');
    expect(root().getAttribute('aria-label')).toBe('Sections');
    expect(root().className).toBe('cck-divider mine');
    expect(root().style.opacity).toBe('0.5');
    expect(root().hidden).toBe(true);
  });

  it('gives the ref the hr', () => {
    const ref = createRef<HTMLHRElement>();
    render(<Divider ref={ref} />);
    expect(ref.current?.tagName).toBe('HR');
  });

  it('has a displayName', () => {
    expect(Divider.displayName).toBe('Divider');
  });
});

describe('Divider (theme options)', () => {
  it('renders the options of the theme config on the root', () => {
    render(
      <ThemeProvider themeConfig={testThemeConfig}>
        <Divider data-testid="divider" />
      </ThemeProvider>,
    );
    expect(root().getAttribute('data-size')).toBe('md');
    expect(root().getAttribute('data-color')).toBe('default');
  });

  it('renders no theme attribute without a theme', () => {
    render(<Divider data-testid="divider" />);
    expect(dataNames()).toEqual(['data-orientation']);
  });
});
