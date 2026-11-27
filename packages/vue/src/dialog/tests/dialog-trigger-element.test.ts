// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup } from '@testing-library/vue';
import { defineComponent, h, nextTick, ref } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DialogContent, DialogRoot, DialogTrigger } from '../index';
import { useDialogContext } from '../dialog.context';
import { mountView, settle, stubOverlayBrowser } from './fixtures';

beforeEach(stubOverlayBrowser);
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

let live: () => HTMLElement | null = () => null;
const Probe = defineComponent({
  setup() {
    const ctx = useDialogContext('Probe');
    live = () => ctx.triggerElement.value;
    return () => null;
  },
});

describe('Dialog trigger element', () => {
  it('follows an asChild child that swaps its root element', async () => {
    const tag = ref<'button' | 'a'>('button');
    const open = ref(false);
    mountView(() => [
      h(DialogRoot, { open: open.value, 'onUpdate:open': (value: boolean) => (open.value = value) }, () => [
        h(DialogTrigger, { asChild: true }, () => h(tag.value, { id: 'swapping', href: '#' }, 'Share')),
        h(DialogContent, { 'aria-label': 'Share' }, () => h('p', 'Link')),
        h(Probe),
      ]),
    ]);
    tag.value = 'a';
    await nextTick();
    await settle();
    const swapped = document.getElementById('swapping');
    expect(swapped?.localName).toBe('a');
    open.value = true;
    await nextTick();
    await settle();
    expect(open.value).toBe(true);
    await userEvent.keyboard('{Escape}');
    await settle();
    expect(open.value).toBe(false);
    expect(document.activeElement).toBe(swapped);
  });

  it('follows an asChild component that swaps its own root without the trigger rendering', async () => {
    const tag = ref<'button' | 'a'>('button');
    const Swapping = defineComponent({
      inheritAttrs: false,
      setup:
        (_props, { attrs, slots }) =>
        () =>
          h(tag.value, { ...attrs, id: 'inner', href: '#' }, slots.default?.()),
    });
    const open = ref(false);
    mountView(() => [
      h(DialogRoot, { open: open.value, 'onUpdate:open': (value: boolean) => (open.value = value) }, () => [
        h(DialogTrigger, { asChild: true }, () => h(Swapping, null, () => 'Share')),
        h(DialogContent, { 'aria-label': 'Share' }, () => h('p', 'Link')),
        h(Probe),
      ]),
    ]);
    open.value = true;
    await nextTick();
    await settle();
    tag.value = 'a';
    await nextTick();
    await settle();
    const swapped = document.getElementById('inner');
    expect(swapped?.localName).toBe('a');
    expect(live()).toBe(swapped);
    await userEvent.keyboard('{Escape}');
    await settle();
    expect(open.value).toBe(false);
    expect(document.activeElement).toBe(swapped);
  });
});
