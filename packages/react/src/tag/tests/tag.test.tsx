// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { tagAnatomy, tagMeta } from '@cocokits/machines/tag';
import { ThemeProvider } from '@cocokits/react-core';
import { defineThemeConfig } from '@cocokits/shared';
import { Tag } from '../index';
import { strict, testThemeConfig } from './fixtures';

afterEach(cleanup);

const root = (): HTMLElement => screen.getByTestId('tag');

describe('Tag (rendered contract)', () => {
  it('renders the default element of the meta with the class, no role and no other attribute', () => {
    render(strict(<Tag data-testid="tag">Paid</Tag>));
    expect(root().tagName.toLowerCase()).toBe(tagMeta.defaultElements?.root);
    expect(root().className).toBe(tagAnatomy.classes.root);
    expect(root().getAttributeNames().sort()).toEqual(['class', 'data-testid']);
    expect(root().textContent).toBe('Paid');
  });

  it('renders its children as they are, an icon included, with no wrapper', () => {
    render(
      <Tag data-testid="tag">
        <svg aria-hidden="true" />
        Passed
      </Tag>,
    );
    expect([...root().childNodes].map((node) => node.nodeName)).toEqual(['svg', '#text']);
  });

  it('renders an empty span without children', () => {
    render(<Tag data-testid="tag" />);
    expect(root().childNodes).toHaveLength(0);
  });

  it('passes native attributes, joins className, merges style and forwards ref', () => {
    const ref = createRef<HTMLSpanElement>();
    render(
      <Tag data-testid="tag" ref={ref} id="state" title="State" className="mine" style={{ color: 'red' }}>
        Beta
      </Tag>,
    );
    expect(root().id).toBe('state');
    expect(root().title).toBe('State');
    expect(root().className).toBe(`${tagAnatomy.classes.root} mine`);
    expect(root().style.color).toBe('red');
    expect(ref.current).toBe(root());
  });

  it('keeps a role the author writes', () => {
    render(
      <Tag data-testid="tag" role="status">
        Saved
      </Tag>,
    );
    expect(root().getAttribute('role')).toBe('status');
  });

  it('emits only the theme options as data-*, with no dev warning', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(
      strict(
        <ThemeProvider themeConfig={testThemeConfig}>
          <Tag data-testid="tag">Paid</Tag>
        </ThemeProvider>,
      ),
    );
    const dataNames = root()
      .getAttributeNames()
      .filter((name) => name.startsWith('data-'))
      .sort();
    expect(dataNames).toEqual(['data-cck-color', 'data-size', 'data-testid', 'data-variant']);
    expect(root().getAttribute('data-variant')).toBe('soft');
    expect(root().getAttribute('data-cck-color')).toBe('neutral');
    expect(root().getAttribute('data-size')).toBe('md');
    expect(root().hasAttribute('data-dot')).toBe(false);
    expect(tagMeta.dataAttrs.root).toEqual([]);
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    vi.restoreAllMocks();
  });

  it('renders a true dot as an empty data-dot', () => {
    const config = defineThemeConfig({
      name: 'test',
      components: { tag: { dot: { attrName: 'dot', values: [true, false], default: true } } },
    });
    render(
      <ThemeProvider themeConfig={config}>
        <Tag data-testid="tag">Paid</Tag>
      </ThemeProvider>,
    );
    expect(root().getAttribute('data-dot')).toBe('');
  });
});

describe('Tag theme', () => {
  it('puts the theme attribute on its root', () => {
    const config = defineThemeConfig({
      name: 'test',
      components: {
        tag: {
          probe: { attrName: 'probe', values: ['on'], default: 'on', partNames: Object.keys(tagAnatomy.parts) },
        },
      },
    });
    render(
      <ThemeProvider themeConfig={config}>
        <Tag data-testid="tag">Paid</Tag>
      </ThemeProvider>,
    );
    expect(root().getAttribute('data-probe')).toBe('on');
  });
});
