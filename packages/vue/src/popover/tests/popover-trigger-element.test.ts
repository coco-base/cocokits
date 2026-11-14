// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup } from '@testing-library/vue';
import { defineComponent, h, nextTick, ref } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PopoverContent, PopoverRoot, PopoverTrigger } from '../index';
import { usePopoverContext } from '../popover.context';
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
    const ctx = usePopoverContext('Probe');
    live = () => ctx.triggerElement.value;
    return () => null;
  },
});

describe('Popover trigger element', () => {
  it('follows an asChild child that swaps its root element', async () => {
    const tag = ref<'button' | 'a'>('button');
    const open = ref(false);
    mountView(() => [
      h(PopoverRoot, { open: open.value, 'onUpdate:open': (value: boolean) => (open.value = value) }, () => [
        h(PopoverTrigger, { asChild: true }, () => h(tag.value, { id: 'swapping', href: '#' }, 'Share')),
        h(PopoverContent, { 'aria-label': 'Share' }, () => h('p', 'Link')),
        h(Probe),
      ]),
    ]);
    tag.value = 'a';
    await nextTick();
    await settle();
    const swapped = document.getElementById('swapping');
    expect(swapped?.localName).toBe('a');
    if (!swapped) throw new Error('no trigger');
    await userEvent.click(swapped);
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
      h(PopoverRoot, { open: open.value, 'onUpdate:open': (value: boolean) => (open.value = value) }, () => [
        h(PopoverTrigger, { asChild: true }, () => h(Swapping, null, () => 'Share')),
        h(PopoverContent, { 'aria-label': 'Share' }, () => h('p', 'Link')),
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

  it('measures the new anchor when the child of an open overlay swaps its own root', async () => {
    const tag = ref<'button' | 'a'>('button');
    const Swapping = defineComponent({
      inheritAttrs: false,
      setup:
        (_props, { attrs, slots }) =>
        () =>
          h(tag.value, { ...attrs, id: 'inner', href: '#' }, slots.default?.()),
    });
    const open = ref(true);
    mountView(() => [
      h(PopoverRoot, { open: open.value, 'onUpdate:open': (value: boolean) => (open.value = value) }, () => [
        h(PopoverTrigger, { asChild: true }, () => h(Swapping, null, () => 'Share')),
        h(PopoverContent, { 'aria-label': 'Share' }, () => 'Content'),
      ]),
    ]);
    await settle();
    const measured = new Set<Element>();
    const original = Reflect.get<Record<string, (this: Element) => DOMRect>, string>(
      Element.prototype as never,
      'getBoundingClientRect',
    );
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
      measured.add(this);
      return original.call(this);
    });
    tag.value = 'a';
    await nextTick();
    await settle();
    expect(measured.has(document.getElementById('inner') as Element)).toBe(true);
  });
});
