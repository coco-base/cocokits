// @vitest-environment node
import type { ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from '@cocokits/react-core';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { attrIn, inheritCases } from './inherit-cases';

const server = (ui: ReactElement): string =>
  renderToString(<ThemeProvider themeConfig={cocokitsThemeConfig}>{ui}</ThemeProvider>);

describe.each(inheritCases)('group inheritance on the server: $name', (c) => {
  const attr = (parent: string | null | undefined, own: string | null | undefined): string | null =>
    attrIn(server(c.ui(parent, own)), c.root, c.attr);

  it('renders the value of the parent in the server HTML', () => {
    expect(attr(c.parent, undefined)).toBe(c.parent);
  });

  it('renders its own value over the parent', () => {
    expect(attr(c.parent, c.own)).toBe(c.own);
  });

  it('renders no attribute for an own null, and none when the parent is null', () => {
    expect(attr(c.parent, null)).toBeNull();
    expect(attr(null, undefined)).toBeNull();
  });
});
