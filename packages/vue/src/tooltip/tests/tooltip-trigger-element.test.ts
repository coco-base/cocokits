// @vitest-environment jsdom
import { cleanup } from '@testing-library/vue';
import { defineComponent, h, nextTick, ref } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TooltipContent, TooltipRoot, TooltipTrigger } from '../index';
import { useTooltipContext } from '../tooltip.context';
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
    const ctx = useTooltipContext('Probe');
    live = () => ctx.triggerElement.value;
    return () => null;
  },
});

describe('Tooltip trigger element', () => {
  it('anchors to an asChild component that swaps its own root', async () => {
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
      h(TooltipRoot, { open: open.value, 'onUpdate:open': (value: boolean) => (open.value = value) }, () => [
        h(TooltipTrigger, { asChild: true }, () => h(Swapping, null, () => 'Copy')),
        h(TooltipContent, null, () => 'Copy the link'),
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
      h(TooltipRoot, { open: open.value, 'onUpdate:open': (value: boolean) => (open.value = value) }, () => [
        h(TooltipTrigger, { asChild: true }, () => h(Swapping, null, () => 'Share')),
        h(TooltipContent, { 'aria-label': 'Share' }, () => 'Content'),
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
