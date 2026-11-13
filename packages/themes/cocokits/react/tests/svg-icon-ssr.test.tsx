// @vitest-environment node
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from '@cocokits/react-core';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { IconButton, SvgIcon } from '../src/index';

const html = (ui: React.ReactElement): string =>
  renderToString(<ThemeProvider themeConfig={cocokitsThemeConfig}>{ui}</ThemeProvider>);

describe('theme SvgIcon and IconButton on the server', () => {
  it('has no window or document, so the import and render prove no DOM access', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
  });

  it('has the whole icon and its options in the server HTML', () => {
    const markup = html(<SvgIcon iconName="check" size="lg" rtlMirror />);
    expect(markup).toContain('data-size="lg"');
    expect(markup).toContain('data-rtl-mirror=""');
    expect(markup).toContain('data-icon-name="check"');
    expect(markup).toContain('viewBox="0 0 24 24"');
    expect(markup).toMatch(/<path d="[^"]+"/);
  });

  it('renders the IconButton options and its icon', () => {
    const markup = html(
      <IconButton aria-label="Add" rounded variant="outline">
        <SvgIcon iconName="plus" />
      </IconButton>,
    );
    expect(markup).toContain('class="cck-icon-button"');
    expect(markup).toContain('data-variant="outline"');
    expect(markup).toContain('data-rounded=""');
    expect(markup).toContain('data-icon-name="plus"');
  });
});
