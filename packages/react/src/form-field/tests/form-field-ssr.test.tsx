// @vitest-environment node
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from '@cocokits/react-core';
import { Hint } from '../../hint';
import { Label } from '../../label';
import { FormField } from '../index';
import { allPartsConfig, Field } from './fixtures';

describe('FormField, Label and Hint on the server', () => {
  it('import in plain Node without window or document', () => {
    // The static imports above ran in this Node environment: they would have thrown on `window`.
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
    expect(typeof FormField).toBe('function');
    expect(typeof Label).toBe('function');
    expect(typeof Hint).toBe('function');
  });

  it('render the zones in order, with the classes and the theme attribute on every part', () => {
    const html = renderToString(
      <ThemeProvider themeConfig={allPartsConfig}>
        <Field />
      </ThemeProvider>,
    );
    const order = [
      'class="cck-form-field"',
      'class="cck-label"',
      'class="cck-form-field__wrapper"',
      'class="cck-form-field__input-wrapper"',
      '<input',
      'class="cck-form-field__feedback-wrapper"',
      'class="cck-hint"',
    ].map((marker) => html.indexOf(marker));
    expect(order.every((index) => index >= 0)).toBe(true);
    expect(order).toEqual([...order].sort((a, b) => a - b));
    expect(html.match(/data-probe="on"/g)).toHaveLength(7);
    expect(html).not.toContain('style=');
  });

  it('renders an empty feedback wrapper without a hint', () => {
    const html = renderToString(<FormField />);
    expect(html).toMatch(/<div class="cck-form-field__feedback-wrapper" id="[^"]+-feedback"><\/div>/);
  });
});
