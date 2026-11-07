// @vitest-environment node
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { FieldError } from '@cocokits/react/field-error';
import { Prefix } from '@cocokits/react/prefix';
import { ThemeProvider } from '@cocokits/react-core';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { FormField, Textarea } from '../src/index';

const render = (themed: boolean): string => {
  const ui = (
    <>
      <FormField prefix={<Prefix>P</Prefix>} error={<FieldError>Enter a message.</FieldError>}>
        <Textarea aria-label="Message" autoResize />
      </FormField>
      <Textarea aria-label="Plain" />
    </>
  );
  return renderToString(themed ? <ThemeProvider themeConfig={cocokitsThemeConfig}>{ui}</ThemeProvider> : ui);
};

describe('theme Textarea on the server', () => {
  it('has no window or document', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
  });

  it('renders data-auto-resize only on the Textarea that sets it', () => {
    const html = render(true);
    expect(html.match(/data-auto-resize/g)).toHaveLength(1);
    expect(html).toMatch(/<textarea[^>]*data-auto-resize=""/);
  });

  it('renders the FieldError as an empty live region, with no whitespace in it', () => {
    expect(render(true)).toMatch(/<div[^>]*aria-live="polite"[^>]*><\/div>/);
  });

  it('renders no data-auto-resize without a theme provider', () => {
    expect(render(false)).not.toContain('data-auto-resize');
  });
});
