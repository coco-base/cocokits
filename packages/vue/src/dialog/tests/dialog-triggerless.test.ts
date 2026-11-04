// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/vue';
import { h, ref, type VNode } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DialogClose, DialogContent, DialogRoot } from '../index';
import { settle, stubOverlayBrowser, view } from './fixtures';

beforeEach(stubOverlayBrowser);
afterEach(() => {
  cleanup();
  Reflect.deleteProperty(document, 'fullscreenElement');
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
  document.documentElement.removeAttribute('style');
});

/** A dialog with no Trigger that a button of the page opens through `v-model:open`. */
function triggerless(opener: () => VNode[] = () => []): () => VNode[] {
  const open = ref(false);
  return () => [
    h('button', { id: 'opener', onClick: () => (open.value = true) }, 'Open'),
    ...opener(),
    h(DialogRoot, { open: open.value, 'onUpdate:open': (value: boolean) => (open.value = value) }, () =>
      h(DialogContent, { 'aria-label': 'Draft' }, () => h(DialogClose, null, () => 'Cancel')),
    ),
  ];
}

const byId = (root: ParentNode, id: string): HTMLElement => {
  const element = root.querySelector<HTMLElement>(`#${id}`);
  if (!element) throw new Error(`No element has the id ${id}`);
  return element;
};
const hostOf = (dialog: Element): ParentNode | null => dialog.closest('[popover]')?.parentNode ?? null;

/** Renders the view inside an open shadow root. */
function renderInShadow(fn: () => VNode[]): ShadowRoot {
  const host = document.createElement('div');
  document.body.append(host);
  const shadow = host.attachShadow({ mode: 'open' });
  const mount = document.createElement('div');
  shadow.append(mount);
  render(view(fn), { container: mount });
  return shadow;
}

describe('Dialog without a Trigger', () => {
  it('opens from v-model, puts the content in the body and returns focus to the opener', async () => {
    render(view(triggerless()));
    const opener = byId(document.body, 'opener');
    opener.focus();
    opener.click();
    await settle();
    const dialog = document.querySelector('dialog');
    expect(dialog?.open).toBe(true);
    expect(hostOf(dialog as Element)).toBe(document.body);
    expect(dialog?.contains(document.activeElement)).toBe(true);
    (dialog?.querySelector('button') as HTMLElement).click();
    await settle();
    expect(document.querySelector('dialog')).toBeNull();
    expect(document.activeElement).toBe(opener);
  });

  it('opens at once for an initial open state', async () => {
    render(
      view(() => [h(DialogRoot, { open: true }, () => h(DialogContent, { 'aria-label': 'Draft' }, () => 'text'))]),
    );
    await settle();
    expect(document.querySelector('dialog')?.open).toBe(true);
  });

  it('goes to the body when the opener is gone', async () => {
    const shown = ref(true);
    const open = ref(false);
    render(
      view(() => [
        ...(shown.value
          ? [h('button', { key: 'opener', id: 'opener', onClick: () => (open.value = true) }, 'Open')]
          : []),
        h('button', { id: 'other', key: 'other' }, 'other'),
        h(DialogRoot, { open: open.value, 'onUpdate:open': (value: boolean) => (open.value = value) }, () =>
          h(DialogContent, { 'aria-label': 'Draft' }, () => h(DialogClose, { id: 'cancel' }, () => 'Cancel')),
        ),
      ]),
    );
    const opener = byId(document.body, 'opener');
    opener.focus();
    opener.click();
    await settle();
    shown.value = false;
    await settle();
    byId(document, 'cancel').click();
    await settle();
    expect(document.querySelector('dialog')).toBeNull();
    expect(document.activeElement).toBe(document.body);
  });

  it('renders inside the shadow root that holds the opener', async () => {
    const shadow = renderInShadow(triggerless());
    const opener = byId(shadow, 'opener');
    opener.focus();
    opener.click();
    await settle();
    const dialog = shadow.querySelector('dialog');
    expect(dialog?.open).toBe(true);
    expect(hostOf(dialog as Element)).toBe(shadow);
  });

  it('renders inside the fullscreen element that holds the opener', async () => {
    const full = document.createElement('section');
    document.body.append(full);
    Object.defineProperty(document, 'fullscreenElement', { configurable: true, get: () => full });
    render(view(triggerless()), { container: full });
    const opener = byId(full, 'opener');
    opener.focus();
    opener.click();
    await settle();
    expect(hostOf(document.querySelector('dialog') as Element)).toBe(full);
  });

  it('renders inside the fullscreen element when nothing has focus', async () => {
    const full = document.createElement('section');
    document.body.append(full);
    Object.defineProperty(document, 'fullscreenElement', { configurable: true, get: () => full });
    const open = ref(false);
    render(
      view(() => [
        h(DialogRoot, { open: open.value, 'onUpdate:open': (value: boolean) => (open.value = value) }, () =>
          h(DialogContent, { 'aria-label': 'Draft' }, () => 'text'),
        ),
      ]),
    );
    expect(document.activeElement).toBe(document.body);
    open.value = true;
    await settle();
    expect(hostOf(document.querySelector('dialog') as Element)).toBe(full);
  });

  it('renders inside the open modal dialog that holds the opener', async () => {
    const outer = ref(true);
    const open = ref(false);
    render(
      view(() => [
        h(DialogRoot, { open: outer.value, 'onUpdate:open': (value: boolean) => (outer.value = value) }, () =>
          h(DialogContent, { 'aria-label': 'Outer' }, () => [
            h('button', { id: 'opener', onClick: () => (open.value = true) }, 'Open inner'),
            h(DialogRoot, { open: open.value, 'onUpdate:open': (value: boolean) => (open.value = value) }, () =>
              h(DialogContent, { 'aria-label': 'Inner' }, () => 'text'),
            ),
          ]),
        ),
      ]),
    );
    await settle();
    const opener = byId(document.body, 'opener');
    opener.focus();
    opener.click();
    await settle();
    const inner = document.querySelector<HTMLDialogElement>('dialog[aria-label="Inner"]');
    expect(inner?.open).toBe(true);
    expect(hostOf(inner as Element)).toBe(document.querySelector('dialog[aria-label="Outer"]'));
  });
});
