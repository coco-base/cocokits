// @vitest-environment node
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Input } from '@cocokits/react/input';
import { ThemeProvider } from '@cocokits/react-core';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { FormField } from '../src/index';

const render = (themed: boolean): string => {
  const ui = (
    <>
      <FormField size="lg">
        <Input aria-label="Email" />
      </FormField>
      <FormField>
        <Input aria-label="Email" />
      </FormField>
    </>
  );
  return renderToString(themed ? <ThemeProvider themeConfig={cocokitsThemeConfig}>{ui}</ThemeProvider> : ui);
};

describe('theme FormField on the server', () => {
  it('has no window or document', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
  });

  it('renders data-size on the root and the input wrapper, lg and the default md', () => {
    const html = render(true);
    expect(html.match(/data-size="lg"/g)).toHaveLength(2);
    expect(html.match(/data-size="md"/g)).toHaveLength(2);
    expect(html).toMatch(
      /<div[^>]*data-size="lg"[^>]*class="cck-form-field"|<div[^>]*class="cck-form-field"[^>]*data-size="lg"/,
    );
    expect(html).toMatch(
      /<div[^>]*class="cck-form-field__input-wrapper"[^>]*data-size="lg"|<div[^>]*data-size="lg"[^>]*class="cck-form-field__input-wrapper"/,
    );
  });

  it('renders no data-size without a theme provider', () => {
    expect(render(false)).not.toContain('data-size');
  });
});
