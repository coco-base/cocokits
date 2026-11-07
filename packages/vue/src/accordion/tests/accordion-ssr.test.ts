import { createSSRApp } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { describe, expect, it } from 'vitest';
import { accordionView, type AccordionViewOptions } from './fixtures';

async function render(options: AccordionViewOptions): Promise<string> {
  return renderToString(createSSRApp({ render: accordionView(options) }));
}
const tags = (html: string, pattern: RegExp): string[] => [...html.matchAll(pattern)].map((match) => match[0]);

describe('Accordion server render', () => {
  it('renders the default-open item open and the rest closed, hidden and empty', async () => {
    const html = await render({ root: { defaultValue: 'returns' } });
    const triggers = tags(html, /<button\b[^>]*cck-accordion__trigger[^>]*>/g);
    expect(triggers).toHaveLength(3);
    expect(triggers[0]).toContain('aria-expanded="false"');
    expect(triggers[1]).toContain('aria-expanded="true"');
    expect(triggers[1]).toContain('aria-controls="');
    expect(triggers[0]).toContain('aria-controls="');
    const regions = tags(html, /<div\b[^>]*role="region"[^>]*>/g);
    expect(regions).toHaveLength(3);
    expect(regions[0]).toMatch(/\shidden(?=[\s>=])/);
    expect(regions[1]).not.toMatch(/\shidden(?=[\s>=])/);
    expect(regions[1]).toContain('aria-labelledby="');
    expect(html).toContain('Send it back.');
    expect(html).not.toContain('Shipping rates');
    expect(html).not.toContain('--accordion-content');
    expect(html).toContain('<h3 class="cck-accordion__header"');
  });

  it('keeps the children of closed content for unmountOnHide=false and forceMount', async () => {
    expect(await render({ root: { unmountOnHide: false } })).toContain('Shipping rates');
    expect(await render({ content: { forceMount: true } })).toContain('Shipping rates');
  });

  it('renders the open list of a multiple accordion and the disabled markers', async () => {
    const html = await render({ root: { defaultValue: ['shipping', 'returns'] }, returns: { disabled: true } });
    expect(tags(html, /aria-expanded="true"/g)).toHaveLength(2);
    expect(tags(html, /<div\b[^>]*data-orientation[^>]*>/g)[0]).toMatch(/\sdata-multiple(?=[\s>=])/);
    const triggers = tags(html, /<button\b[^>]*cck-accordion__trigger[^>]*>/g);
    expect(triggers[1]).toMatch(/\sdisabled(?=[\s>=])/);
    expect(triggers[1]).toMatch(/\sdata-disabled(?=[\s>=])/);
  });
});
