import { Component, signal } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { provideCckTheme } from '@cocokits/angular-core';
import { CckFieldErrorImports } from '@cocokits/angular/field-error';
import { CckFormField } from '@cocokits/angular/form-field';
import { CckLeading } from '@cocokits/angular/leading';
import { CckPrefix } from '@cocokits/angular/prefix';
import { CckSuffix } from '@cocokits/angular/suffix';
import { CckTextarea } from '@cocokits/angular/textarea';
import { CckTrailing } from '@cocokits/angular/trailing';
import { defineAnatomy } from '@cocokits/shared';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { describe, expect, it } from 'vitest';
import { CckFormFieldTheme, CckTextareaTheme } from '../src/index';
import { providers } from './helpers';

/** The classes come from an anatomy of the same block, as the theme-config tests do; a theme may not import a machine. */
const textareaAnatomy = defineAnatomy({
  block: 'textarea',
  parts: { root: { name: 'Root', description: 'The textarea.' } },
});

@Component({
  imports: [CckTextarea, CckTextareaTheme],
  template: `<textarea cckTextarea data-testid="textarea" [autoResize]="autoResize()" rows="3"></textarea>`,
})
class Host {
  readonly autoResize = signal<boolean | string | null | undefined>(undefined);
}

@Component({
  imports: [CckTextarea, CckTextareaTheme],
  template: `
    <textarea cckTextarea data-testid="bare" [rows]="rows" autoResize></textarea>
    <textarea cckTextarea data-testid="empty" autoResize=""></textarea>
    <textarea cckTextarea data-testid="false" autoResize="false"></textarea>
    <textarea cckTextarea data-testid="none"></textarea>
  `,
})
class AttributeHost {
  protected readonly rows = 2;
}

@Component({
  imports: [
    CckFormField,
    CckFormFieldTheme,
    CckTextarea,
    CckTextareaTheme,
    CckPrefix,
    CckSuffix,
    CckLeading,
    CckTrailing,
    CckFieldErrorImports,
  ],
  template: `
    <cck-form-field data-testid="field" invalid size="lg">
      <cck-field-error data-testid="error">Enter a message.</cck-field-error>
      <span cckTrailing data-testid="trailing">T</span>
      <span cckSuffix data-testid="suffix">S</span>
      <textarea cckTextarea data-testid="textarea" aria-label="Message" [rows]="rows" touched autoResize></textarea>
      <span cckPrefix data-testid="prefix">P</span>
      <span cckLeading data-testid="leading">L</span>
    </cck-form-field>
  `,
})
class FieldHost {
  protected readonly rows = 2;
}

const themed = { providers };
const textarea = (): HTMLElement => screen.getByTestId('textarea');

describe('CckTextareaTheme', () => {
  it('renders no data-auto-resize by default', async () => {
    await render(Host, themed);
    expect(textarea().hasAttribute('data-auto-resize')).toBe(false);
    expect(textarea().classList.contains(textareaAnatomy.classes.root)).toBe(true);
  });

  it('renders the presence attribute for true and none for false and null', async () => {
    const { fixture } = await render(Host, themed);
    fixture.componentInstance.autoResize.set(true);
    await fixture.whenStable();
    expect(textarea().getAttribute('data-auto-resize')).toBe('');
    fixture.componentInstance.autoResize.set(false);
    await fixture.whenStable();
    expect(textarea().hasAttribute('data-auto-resize')).toBe(false);
    fixture.componentInstance.autoResize.set(true);
    await fixture.whenStable();
    fixture.componentInstance.autoResize.set(null);
    await fixture.whenStable();
    expect(textarea().hasAttribute('data-auto-resize')).toBe(false);
  });

  it('reads the attribute form: bare and empty mean true, "false" means false', async () => {
    await render(AttributeHost, themed);
    expect(screen.getByTestId('bare').hasAttribute('data-auto-resize')).toBe(true);
    expect(screen.getByTestId('empty').hasAttribute('data-auto-resize')).toBe(true);
    expect(screen.getByTestId('false').hasAttribute('data-auto-resize')).toBe(false);
    expect(screen.getByTestId('none').hasAttribute('data-auto-resize')).toBe(false);
  });

  it('lets a provider override win over the default, and the input over the override', async () => {
    const { fixture } = await render(Host, {
      providers: [provideCckTheme(cocokitsThemeConfig, { textarea: { autoResize: true } })],
    });
    expect(textarea().hasAttribute('data-auto-resize')).toBe(true);
    fixture.componentInstance.autoResize.set(false);
    await fixture.whenStable();
    expect(textarea().hasAttribute('data-auto-resize')).toBe(false);
  });

  it('renders no theme attribute without a theme provider and keeps the native attributes', async () => {
    await render(Host);
    expect(textarea().hasAttribute('data-auto-resize')).toBe(false);
    expect(textarea().getAttribute('rows')).toBe('3');
  });
});

describe('CckTextareaTheme in a themed field with every zone', () => {
  it('keeps the box, the zone order and the empty FieldError root', async () => {
    await render(FieldHost, themed);
    const field = screen.getByTestId('field');
    const wrapper = field.querySelector('.cck-form-field__wrapper');
    const box = field.querySelector('.cck-form-field__input-wrapper');
    expect(box?.getAttribute('data-size')).toBe('lg');
    expect(textarea().hasAttribute('data-auto-resize')).toBe(true);
    expect(textarea().parentElement).toBe(box);
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
    expect(screen.getByTestId('error').parentElement?.className).toBe('cck-form-field__feedback-wrapper');
  });

  it('shows the FieldError text only once the field is invalid and touched', async () => {
    await render(FieldHost, themed);
    expect(screen.getByTestId('error').textContent.trim()).toBe('Enter a message.');
    expect(screen.getByTestId('error').getAttribute('aria-live')).toBe('polite');
  });
});
