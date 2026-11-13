// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineThemeConfig, type ThemeConfig } from '@cocokits/shared';
import { ThemeProvider, useThemeIcons } from '../src/index';

const themeConfig: ThemeConfig = defineThemeConfig({
  name: 'test',
  components: {},
  icons: { star: { viewBox: '0 0 24 24', paths: [{ d: 'M1 1' }] } },
  partIconNames: { select: { dropdownIcon: 'star' } },
});

function Probe(): React.ReactElement {
  return <i data-probe={JSON.stringify(useThemeIcons())} />;
}

const probeOf = (markup: string): unknown =>
  JSON.parse((/data-probe="([^"]*)"/.exec(markup)?.[1] ?? '').replaceAll('&quot;', '"'));

const themed = (config: ThemeConfig): React.ReactElement => (
  <ThemeProvider themeConfig={config}>
    <Probe />
  </ThemeProvider>
);

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('useThemeIcons', () => {
  it('returns empty records without a provider', () => {
    expect(probeOf(renderToString(<Probe />))).toEqual({ icons: {}, partIconNames: {} });
  });

  it('returns the provided theme fields', () => {
    expect(probeOf(renderToString(themed(themeConfig)))).toEqual({
      icons: themeConfig.icons,
      partIconNames: themeConfig.partIconNames,
    });
  });

  it('returns empty records for a theme without the fields', () => {
    const bare = defineThemeConfig({ name: 'bare', components: {} });
    expect(probeOf(renderToString(themed(bare)))).toEqual({ icons: {}, partIconNames: {} });
  });

  it('gives the same result on the server and the first client render, with no hydration error', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const host = document.body.appendChild(document.createElement('div'));
    host.innerHTML = renderToString(themed(themeConfig));
    render(themed(themeConfig), { container: host, hydrate: true });
    expect(error).not.toHaveBeenCalled();
    expect(probeOf(host.innerHTML)).toEqual({ icons: themeConfig.icons, partIconNames: themeConfig.partIconNames });
  });
});
