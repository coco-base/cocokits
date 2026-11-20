// @vitest-environment jsdom
import { createSSRApp, h, type App, type VNode } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AccordionHeader, AccordionItem, AccordionRoot, AccordionTrigger } from '../../accordion';
import { Checkbox } from '../../checkbox';
import { selectRoot } from '../../select/tests/fixtures';
import { themed } from './part-icon-fixtures';

let app: App | undefined;

afterEach(() => {
  app?.unmount();
  app = undefined;
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const accordion = (): VNode =>
  h(AccordionRoot, null, () =>
    h(AccordionItem, { value: 'a' }, () => h(AccordionHeader, null, () => h(AccordionTrigger, null, () => 'Shipping'))),
  );

const views: readonly [string, () => VNode | VNode[]][] = [
  ['Select', () => selectRoot({ modelValue: 'Cake' })],
  ['Accordion', accordion],
  ['Checked Checkbox', () => h(Checkbox, { 'aria-label': 'Terms', modelValue: true })],
  [
    'Accordion with asChild',
    () =>
      h(AccordionRoot, null, () =>
        h(AccordionItem, { value: 'a' }, () =>
          h(AccordionHeader, null, () => h(AccordionTrigger, { asChild: true }, () => h('button', 'Shipping'))),
        ),
      ),
  ],
];

describe.each(views)('%s part icon hydration', (_name, view) => {
  it('hydrates the server markup without a mismatch and keeps the icon', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const make = (): App => createSSRApp({ render: themed(view) });
    const container = document.body.appendChild(document.createElement('div'));
    container.innerHTML = await renderToString(make());
    const serverHtml = container.innerHTML;
    expect(container.querySelector('.cck-svg-icon')).not.toBeNull();
    app = make();
    app.mount(container);
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    expect(container.innerHTML).toBe(serverHtml);
  });
});
