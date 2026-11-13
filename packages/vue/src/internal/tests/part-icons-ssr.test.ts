// @vitest-environment node
import { createSSRApp, h, type VNode } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { describe, expect, it } from 'vitest';
import { chevronDownIcon } from '@cocokits/icons';
import { AccordionHeader, AccordionItem, AccordionRoot, AccordionTrigger } from '../../accordion';
import { Checkbox } from '../../checkbox';
import { selectRoot } from '../../select/tests/fixtures';
import { partIconsThemeConfig, themed } from './part-icon-fixtures';

const accordion = (): VNode =>
  h(AccordionRoot, null, () =>
    h(AccordionItem, { value: 'a' }, () => h(AccordionHeader, null, () => h(AccordionTrigger, null, () => 'Shipping'))),
  );

const render = (view: () => VNode | VNode[], themeConfig = partIconsThemeConfig): Promise<string> =>
  renderToString(createSSRApp({ render: themed(view, themeConfig) }));

/** The markup of the part with the class, up to its closing tag, without the fragment anchors. */
function partOf(html: string, className: string): string {
  const clean = html.replaceAll('<!--[-->', '').replaceAll('<!--]-->', '');
  const start = clean.indexOf(`class="${className}"`);
  expect(start, `${className} is in the server HTML`).toBeGreaterThan(-1);
  return clean.slice(start, clean.indexOf('</svg></span>', start) + '</svg></span>'.length);
}

describe('part icons on the server', () => {
  it('has no window or document, so the render proves no DOM access', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
  });

  it('puts the Select chevron in the server HTML', async () => {
    const html = await render(() => selectRoot({ modelValue: 'Cake' }));
    expect(partOf(html, 'cck-select__dropdown-icon')).toContain('data-icon="chevron-down"');
    expect(html).toContain(chevronDownIcon.body);
  });

  it('puts the Accordion chevron in the indicator, the last child of the trigger', async () => {
    const html = await render(accordion);
    const clean = html.replaceAll('<!--[-->', '').replaceAll('<!--]-->', '');
    expect(clean).toMatch(
      /<button[^>]*cck-accordion__trigger[^>]*>Shipping<span class="cck-accordion__indicator" aria-hidden="true"><span class="cck-svg-icon" data-icon="chevron-down"/,
    );
    expect(clean).toMatch(/<\/svg><\/span><\/span><\/button>/);
  });

  it('puts the tick in the checked Checkbox only', async () => {
    const checked = await render(() => h(Checkbox, { 'aria-label': 'Terms', modelValue: true }));
    expect(partOf(checked, 'cck-checkbox__background')).toContain('data-icon="check"');
    const unchecked = await render(() => h(Checkbox, { 'aria-label': 'Terms', modelValue: false }));
    expect(unchecked).not.toContain('data-icon=');
  });
});
