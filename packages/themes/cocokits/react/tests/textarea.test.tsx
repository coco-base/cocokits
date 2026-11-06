// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FieldError } from '@cocokits/react/field-error';
import { Leading } from '@cocokits/react/leading';
import { Prefix } from '@cocokits/react/prefix';
import { Suffix } from '@cocokits/react/suffix';
import { Textarea as BaseTextarea } from '@cocokits/react/textarea';
import { Trailing } from '@cocokits/react/trailing';
import { ThemeProvider } from '@cocokits/react-core';
import { defineAnatomy } from '@cocokits/shared';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { FormField, Textarea } from '../src/index';
import { themed } from './helpers';

/** The classes come from an anatomy of the same block, as the theme-config tests do; a theme may not import a machine. */
const textareaAnatomy = defineAnatomy({
  block: 'textarea',
  parts: { root: { name: 'Root', description: 'The textarea.' } },
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const textarea = (): HTMLElement => screen.getByTestId('textarea');

describe('theme Textarea', () => {
  it('renders no data-auto-resize by default', () => {
    render(themed(<Textarea data-testid="textarea" />));
    expect(textarea().hasAttribute('data-auto-resize')).toBe(false);
    expect(textarea().className).toBe(textareaAnatomy.classes.root);
  });

  it('renders the presence attribute for true, and none for false and null', () => {
    render(themed(<Textarea data-testid="textarea" autoResize />));
    expect(textarea().getAttribute('data-auto-resize')).toBe('');
    cleanup();
    render(themed(<Textarea data-testid="textarea" autoResize={false} />));
    expect(textarea().hasAttribute('data-auto-resize')).toBe(false);
    cleanup();
    render(
      <ThemeProvider themeConfig={cocokitsThemeConfig} overrides={{ textarea: { autoResize: true } }}>
        <Textarea data-testid="textarea" autoResize={null} />
      </ThemeProvider>,
    );
    expect(textarea().hasAttribute('data-auto-resize')).toBe(false);
  });

  it('lets a provider override win over the default, and the own prop over the override', () => {
    render(
      <ThemeProvider themeConfig={cocokitsThemeConfig} overrides={{ textarea: { autoResize: true } }}>
        <Textarea data-testid="textarea" />
        <Textarea data-testid="own" autoResize={false} />
      </ThemeProvider>,
    );
    expect(textarea().hasAttribute('data-auto-resize')).toBe(true);
    expect(screen.getByTestId('own').hasAttribute('data-auto-resize')).toBe(false);
  });

  it('renders no data-auto-resize for a base without a theme provider', () => {
    render(<BaseTextarea data-testid="textarea" />);
    expect(textarea().hasAttribute('data-auto-resize')).toBe(false);
  });

  it('forwards the base props, the native attributes and the ref', () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(themed(<Textarea data-testid="textarea" ref={ref} rows={4} defaultValue="a" required aria-label="m" />));
    expect(ref.current).toBe(textarea());
    expect(textarea().getAttribute('rows')).toBe('4');
    expect(textarea().hasAttribute('required')).toBe(true);
    expect((textarea() as HTMLTextAreaElement).value).toBe('a');
  });

  it('does not log under StrictMode', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(themed(<Textarea data-testid="textarea" aria-label="m" autoResize />));
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
  });
});

describe('theme FormField with the zones and a Textarea', () => {
  it('forwards the zone props, keeps the DOM order and an empty FieldError root', () => {
    render(
      themed(
        <FormField
          data-testid="field"
          size="lg"
          invalid
          error={<FieldError data-testid="error">Enter a message.</FieldError>}
          trailing={<Trailing data-testid="trailing">T</Trailing>}
          suffix={<Suffix data-testid="suffix">S</Suffix>}
          prefix={<Prefix data-testid="prefix">P</Prefix>}
          leading={<Leading data-testid="leading">L</Leading>}
        >
          <Textarea data-testid="textarea" aria-label="Message" autoResize />
        </FormField>,
      ),
    );
    const field = screen.getByTestId('field');
    const box = field.querySelector('.cck-form-field__input-wrapper');
    const wrapper = field.querySelector('.cck-form-field__wrapper');
    expect(box?.getAttribute('data-size')).toBe('lg');
    expect([...(box?.children ?? [])].map((child) => child.getAttribute('data-testid'))).toEqual([
      'prefix',
      'textarea',
      'suffix',
    ]);
    expect([...(wrapper?.children ?? [])].map((child) => child.getAttribute('data-testid') ?? 'box')).toEqual([
      'leading',
      'box',
      'trailing',
    ]);
    expect(box?.matches(':has(> .cck-textarea)')).toBe(true);
    const error = screen.getByTestId('error');
    expect(error.getAttribute('aria-live')).toBe('polite');
    // Untouched: the live region is there and has no node at all, so `:empty` matches it.
    expect(error.childNodes).toHaveLength(0);
    expect(error.matches(':empty')).toBe(true);
  });
});
