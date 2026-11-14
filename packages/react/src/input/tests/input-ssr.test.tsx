// @vitest-environment node
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { FormField } from '../../form-field';
import { Label } from '../../label';
import { Input } from '../index';
import { EmailField } from './fixtures';

const idsIn = (html: string, attribute: string): string[] =>
  [...html.matchAll(new RegExp(`${attribute}="([^"]+)"`, 'g'))].flatMap((match) => match[1].split(' '));

describe('Input on the server', () => {
  it('imports in plain Node without window or document', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
    expect(typeof Input).toBe('function');
  });

  it('renders the input with the class, the type and the defaultValue', () => {
    const html = renderToString(<Input type="email" defaultValue="a@b.c" required />);
    expect(html).toContain('class="cck-input"');
    expect(html).toContain('type="email"');
    expect(html).toContain('value="a@b.c"');
    expect(html).toContain('data-filled=""');
    expect(html).toContain('required=""');
  });

  it('resolves every IDREF of a field in the server HTML, with the id of the field', () => {
    const html = renderToString(<EmailField id="email" />);
    expect(html).toContain('id="email-control"');
    expect(html).toContain('for="email-control"');
    expect(html).toContain('aria-describedby="email-hint-1 email-hint-2"');
    expect(html).toContain('id="email-feedback"');
    for (const idref of [...idsIn(html, 'for'), ...idsIn(html, 'aria-describedby')]) {
      expect(html, idref).toContain(`id="${idref}"`);
    }
  });

  it('resolves the generated ids too', () => {
    const html = renderToString(<EmailField />);
    for (const idref of [...idsIn(html, 'for'), ...idsIn(html, 'aria-describedby')]) {
      expect(html, idref).toContain(`id="${idref}"`);
    }
  });

  it('renders the facts and the marker that the field props give, and type text by default', () => {
    const html = renderToString(
      <FormField id="f" required disabled invalid label={<Label>Name</Label>}>
        <Input />
      </FormField>,
    );
    expect(html).toContain('type="text"');
    expect(html).toContain('<span class="cck-label__required-marker" aria-hidden="true">*</span>');
    expect(html).toContain('required=""');
    expect(html).toContain('disabled=""');
    expect(html.match(/data-required=""/g)).toHaveLength(2);
    expect(html.match(/data-invalid=""/g)).toHaveLength(2);
  });

  it('renders the default for and control id before the control has registered', () => {
    const html = renderToString(
      <FormField id="f" label={<Label>Name</Label>}>
        <Input />
      </FormField>,
    );
    expect(html).toContain('for="f-control"');
  });
});
