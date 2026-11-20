// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup, screen } from '@testing-library/vue';
import { createSSRApp } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { afterEach, describe, expect, it } from 'vitest';
import { accordionView, mountView, type AccordionViewOptions } from './fixtures';

afterEach(cleanup);

const trigger = (name: string): HTMLElement => screen.getByRole('button', { name });
/** The content the trigger controls, found by its id: a hidden region is not in the accessibility tree. */
const region = (name: string): HTMLElement => {
  const content = document.getElementById(trigger(name).getAttribute('aria-controls') ?? '');
  if (!content) throw new Error(`The trigger ${name} controls no element.`);
  return content;
};

/** One row: what the author wrote, and what the closed Shipping content (accordion-13) must hold. */
interface Row {
  readonly name: string;
  readonly options: AccordionViewOptions;
  readonly children: boolean;
}

const ROWS: readonly Row[] = [
  { name: 'the default empties the closed content', options: {}, children: false },
  {
    name: 'unmountOnHide=false on the root keeps the children',
    options: { root: { unmountOnHide: false } },
    children: true,
  },
  { name: 'forceMount on the content keeps the children', options: { content: { forceMount: true } }, children: true },
  {
    name: 'an item that unmounts wins over the root that keeps',
    options: { root: { unmountOnHide: false }, returns: { unmountOnHide: true } },
    children: true,
  },
];

describe('Accordion closed content in the browser (accordion-13)', () => {
  it.each(ROWS)('$name: the element stays, hidden, and the trigger controls it', ({ options, children }) => {
    mountView(accordionView(options));
    const content = region('Shipping');
    expect(content.hidden).toBe(true);
    expect(content.hasAttribute('hidden')).toBe(true);
    expect(content.getAttribute('data-state')).toBe('closed');
    expect(content.querySelector('a') !== null).toBe(children);
    expect(content.getAttribute('role')).toBe('region');
    expect(trigger('Shipping').getAttribute('aria-controls')).toBe(content.id);
  });

  it('shows the children when the item opens and empties them again when it closes', async () => {
    mountView(accordionView());
    await userEvent.click(trigger('Shipping'));
    expect(region('Shipping').hidden).toBe(false);
    expect(region('Shipping').querySelector('a')).not.toBeNull();
    await userEvent.click(trigger('Returns'));
    expect(region('Shipping').hidden).toBe(true);
    expect(region('Shipping').children).toHaveLength(0);
  });
});

describe('Accordion closed content on the server (accordion-13)', () => {
  it.each(ROWS)('$name: the same markup is rendered', async ({ options, children }) => {
    const html = await renderToString(createSSRApp({ render: accordionView(options) }));
    const content = /<div\b[^>]*role="region"[^>]*>/.exec(html)?.[0] ?? '';
    expect(content).toMatch(/\shidden(?=[\s>=])/);
    expect(content).toContain('data-state="closed"');
    expect(html.includes('Shipping rates')).toBe(children);
    expect(/<button\b[^>]*cck-accordion__trigger[^>]*>/.exec(html)?.[0]).toContain('aria-controls="');
  });
});
