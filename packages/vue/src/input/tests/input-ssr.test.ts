// @vitest-environment node
import { createSSRApp, h, type VNode } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { describe, expect, it } from 'vitest';
import { FormField } from '../../form-field';
import { Label } from '../../label';
import { Input } from '../index';
import { view } from '../../internal/tests/mount-helpers';
import { emailField } from './fixtures';

/** The server markup without the comments that mark slot fragments. */
async function markup(ui: () => VNode): Promise<string> {
  return (await renderToString(createSSRApp(view(ui)))).replace(/<!--[\s\S]*?-->/g, '');
}

const idsIn = (html: string, attribute: string): string[] =>
  [...html.matchAll(new RegExp(`${attribute}="([^"]+)"`, 'g'))].flatMap((match) => match[1].split(' '));

describe('Input on the server', () => {
  it('imports in plain Node without window or document', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
    expect(Input).toBeDefined();
  });

  it('renders the input with the class, the type and the value', async () => {
    const html = await markup(() => h(Input, { type: 'email', modelValue: 'a@b.c', required: true }));
    expect(html).toContain('class="cck-input"');
    expect(html).toContain('type="email"');
    expect(html).toContain('value="a@b.c"');
    expect(html).toMatch(/ data-filled[ >]/);
    expect(html).toMatch(/ required[ >]/);
  });

  it('resolves every IDREF of a field in the server HTML, with the id of the field', async () => {
    const html = await markup(() => emailField('email'));
    expect(html).toContain('id="email-control"');
    expect(html).toContain('for="email-control"');
    expect(html).toContain('aria-describedby="email-hint-1 email-hint-2"');
    expect(html).toContain('id="email-feedback"');
    for (const idref of [...idsIn(html, 'for'), ...idsIn(html, 'aria-describedby')]) {
      expect(html, idref).toContain(`id="${idref}"`);
    }
  });

  it('resolves the generated ids too', async () => {
    const html = await markup(() => emailField());
    expect(idsIn(html, 'for')).toHaveLength(1);
    for (const idref of [...idsIn(html, 'for'), ...idsIn(html, 'aria-describedby')]) {
      expect(html, idref).toContain(`id="${idref}"`);
    }
  });

  it('renders the facts and the marker that the field props give, and type text by default', async () => {
    const html = await markup(() =>
      h(
        FormField,
        { id: 'f', required: true, disabled: true, invalid: true },
        { label: () => h(Label, null, () => 'Name'), default: () => h(Input) },
      ),
    );
    expect(html).toContain('type="text"');
    expect(html).toContain('<span class="cck-label__required-marker" aria-hidden="true">*</span>');
    expect(html).toMatch(/ required[ >]/);
    expect(html).toMatch(/ disabled[ >]/);
    expect(html.match(/ data-required[ >]/g)).toHaveLength(2);
    expect(html.match(/ data-invalid[ >]/g)).toHaveLength(2);
  });

  it('renders the default for and control id before the control has registered', async () => {
    const html = await markup(() =>
      h(FormField, { id: 'f' }, { label: () => h(Label, null, () => 'Name'), default: () => h(Input) }),
    );
    expect(html).toContain('for="f-control"');
  });
});
