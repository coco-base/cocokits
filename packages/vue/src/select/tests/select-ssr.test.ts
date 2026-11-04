import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { describe, expect, it } from 'vitest';
import { item, selectRoot } from './fixtures';

function app(props: Record<string, unknown> = {}) {
  return createSSRApp({
    render: () =>
      h('div', [selectRoot({ placeholder: 'Choose', ...props }, { items: () => [item('Cake'), item('Pizza')] })]),
  });
}

describe('Select server render', () => {
  it('renders the closed trigger with its class, ARIA and value, the hidden input, and no list', async () => {
    const html = await renderToString(app({ name: 'dish', modelValue: 'Pizza' }));
    expect(html).toContain('cck-select__trigger');
    expect(html).toContain('role="combobox"');
    expect(html).toContain('aria-haspopup="listbox"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('data-state="closed"');
    expect(html).toContain('cck-select__value');
    expect(html).toMatch(/<input[^>]*name="dish"[^>]*value="Pizza"/);
    expect(html).not.toContain('aria-controls');
    expect(html).not.toContain('role="listbox"');
    expect(html).not.toContain('role="option"');
    expect(html).not.toContain('cck-select__content');
  });

  it('renders an open Select as an expanded trigger with no list and no aria-controls', async () => {
    const html = await renderToString(app({ open: true }));
    expect(html).toContain('aria-expanded="true"');
    expect(html).toContain('data-state="open"');
    expect(html).not.toContain('aria-controls');
    expect(html).not.toContain('role="listbox"');
    expect(html).not.toContain('aria-activedescendant');
  });

  it('renders the placeholder while nothing is selected', async () => {
    const html = await renderToString(app());
    expect(html).toContain('cck-select__placeholder');
    expect(html).toContain('data-placeholder-shown');
  });

  it('renders the label of the selected value from items on the server, with no item mounted', async () => {
    const html = await renderToString(app({ modelValue: 'cake', items: { cake: 'Cake', pizza: 'Pizza' } }));
    expect(html).toContain('<span class="cck-select__value"><!--[-->Cake<!--]--></span>');
    expect(html).not.toContain('role="option"');
  });

  it('falls back to itemToStringLabel and then to the value as text', async () => {
    const labelled = await renderToString(
      app({ modelValue: 'cake', itemToStringLabel: (value: string) => value.toUpperCase() }),
    );
    expect(labelled).toContain('<span class="cck-select__value"><!--[-->CAKE<!--]--></span>');
    const plain = await renderToString(app({ modelValue: 'cake' }));
    expect(plain).toContain('<span class="cck-select__value"><!--[-->cake<!--]--></span>');
  });

  it('puts nullableValue in the hidden input of a cleared single Select', async () => {
    const html = await renderToString(app({ name: 'dish', nullableValue: 'none' }));
    expect(html).toMatch(/<input[^>]*name="dish"[^>]*value="none"/);
    expect(html).toContain('autocomplete="off"');
  });
});
