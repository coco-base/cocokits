// @vitest-environment node
import { createSSRApp, type VNode } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { describe, expect, it } from 'vitest';
import { view } from '../../internal/tests/mount-helpers';
import { ChipList } from '../index';
import { field, list } from './fixtures';

/** The server markup without the comments that mark slot fragments. */
async function markup(ui: () => VNode): Promise<string> {
  return (await renderToString(createSSRApp(view(ui)))).replace(/<!--[\s\S]*?-->/g, '');
}

const idsIn = (html: string, attribute: string): string[] =>
  [...html.matchAll(new RegExp(`${attribute}="([^"]+)"`, 'g'))].flatMap((match) => match[1].split(' '));

describe('ChipList on the server', () => {
  it('imports in plain Node without window or document', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
    expect(ChipList).toBeDefined();
  });

  it('renders the chips of the initial value, then the text box with its attributes', async () => {
    const html = await markup(() => list({ defaultValue: ['Pizza', 'Cake'], placeholder: 'Add', required: true }));
    expect(html).toContain('class="cck-chip-list"');
    expect(html.match(/class="cck-chip"/g)).toHaveLength(2);
    expect(html.match(/<button/g)).toHaveLength(2);
    expect(html).toContain('>Pizza</span>');
    expect(html).toContain('class="cck-chip-list__input"');
    expect(html).toContain('type="text"');
    expect(html).toContain('autocomplete="off"');
    expect(html).toContain('placeholder="Add"');
    expect(html).toContain('aria-required="true"');
    expect(html).toMatch(/ data-filled[ >]/);
    expect(html.indexOf('>Cake</span>')).toBeLessThan(html.indexOf('cck-chip-list__input'));
  });

  it('renders one hidden input per value under the name', async () => {
    const html = await markup(() => list({ defaultValue: ['Pizza', 'Cake'], name: 'toppings' }));
    expect(html.match(/name="toppings"/g)).toHaveLength(2);
    expect(html).toContain('aria-hidden="true"');
  });

  it('resolves every IDREF of a field in the server HTML, and the chip ids point at their wrappers', async () => {
    const html = await markup(() => field({}, { defaultValue: ['Pizza'] }));
    expect(html).toContain('id="f-control"');
    expect(html).toContain('for="f-control"');
    const labelled = idsIn(html, 'aria-labelledby');
    expect(labelled).toHaveLength(1);
    for (const idref of [...idsIn(html, 'for'), ...idsIn(html, 'aria-describedby'), ...labelled]) {
      expect(html, idref).toContain(`id="${idref}"`);
    }
  });
});
