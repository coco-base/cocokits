// @vitest-environment jsdom
import { createSSRApp, h, type App, type Component, type VNode } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DialogContent, DialogRoot, DialogTrigger } from '../../dialog';
import { stubOverlayBrowser as stubDialogBrowser } from '../../dialog/tests/fixtures';
import { PopoverContent, PopoverRoot, PopoverTrigger } from '../../popover';
import { stubOverlayBrowser as stubPopoverBrowser } from '../../popover/tests/fixtures';
import { item, selectRoot } from '../../select/tests/fixtures';
import { TabsList, TabsContent, TabsRoot, TabsTrigger } from '../../tabs';
import { TooltipContent, TooltipRoot, TooltipTrigger } from '../../tooltip';

let mounted: App | undefined;
afterEach(() => {
  vi.unstubAllGlobals();
  mounted?.unmount();
  mounted = undefined;
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const render = (view: () => VNode): Promise<string> => renderToString(createSSRApp({ render: view }));

const tabs = (rootProps: Record<string, unknown>): VNode =>
  h(TabsRoot, rootProps, () => [
    h(TabsList, { 'aria-label': 'Account' }, () => [
      h(TabsTrigger, { value: 'account' }, () => 'Account'),
      h(TabsTrigger, { value: 'password' }, () => 'Password'),
    ]),
    h(TabsContent, { value: 'account' }, () => 'a'),
    h(TabsContent, { value: 'password' }, () => 'p'),
  ]);
const select = (rootProps: Record<string, unknown>): VNode =>
  selectRoot({ name: 'dish', placeholder: 'Choose', ...rootProps }, { items: () => [item('Cake'), item('Pizza')] });
const overlays: readonly [string, (rootProps: Record<string, unknown>) => VNode][] = [
  [
    'DialogRoot',
    (rootProps) =>
      h(DialogRoot as Component, rootProps, () => [
        h(DialogTrigger, null, () => 'Open'),
        h(DialogContent, { 'aria-label': 'Panel' }, () => 'Body'),
      ]),
  ],
  [
    'PopoverRoot',
    (rootProps) =>
      h(PopoverRoot as Component, rootProps, () => [
        h(PopoverTrigger, null, () => 'Open'),
        h(PopoverContent, { 'aria-label': 'Panel' }, () => 'Body'),
      ]),
  ],
  [
    'TooltipRoot',
    (rootProps) =>
      h(TooltipRoot as Component, rootProps, () => [
        h(TooltipTrigger, null, () => 'Open'),
        h(TooltipContent, null, () => 'Tip'),
      ]),
  ],
];

describe('default-open and default-value server render', () => {
  it.each(overlays)('%s renders default-open exactly as the bound open does', async (_name, view) => {
    const bound = await render(() => view({ open: true }));
    expect(await render(() => view({ defaultOpen: true }))).toBe(bound);
    expect(bound).toContain('data-state="open"');
  });

  it('TabsRoot selects the tab of default-value in the server output, as the bound modelValue does', async () => {
    const bound = await render(() => tabs({ modelValue: 'password' }));
    const html = await render(() => tabs({ defaultValue: 'password' }));
    expect(html).toBe(bound);
    const triggers = [...html.matchAll(/<button\b[^>]*role="tab"[^>]*>/g)].map((match) => match[0]);
    expect(triggers[0]).toContain('aria-selected="false"');
    expect(triggers[1]).toContain('aria-selected="true"');
    const panels = [...html.matchAll(/<div\b[^>]*role="tabpanel"[^>]*>/g)].map((match) => match[0]);
    expect(panels[0]).toContain('hidden');
    expect(panels[1]).not.toContain('hidden');
  });

  it('SelectRoot renders default-value and default-open as the bound model and open do', async () => {
    expect(await render(() => select({ defaultValue: 'Pizza' }))).toBe(
      await render(() => select({ modelValue: 'Pizza' })),
    );
    expect(await render(() => select({ defaultOpen: true }))).toBe(await render(() => select({ open: true })));
    const multiple = { multiple: true };
    expect(await render(() => select({ ...multiple, defaultValue: ['Cake', 'Pizza'] }))).toBe(
      await render(() => select({ ...multiple, modelValue: ['Cake', 'Pizza'] })),
    );
  });
});

describe('default-open and default-value hydration', () => {
  beforeEach(() => {
    stubPopoverBrowser();
    stubDialogBrowser();
  });

  async function hydrate(view: () => VNode): Promise<{ container: HTMLElement; serverHtml: string }> {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const container = document.body.appendChild(document.createElement('div'));
    container.innerHTML = await render(view);
    const serverHtml = container.innerHTML;
    mounted = createSSRApp({ render: view });
    mounted.mount(container);
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    return { container, serverHtml };
  }

  it('hydrates Tabs with default-value without a mismatch', async () => {
    const { container, serverHtml } = await hydrate(() => tabs({ defaultValue: 'password' }));
    expect(container.innerHTML.replace(/ style="[^"]*"/g, '')).toBe(serverHtml);
    expect([...container.querySelectorAll('[role="tab"]')].at(1)?.getAttribute('aria-selected')).toBe('true');
  });

  it('hydrates Select with default-value without a mismatch', async () => {
    const { container, serverHtml } = await hydrate(() => select({ defaultValue: 'Pizza' }));
    expect(container.innerHTML).toBe(serverHtml);
    expect(container.querySelector('.cck-select__value')?.textContent).toContain('Pizza');
  });

  it.each(overlays)('hydrates %s with default-open without a mismatch', async (_name, view) => {
    await hydrate(() => view({ defaultOpen: true }));
  });
});
