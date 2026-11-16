// @vitest-environment node
import { createSSRApp, h, type VNode } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { describe, expect, it } from 'vitest';
import { Checkbox } from '../../checkbox';
import { FormField } from '../../form-field';
import { Label } from '../../label';
import { CheckboxGroup } from '../index';

const group = (props: Record<string, unknown> = {}): VNode =>
  h(CheckboxGroup, { 'aria-label': 'Toppings', ...props }, () => [
    h(Checkbox, { value: 'cheese' }, () => 'Cheese'),
    h(Checkbox, { value: 'olives' }, () => 'Olives'),
  ]);

const render = (ui: () => VNode): Promise<string> => renderToString(createSSRApp({ render: ui }));

describe('CheckboxGroup on the server', () => {
  it('imports in plain Node without window or document', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
    expect(CheckboxGroup).toBeDefined();
  });

  it('renders the group role, the name, the orientation and the checked boxes', async () => {
    const html = await render(() => group({ defaultValue: ['olives'], name: 'toppings', disabled: true }));
    const root = /<div\b[^>]*role="group"[^>]*>/.exec(html)?.[0] ?? '';
    expect(root).toContain('class="cck-checkbox-group"');
    expect(root).toContain('aria-label="Toppings"');
    expect(root).toContain('data-orientation="vertical"');
    expect(root).toMatch(/\sdata-disabled(?=[\s>=])/);
    const inputs = [...html.matchAll(/<input\b[^>]*>/g)].map((match) => match[0]);
    expect(inputs).toHaveLength(2);
    expect(inputs[0]).not.toMatch(/\schecked(?=[\s>=])/);
    expect(inputs[1]).toMatch(/\schecked(?=[\s>=])/);
    for (const input of inputs) expect(input).toContain('name="toppings"');
  });

  it('points aria-labelledby at the Label of the field, which renders no for', async () => {
    const html = await render(() =>
      h(
        FormField,
        { id: 'f' },
        { label: () => h(Label, null, () => 'Toppings'), default: () => group({ 'aria-label': undefined }) },
      ),
    );
    const labelId = /<label\b[^>]*\sid="([^"]+)"/.exec(html)?.[1];
    expect(labelId).toBeTruthy();
    expect(html).toContain(`aria-labelledby="${String(labelId)}"`);
    expect(html).toContain('id="f-control"');
  });
});
