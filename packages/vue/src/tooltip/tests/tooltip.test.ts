// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup, fireEvent, screen, waitFor } from '@testing-library/vue';
import { h, nextTick, ref } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PopoverContent, PopoverRoot, PopoverTrigger } from '../../popover';
import { tooltipMeta } from '@cocokits/machines/tooltip';
import { TooltipContent, TooltipRoot, TooltipTrigger } from '../index';
import { mountView, settle, stubOverlayBrowser, tooltipContent, tooltipDescription, tooltipView } from './fixtures';

beforeEach(() => {
  stubOverlayBrowser();
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  // Testing Library waits with a real timer unless it finds fake ones through a `jest` global; vitest's fake
  // clock is the same one, so this lets `waitFor` and user-event advance it instead of hanging.
  Reflect.set(globalThis, 'jest', { advanceTimersByTime: (ms: number) => vi.advanceTimersByTime(ms) });
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  Reflect.deleteProperty(globalThis, 'jest');
  Reflect.deleteProperty(HTMLElement.prototype, 'getAnimations');
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const setup = (): ReturnType<typeof userEvent.setup> =>
  userEvent.setup({ delay: null, advanceTimers: (ms) => vi.advanceTimersByTime(ms) });
/** Back to the real clock, for a test that waits on an animation frame (focus moves in a frame). */
const useRealClock = (): void => {
  vi.useRealTimers();
  Reflect.deleteProperty(globalThis, 'jest');
};
/** Advances the fake clock and lets Vue and the portal flush. */
const elapse = async (ms: number): Promise<void> => {
  await vi.advanceTimersByTimeAsync(ms);
  for (let round = 0; round < 3; round += 1) {
    await nextTick();
    await vi.advanceTimersByTimeAsync(0);
  }
};
const trigger = (): HTMLElement => screen.getByRole('button', { name: 'Copy link' });
const tip = (): HTMLElement | null => tooltipContent();
const isOpen = (): boolean => tip() !== null;
const shown = (): HTMLElement => {
  const element = tip();
  if (!element) throw new Error('Expected the tooltip to be open.');
  return element;
};

describe('Tooltip rendered contract', () => {
  it('renders no element for the root, and a closed trigger without a description', () => {
    const { container } = mountView(tooltipView({}));
    expect(container.children).toHaveLength(3);
    expect(trigger().tagName).toBe('BUTTON');
    expect([...trigger().classList]).toContain('cck-tooltip__trigger');
    expect(trigger().getAttribute('data-state')).toBe('closed');
    expect(trigger().hasAttribute('aria-describedby')).toBe(false);
    expect(isOpen()).toBe(false);
  });

  it('renders the default elements of the meta and a button trigger that never submits a form', async () => {
    mountView(tooltipView({ rootProps: { open: true } }));
    await elapse(0);
    expect(trigger().localName).toBe(tooltipMeta.defaultElements?.trigger);
    expect(trigger().getAttribute('type')).toBe('button');
    expect(shown().localName).toBe(tooltipMeta.defaultElements?.content);
  });

  it('keeps the type of an asChild trigger child', () => {
    mountView(() =>
      h(TooltipRoot, null, () => [
        h(TooltipTrigger, { asChild: true }, () => h('a', { href: '#x' }, 'Link')),
        h(TooltipContent, null, () => 'Tip'),
      ]),
    );
    expect(screen.getByRole('link').hasAttribute('type')).toBe(false);
  });

  it('shows on keyboard focus: a tooltip in the overlay container, linked to the trigger', async () => {
    const user = setup();
    const { container } = mountView(tooltipView({}));
    await user.tab();
    await user.tab();
    await elapse(0);
    const content = shown();
    expect([...content.classList]).toContain('cck-tooltip__content');
    expect(content.getAttribute('data-state')).toBe('open');
    expect(content.getAttribute('data-side')).toBe('top');
    expect(content.getAttribute('data-align')).toBe('center');
    expect(content.hasAttribute('tabindex')).toBe(false);
    expect(container.contains(content)).toBe(false);
    expect(content.parentElement?.getAttribute('popover')).toBe('manual');
    expect(content.style.position).toBe('fixed');
    expect(trigger().getAttribute('aria-describedby')).toBe(tooltipDescription()?.id);
    expect(content.getAttribute('aria-hidden')).toBe('true');
    expect(trigger().getAttribute('data-state')).toBe('open');
  });

  it('renders the requested side and alignment as data attributes', async () => {
    mountView(tooltipView({ rootProps: { open: true }, contentProps: { side: 'bottom', align: 'end' } }));
    await elapse(0);
    expect(shown().getAttribute('data-side')).toBe('bottom');
    expect(shown().getAttribute('data-align')).toBe('end');
  });

  it('adds its id to the description the author wrote', async () => {
    mountView(() => [
      h(TooltipRoot, { open: true }, () => [
        h(TooltipTrigger, { 'aria-label': 'Copy', 'aria-describedby': 'mine' }, () => 'x'),
        h(TooltipContent, null, () => 'Tip'),
      ]),
    ]);
    await elapse(0);
    expect(screen.getByRole('button', { name: 'Copy' }).getAttribute('aria-describedby')).toBe(
      `mine ${tooltipDescription()?.id ?? ''}`,
    );
  });

  it('merges onto the child with asChild', async () => {
    mountView(() => [
      h(TooltipRoot, { open: true }, () => [
        h(TooltipTrigger, { asChild: true }, () => h('a', { href: '#x', class: 'mine' }, 'Link')),
        h(TooltipContent, { asChild: true }, () => h('section', { class: 'mine' }, 'Tip')),
      ]),
    ]);
    await elapse(0);
    const link = screen.getByRole('link', { name: 'Link' });
    expect([...link.classList]).toEqual(expect.arrayContaining(['cck-tooltip__trigger', 'mine']));
    expect(link.hasAttribute('type')).toBe(false);
    const content = shown();
    expect(content.tagName).toBe('SECTION');
    expect(content.getAttribute('role')).toBe('tooltip');
    expect(link.getAttribute('aria-describedby')).toBe(content.id);
  });

  it('throws a descriptive error for a part outside a root', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(() => mountView(() => h(TooltipTrigger))).toThrow('<TooltipTrigger> must be used inside <TooltipRoot>');
    expect(() => mountView(() => h(TooltipContent))).toThrow('<TooltipContent> must be used inside <TooltipRoot>');
  });
});

describe('Tooltip hover', () => {
  it('opens after the delay on a mouse hover and emits update:open', async () => {
    const user = setup();
    const onOpenChange = vi.fn();
    mountView(tooltipView({ rootProps: { 'onUpdate:open': onOpenChange } }));
    await user.hover(trigger());
    await elapse(699);
    expect(isOpen()).toBe(false);
    await elapse(1);
    expect(isOpen()).toBe(true);
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(true);
  });

  it('does not open when the pointer leaves before the delay', async () => {
    const user = setup();
    const onOpenChange = vi.fn();
    mountView(tooltipView({ rootProps: { 'onUpdate:open': onOpenChange } }));
    await user.hover(trigger());
    await elapse(300);
    await user.unhover(trigger());
    await elapse(1000);
    expect(isOpen()).toBe(false);
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('uses the delayDuration prop', async () => {
    const user = setup();
    mountView(tooltipView({ rootProps: { delayDuration: 100 } }));
    await user.hover(trigger());
    await elapse(100);
    expect(isOpen()).toBe(true);
  });

  it('closes after the pointer leaves', async () => {
    const user = setup();
    const onOpenChange = vi.fn();
    mountView(tooltipView({ rootProps: { 'onUpdate:open': onOpenChange } }));
    await user.hover(trigger());
    await elapse(700);
    expect(isOpen()).toBe(true);
    await user.unhover(trigger());
    await elapse(100);
    expect(isOpen()).toBe(false);
    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
  });

  it('hides at once with disableHoverableContent, and the pointer on the content does not keep it open', async () => {
    const user = setup();
    mountView(tooltipView({ rootProps: { disableHoverableContent: true } }));
    await user.hover(trigger());
    await elapse(700);
    expect(isOpen()).toBe(true);
    await user.unhover(trigger());
    await elapse(0);
    expect(isOpen()).toBe(false);
  });

  it('stays open while the pointer crosses to the content (hoverable) and closes after leaving it', async () => {
    const user = setup();
    mountView(tooltipView({}));
    await user.hover(trigger());
    await elapse(700);
    await user.unhover(trigger());
    await elapse(50);
    await user.hover(shown());
    await elapse(2000);
    expect(isOpen()).toBe(true);
    await user.unhover(shown());
    await elapse(100);
    expect(isOpen()).toBe(false);
  });
});

describe('Tooltip focus and keyboard', () => {
  it('opens at once on keyboard focus and closes on blur', async () => {
    const user = setup();
    const onOpenChange = vi.fn();
    mountView(tooltipView({ rootProps: { 'onUpdate:open': onOpenChange } }));
    await user.tab();
    await user.tab();
    await elapse(0);
    expect(isOpen()).toBe(true);
    await user.tab();
    await elapse(0);
    expect(isOpen()).toBe(false);
    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
  });

  it('closes on Escape and keeps focus on the trigger', async () => {
    const user = setup();
    const onOpenChange = vi.fn();
    mountView(tooltipView({ rootProps: { 'onUpdate:open': onOpenChange } }));
    await user.tab();
    await user.tab();
    await elapse(0);
    await user.keyboard('{Escape}');
    await elapse(0);
    expect(isOpen()).toBe(false);
    expect(document.activeElement).toBe(trigger());
    expect(onOpenChange.mock.calls.at(-1)).toEqual([false]);
  });

  it('does not open on a mouse click: the press cancels the pending hover', async () => {
    const user = setup();
    const onOpenChange = vi.fn();
    mountView(tooltipView({ rootProps: { 'onUpdate:open': onOpenChange } }));
    await user.click(trigger());
    await elapse(2000);
    expect(isOpen()).toBe(false);
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('closes on a press on the trigger', async () => {
    const user = setup();
    const onOpenChange = vi.fn();
    mountView(tooltipView({ rootProps: { 'onUpdate:open': onOpenChange } }));
    await user.hover(trigger());
    await elapse(700);
    await user.pointer({ keys: '[MouseLeft>]', target: trigger() });
    await elapse(0);
    expect(isOpen()).toBe(false);
    expect(onOpenChange.mock.calls.at(-1)).toEqual([false]);
  });
});

describe('Tooltip touch', () => {
  it('never opens on a touch hover or a tap', async () => {
    const user = setup();
    const onOpenChange = vi.fn();
    mountView(tooltipView({ rootProps: { 'onUpdate:open': onOpenChange } }));
    const touch = async (type: string): Promise<void> => {
      const event = new Event(type, { bubbles: true });
      Object.defineProperty(event, 'pointerType', { value: 'touch' });
      await fireEvent(trigger(), event);
    };
    await touch('pointerover');
    await touch('pointerenter');
    await touch('pointerdown');
    await user.pointer({ keys: '[TouchA]', target: trigger() });
    await elapse(2000);
    expect(isOpen()).toBe(false);
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});

describe('Tooltip open state', () => {
  it('v-model: updates the bound value and emits update:open for a change the user makes', async () => {
    const user = setup();
    const open = ref(false);
    const onOpenChange = vi.fn();
    mountView(
      tooltipView({
        rootProps: () => ({
          open: open.value,
          'onUpdate:open': (value: boolean) => {
            open.value = value;
            onOpenChange(value);
          },
        }),
      }),
    );
    await user.tab();
    await user.tab();
    await elapse(0);
    expect(open.value).toBe(true);
    expect(isOpen()).toBe(true);
    expect(onOpenChange).toHaveBeenCalledTimes(1);
  });

  it('follows the open prop without reporting', async () => {
    useRealClock();
    const open = ref(false);
    const onOpenChange = vi.fn();
    mountView(
      tooltipView({
        rootProps: () => ({ open: open.value, 'onUpdate:open': onOpenChange }),
      }),
    );
    open.value = true;
    await settle();
    expect(isOpen()).toBe(true);
    open.value = false;
    await settle();
    expect(isOpen()).toBe(false);
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('never opens while disabled, and closes when it becomes disabled', async () => {
    useRealClock();
    const user = userEvent.setup();
    const disabled = ref(true);
    const open = ref(false);
    mountView(
      tooltipView({
        rootProps: () => ({ disabled: disabled.value, open: open.value }),
      }),
    );
    await user.hover(trigger());
    await settle();
    await user.tab();
    await user.tab();
    await settle();
    expect(isOpen()).toBe(false);
    expect(trigger().getAttribute('data-state')).toBe('closed');
    disabled.value = false;
    open.value = true;
    await settle();
    expect(isOpen()).toBe(true);
    disabled.value = true;
    await settle();
    expect(isOpen()).toBe(false);
  });

  it('unmounts after the exit animation of the content has finished', async () => {
    const user = setup();
    mountView(tooltipView({}));
    await user.tab();
    await user.tab();
    await elapse(0);
    const content = shown();
    let finish: () => void = () => undefined;
    const finished = new Promise<void>((resolve) => {
      finish = resolve;
    });
    content.getAnimations = () => [
      {
        finished,
        animationName: 'exit',
        playState: 'running',
        effect: { getComputedTiming: () => ({ endTime: 300 }) },
      } as unknown as Animation,
    ];
    await user.keyboard('{Escape}');
    await elapse(0);
    expect(shown().getAttribute('data-state')).toBe('closed');
    expect(trigger().getAttribute('aria-describedby')).toBe(tooltipDescription()?.id);
    finish();
    await finished;
    await elapse(0);
    expect(isOpen()).toBe(false);
    expect(trigger().getAttribute('aria-describedby')).toBe(tooltipDescription()?.id);
  });

  it('clears its timer and layer when it unmounts while pending or open', async () => {
    const user = setup();
    const onOpenChange = vi.fn();
    const view = mountView(tooltipView({ rootProps: { 'onUpdate:open': onOpenChange } }));
    await user.hover(trigger());
    view.unmount();
    await elapse(2000);
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(document.querySelector('[popover]')).toBeNull();
  });
});

describe('Tooltip inside a Popover', () => {
  const inside = (): (() => ReturnType<typeof h>) => () =>
    h(PopoverRoot, null, () => [
      h(PopoverTrigger, null, () => 'Share'),
      h(PopoverContent, { 'aria-label': 'Share panel' }, () =>
        h(TooltipRoot, null, () => [
          h(TooltipTrigger, { 'aria-label': 'Copy link' }, () => 'Copy'),
          h(TooltipContent, null, () => 'Copy the link'),
        ]),
      ),
    ]);

  it('shows above the popover, hides on the first Escape and leaves the popover to the second', async () => {
    useRealClock();
    const user = userEvent.setup();
    mountView(inside());
    await user.click(screen.getByRole('button', { name: 'Share' }));
    await waitFor(() => {
      expect(document.activeElement).toBe(trigger());
    });
    expect(isOpen()).toBe(true);
    await user.keyboard('{Escape}');
    await settle();
    expect(isOpen()).toBe(false);
    expect(screen.queryByRole('dialog', { name: 'Share panel' })).not.toBeNull();
    await user.keyboard('{Escape}');
    await settle();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('does not close the popover on a press on the tooltip content', async () => {
    useRealClock();
    const user = userEvent.setup();
    mountView(inside());
    await user.click(screen.getByRole('button', { name: 'Share' }));
    await waitFor(() => {
      expect(isOpen()).toBe(true);
    });
    await user.pointer({ keys: '[MouseLeft]', target: shown() });
    expect(screen.queryByRole('dialog', { name: 'Share panel' })).not.toBeNull();
  });
});
