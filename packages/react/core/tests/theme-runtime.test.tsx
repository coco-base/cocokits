import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { defineAnatomy, defineThemeConfig } from '@cocokits/shared';
import { ThemeOptionsProvider, ThemeProvider, useThemeAttrs } from '../src/index';

const themeConfig = defineThemeConfig({
  name: 'test',
  components: {
    box: {
      variant: { attrName: 'variant', values: ['a', 'b'], default: 'a' },
      color: { attrName: 'cck-color', values: ['x', 'y'], default: 'x' },
      size: { attrName: 'size', values: ['sm', 'md', 'lg'], default: 'md' },
    },
  },
});

const anatomy = defineAnatomy({ block: 'box', parts: { root: { name: 'Root', description: 'The host.' } } });

function Probe(): React.ReactElement {
  return <i data-probe={JSON.stringify(useThemeAttrs(anatomy).root)} />;
}

function attrsOf(markup: string): Record<string, string> {
  const raw = /data-probe="([^"]*)"/.exec(markup)?.[1] ?? '';
  return JSON.parse(raw.replaceAll('&quot;', '"')) as Record<string, string>;
}

describe('react-core theme runtime', () => {
  it('returns an empty record without a provider and never throws', () => {
    expect(attrsOf(renderToStaticMarkup(<Probe />))).toEqual({});
  });

  it('resolves the config defaults', () => {
    const markup = renderToStaticMarkup(
      <ThemeProvider themeConfig={themeConfig}>
        <Probe />
      </ThemeProvider>,
    );
    expect(attrsOf(markup)).toEqual({ 'data-variant': 'a', 'data-cck-color': 'x', 'data-size': 'md' });
  });

  it('applies the precedence own, override, default, and null removes', () => {
    const render = (own: Record<string, string | null | undefined>, overrides = {}): Record<string, string> =>
      attrsOf(
        renderToStaticMarkup(
          <ThemeProvider themeConfig={themeConfig} overrides={overrides}>
            <ThemeOptionsProvider componentName="box" options={own}>
              <Probe />
            </ThemeOptionsProvider>
          </ThemeProvider>,
        ),
      );

    expect(render({}, { box: { size: 'lg' } })['data-size']).toBe('lg');
    expect(render({ size: 'sm' }, { box: { size: 'lg' } })['data-size']).toBe('sm');
    expect(render({ size: undefined }, { box: { size: 'lg' } })['data-size']).toBe('lg');
    expect(render({ size: null })).not.toHaveProperty('data-size');
    expect(render({ color: null }, { box: { color: 'y' } })).not.toHaveProperty('data-cck-color');
  });

  it('ignores options that name another component', () => {
    const markup = renderToStaticMarkup(
      <ThemeProvider themeConfig={themeConfig}>
        <ThemeOptionsProvider componentName="other" options={{ size: 'lg' }}>
          <Probe />
        </ThemeOptionsProvider>
      </ThemeProvider>,
    );
    expect(attrsOf(markup)['data-size']).toBe('md');
  });

  it('lets a nested provider replace the outer one', () => {
    const markup = renderToStaticMarkup(
      <ThemeProvider themeConfig={themeConfig} overrides={{ box: { size: 'lg' } }}>
        <ThemeProvider themeConfig={themeConfig}>
          <Probe />
        </ThemeProvider>
      </ThemeProvider>,
    );
    expect(attrsOf(markup)['data-size']).toBe('md');
  });
});
