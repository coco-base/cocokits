// @vitest-environment node
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { FieldError } from '../../field-error';
import { FormField } from '../../form-field';
import { Label } from '../../label';
import { Leading } from '../../leading';
import { Prefix } from '../../prefix';
import { Suffix } from '../../suffix';
import { Trailing } from '../../trailing';
import { Textarea } from '../index';
import { MessageField } from './fixtures';

const idsIn = (html: string, attribute: string): string[] =>
  [...html.matchAll(new RegExp(`${attribute}="([^"]+)"`, 'g'))].flatMap((match) => match[1].split(' '));

describe('Textarea and the zones on the server', () => {
  it('imports the six new entries in plain Node without window or document', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
    for (const component of [Textarea, FieldError, Prefix, Suffix, Leading, Trailing]) {
      expect(typeof component).toBe('function');
    }
  });

  it('renders the textarea with the class, the rows and the defaultValue', () => {
    const html = renderToString(<Textarea rows={3} defaultValue="a" required />);
    expect(html).toContain('<textarea');
    expect(html).toContain('class="cck-textarea"');
    expect(html).toContain('rows="3"');
    expect(html).toContain('required=""');
    expect(html).toContain('data-filled=""');
    expect(html).not.toContain('type=');
  });

  it('resolves every IDREF of a field in the server HTML and renders the zones in the Anatomy order', () => {
    const html = renderToString(<MessageField id="msg" />);
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
    expect(html).not.toContain('prefix="');
  });

  it('renders the FieldError root with aria-live also when it is not shown, and its text only when shown', () => {
    const hidden = renderToString(
      <FormField id="f" error={<FieldError>Message</FieldError>} label={<Label>Name</Label>}>
        <Textarea invalid />
      </FormField>,
    );
    expect(hidden).toContain('<div class="cck-field-error" aria-live="polite"></div>');
    expect(hidden).not.toContain('Message');
    const forced = renderToString(
      <FormField id="f" error={<FieldError force>Message</FieldError>} label={<Label>Name</Label>}>
        <Textarea />
      </FormField>,
    );
    expect(forced).toContain('aria-live="polite">Message</div>');
    expect(renderToString(<FieldError>Alone</FieldError>)).toContain('>Alone</div>');
  });
});
