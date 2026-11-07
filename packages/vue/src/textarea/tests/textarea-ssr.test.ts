// @vitest-environment node
import { createSSRApp, h, type VNode } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { describe, expect, it } from 'vitest';
import { FieldError } from '../../field-error';
import { FormField } from '../../form-field';
import { Label } from '../../label';
import { Leading } from '../../leading';
import { Prefix } from '../../prefix';
import { Suffix } from '../../suffix';
import { Trailing } from '../../trailing';
import { Textarea } from '../index';
import { view } from '../../internal/tests/mount-helpers';
import { messageField } from './fixtures';

/** The server markup without the comments that mark slot fragments. */
async function markup(ui: () => VNode): Promise<string> {
  return (await renderToString(createSSRApp(view(ui)))).replace(/<!--[\s\S]*?-->/g, '');
}

const idsIn = (html: string, attribute: string): string[] =>
  [...html.matchAll(new RegExp(`${attribute}="([^"]+)"`, 'g'))].flatMap((match) => match[1].split(' '));

describe('Textarea and the zones on the server', () => {
  it('imports the six new entries in plain Node without window or document', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
    for (const component of [Textarea, FieldError, Prefix, Suffix, Leading, Trailing]) {
      expect(component).toBeDefined();
    }
  });

  it('renders the textarea with the class, the rows and the text', async () => {
    const html = await markup(() => h(Textarea, { rows: 3, modelValue: 'a', required: true }));
    expect(html).toContain('<textarea');
    expect(html).toContain('class="cck-textarea"');
    expect(html).toContain('rows="3"');
    expect(html).toMatch(/ required[ >]/);
    expect(html).toMatch(/ data-filled[ >]/);
    expect(html).toContain('>a</textarea>');
    expect(html).not.toContain('type=');
  });

  it('resolves every IDREF of a field in the server HTML and renders the zones in the Anatomy order', async () => {
    const html = await markup(() => messageField('msg'));
    expect(html).toContain('id="msg-control"');
    expect(html).toContain('for="msg-control"');
    expect(html).toContain('aria-describedby="msg-feedback"');
    for (const idref of [...idsIn(html, 'for'), ...idsIn(html, 'aria-describedby')]) {
      expect(html, idref).toContain(`id="${idref}"`);
    }
    const order = [
      'cck-label',
      'cck-leading',
      'cck-prefix',
      'cck-textarea',
      'cck-suffix',
      'cck-trailing',
      'cck-hint',
      'cck-field-error',
    ];
    const positions = order.map((name) => html.indexOf(`class="${name}`));
    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  it('renders the FieldError root with aria-live also when it is not shown, and its text only when shown', async () => {
    const field = (force: boolean): (() => VNode) => {
      return () =>
        h(
          FormField,
          { id: 'f' },
          {
            label: () => h(Label, null, () => 'Name'),
            error: () => h(FieldError, { force }, () => 'Message'),
            default: () => h(Textarea, { invalid: true }),
          },
        );
    };
    const hidden = await markup(field(false));
    expect(hidden).toContain('<div class="cck-field-error" aria-live="polite"></div>');
    expect(hidden).not.toContain('Message');
    const forced = await markup(field(true));
    expect(forced).toContain('aria-live="polite">Message</div>');
    expect(await markup(() => h(FieldError, null, () => 'Alone'))).toContain('>Alone</div>');
  });
});
