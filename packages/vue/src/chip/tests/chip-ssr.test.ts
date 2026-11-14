// @vitest-environment node
import { createSSRApp, h, type VNode } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { describe, expect, it } from 'vitest';
import { view } from '../../internal/tests/mount-helpers';
import { Chip } from '../index';

/** The server markup without the comments that mark slot fragments. */
async function markup(ui: () => VNode): Promise<string> {
  return (await renderToString(createSSRApp(view(ui)))).replace(/<!--[\s\S]*?-->/g, '');
}

describe('Chip on the server', () => {
  it('imports in plain Node without window or document', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
    expect(Chip).toBeDefined();
  });

  it('renders the parts, the generated id and the ids that point at each other', async () => {
    const html = await markup(() => h(Chip, { removable: true }, () => 'Pizza'));
    const id = /<div[^>]*class="cck-chip"[^>]* id="([^"]+)"|<div id="([^"]+)"[^>]*class="cck-chip"/
      .exec(html)
      ?.slice(1)
      .find(Boolean);
    expect(id).toBeTruthy();
    expect(html).toContain(`id="${String(id)}-content"`);
    expect(html).toContain(`aria-labelledby="${String(id)}-content"`);
    expect(html).toContain('type="button"');
    expect(html).toContain('>Pizza</span>');
  });

  it('renders the disabled facts and no button without removable', async () => {
    const disabled = await markup(() => h(Chip, { removable: true, disabled: true }, () => 'Pizza'));
    expect(disabled.match(/ data-disabled[ >=]/g)).toHaveLength(2);
    expect(disabled).toMatch(/<button[^>]* disabled/);
    const plain = await markup(() => h(Chip, null, () => 'Pizza'));
    expect(plain).not.toContain('<button');
  });
});
