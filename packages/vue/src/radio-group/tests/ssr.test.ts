import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { describe, expect, it } from 'vitest';
import { groupView, type GroupViewOptions } from './fixtures';

const render = (options: GroupViewOptions = {}): Promise<string> =>
  renderToString(createSSRApp({ render: groupView(options) }));
const inputs = (html: string): string[] => [...html.matchAll(/<input\b[^>]*>/g)].map((match) => match[0]);

describe('RadioGroup server render', () => {
  it('renders the root contract, the checked attribute and no tabindex', async () => {
    const html = await render({ group: { defaultValue: 'pro', required: true, orientation: 'horizontal' } });
    const root = /<div\b[^>]*role="radiogroup"[^>]*>/.exec(html)?.[0] ?? '';
    expect(root).toContain('class="cck-radio-group"');
    expect(root).toContain('aria-labelledby="plan-label"');
    expect(root).toContain('aria-required="true"');
    expect(root).toContain('aria-orientation="horizontal"');
    expect(root).toMatch(/\sdata-required(?=[\s>=])/);
    expect(root).toContain('data-orientation="horizontal"');
    const [free, pro, team] = inputs(html);
    expect(free).not.toMatch(/\schecked(?=[\s>=])/);
    expect(pro).toMatch(/\schecked(?=[\s>=])/);
    expect(team).not.toMatch(/\schecked(?=[\s>=])/);
    for (const input of inputs(html)) expect(input).not.toContain('tabindex');
  });

  it('renders one generated name on every input and none on the root', async () => {
    const html = await render();
    const names = inputs(html).map((input) => /\sname="([^"]+)"/.exec(input)?.[1]);
    expect(new Set(names).size).toBe(1);
    expect(names[0]).toBeTruthy();
    expect(/<div\b[^>]*role="radiogroup"[^>]*>/.exec(html)?.[0]).not.toContain('name=');
  });

  it('uses the given name and disables every input of a disabled group', async () => {
    const html = await render({ group: { name: 'plan', disabled: true } });
    for (const input of inputs(html)) {
      expect(input).toContain('name="plan"');
      expect(input).toMatch(/\sdisabled(?=[\s>=])/);
    }
    expect(html).toContain('aria-disabled="true"');
  });

  it('renders on the server without a browser API', async () => {
    expect(await renderToString(createSSRApp({ render: () => h('div') }))).toBe('<div></div>');
  });
});
