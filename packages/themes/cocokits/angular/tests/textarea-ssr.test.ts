// @vitest-environment node
import '@angular/compiler';
import { Component } from '@angular/core';
import { CckFieldError } from '@cocokits/angular/field-error';
import { CckFormField } from '@cocokits/angular/form-field';
import { CckPrefix } from '@cocokits/angular/prefix';
import { CckTextarea } from '@cocokits/angular/textarea';
import { describe, expect, it } from 'vitest';
import { CckTextareaTheme } from '../src/index';
import { renderThemedApp } from './ssr-helpers';

@Component({
  selector: 'app-root',
  imports: [CckFormField, CckTextarea, CckTextareaTheme, CckPrefix, CckFieldError],
  template: `<div cckFormField>
      <span cckPrefix>P</span><textarea cckTextarea aria-label="Message" autoResize></textarea>
      <div cckFieldError>Enter a message.</div>
    </div>
    <textarea cckTextarea aria-label="Plain" [rows]="rows"></textarea>`,
})
class Root {
  protected readonly rows = 2;
}

describe('theme Textarea on the server', () => {
  it('renders data-auto-resize only on the Textarea that sets it, without window access', async () => {
    expect(typeof window).toBe('undefined');
    const html = await renderThemedApp(Root, true);
    expect(html.match(/data-auto-resize/g)).toHaveLength(1);
    expect(html).toMatch(/<textarea[^>]*data-auto-resize=""/);
  });

  it('renders the FieldError as a live region with no child node but comments', async () => {
    const html = await renderThemedApp(Root, true);
    expect(html).toMatch(/<div[^>]*aria-live="polite"[^>]*>(<!--[^>]*-->)*<\/div>/);
  });

  it('renders no data-auto-resize without a theme', async () => {
    expect(await renderThemedApp(Root, false)).not.toContain('data-auto-resize');
  });
});
