// @vitest-environment node
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { FormField } from '../../form-field';
import { Label } from '../../label';
import { ChipList } from '../index';

describe('ChipList on the server', () => {
  it('has no window or document, so the import and render prove no DOM access', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
  });

  it('renders the chips of the initial value, the text box and the hidden inputs', () => {
    const html = renderToString(
      <ChipList aria-label="Toppings" name="toppings" defaultValue={['Pizza', 'Salad']} placeholder="Add" />,
    );
    expect(html).toContain('class="cck-chip-list"');
    expect(html.match(/class="cck-chip"/g)).toHaveLength(2);
    expect(html).toContain('>Pizza</span>');
    expect(html).toContain('>Salad</span>');
    const input = /<input[^>]*class="cck-chip-list__input"[^>]*>/.exec(html)?.[0] ?? '';
    expect(input).toContain('type="text"');
    expect(input.toLowerCase()).toContain('autocomplete="off"');
    expect(input).toContain('placeholder="Add"');
    expect(input).toContain('aria-label="Toppings"');
    expect(input).not.toContain('name=');
    expect(html.match(/aria-hidden="true"[^>]*name="toppings"|name="toppings"[^>]*aria-hidden="true"/g)).toHaveLength(
      2,
    );
  });

  it('renders the facts as data attributes on the root', () => {
    const html = renderToString(<ChipList aria-label="Toppings" defaultValue={['A']} disabled required />);
    const root = /<div[^>]*class="cck-chip-list"[^>]*>/.exec(html)?.[0] ?? '';
    for (const fact of ['data-disabled', 'data-required', 'data-filled']) expect(root).toContain(fact);
    expect(html).toContain('aria-required="true"');
  });

  it('gives the text box the control id inside a field', () => {
    const html = renderToString(
      <FormField id="tags" label={<Label>Toppings</Label>}>
        <ChipList />
      </FormField>,
    );
    expect(html).toContain('id="tags-control"');
  });
});
