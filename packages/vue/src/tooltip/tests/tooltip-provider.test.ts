// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup, screen } from '@testing-library/vue';
import { h, nextTick, ref } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TooltipContent, TooltipProvider, TooltipRoot, TooltipTrigger } from '../index';
import { mountView, stubOverlayBrowser, tooltipContent } from './fixtures';

beforeEach(() => {
  stubOverlayBrowser();
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
  Reflect.set(globalThis, 'jest', { advanceTimersByTime: (ms: number) => vi.advanceTimersByTime(ms) });
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  Reflect.deleteProperty(globalThis, 'jest');
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const setup = (): ReturnType<typeof userEvent.setup> =>
  userEvent.setup({ delay: null, advanceTimers: (ms) => vi.advanceTimersByTime(ms) });
const elapse = async (ms: number): Promise<void> => {
  await vi.advanceTimersByTimeAsync(ms);
  for (let round = 0; round < 3; round += 1) {
    await nextTick();
    await vi.advanceTimersByTimeAsync(0);
  }
};
const trigger = (name: string): HTMLElement => screen.getByRole('button', { name });
const isOpen = (): boolean => tooltipContent() !== null;

/** Two tooltips; the roots take the given props. */
function pair(rootProps: Record<string, unknown> = {}) {
  return () => [
    h(TooltipRoot, rootProps, () => [
      h(TooltipTrigger, { 'aria-label': 'First' }, () => 'First'),
      h(TooltipContent, { class: 'one' }, () => 'First tip'),
    ]),
    h(TooltipRoot, rootProps, () => [
      h(TooltipTrigger, { 'aria-label': 'Second' }, () => 'Second'),
      h(TooltipContent, { class: 'two' }, () => 'Second tip'),
    ]),
  ];
}

describe('TooltipProvider', () => {
  it('renders no element of its own', () => {
    const { container } = mountView(() => h(TooltipProvider, null, () => h('span', 'inside')));
    expect(container.innerHTML.replaceAll(/<!--.*?-->/g, '')).toBe('<span>inside</span>');
  });

  it('gives the roots inside its delay, and a root prop wins', async () => {
    const user = setup();
    mountView(() => [
      h(TooltipProvider, { delayDuration: 200 }, () => [
        h(TooltipRoot, null, () => [
          h(TooltipTrigger, { 'aria-label': 'First' }, () => 'First'),
          h(TooltipContent, null, () => 'First tip'),
        ]),
        h(TooltipRoot, { delayDuration: 900 }, () => [
          h(TooltipTrigger, { 'aria-label': 'Second' }, () => 'Second'),
          h(TooltipContent, null, () => 'Second tip'),
        ]),
      ]),
    ]);
    await user.hover(trigger('First'));
    await elapse(199);
    expect(isOpen()).toBe(false);
    await elapse(1);
    expect(isOpen()).toBe(true);
    await user.unhover(trigger('First'));
    await elapse(5000);
    expect(isOpen()).toBe(false);
    await user.hover(trigger('Second'));
    await elapse(500);
    expect(isOpen()).toBe(false);
  });

  it('opens the next hover at once while one is open and for skipDelayDuration after it closed', async () => {
    const user = setup();
    mountView(() => h(TooltipProvider, { skipDelayDuration: 300 }, pair()));
    await user.hover(trigger('First'));
    await elapse(700);
    expect(document.querySelector('.one')).not.toBeNull();
    await user.unhover(trigger('First'));
    await user.hover(trigger('Second'));
    await elapse(0);
    expect(document.querySelector('.two')).not.toBeNull();
    await user.unhover(trigger('Second'));
    await elapse(150);
    await user.hover(trigger('First'));
    await elapse(0);
    expect(document.querySelector('.one')).not.toBeNull();
    await user.unhover(trigger('First'));
    await elapse(1000);
    await user.hover(trigger('Second'));
    await elapse(699);
    expect(document.querySelector('.two')).toBeNull();
    await elapse(1);
    expect(document.querySelector('.two')).not.toBeNull();
  });

  it('never skips with skipDelayDuration 0', async () => {
    const user = setup();
    mountView(() => h(TooltipProvider, { skipDelayDuration: 0 }, pair()));
    await user.hover(trigger('First'));
    await elapse(700);
    await user.unhover(trigger('First'));
    await user.hover(trigger('Second'));
    await elapse(699);
    expect(document.querySelector('.two')).toBeNull();
  });

  it('gives no skip to a tooltip outside any provider', async () => {
    const user = setup();
    mountView(pair());
    await user.hover(trigger('First'));
    await elapse(700);
    await user.unhover(trigger('First'));
    await user.hover(trigger('Second'));
    await elapse(699);
    expect(document.querySelector('.two')).toBeNull();
  });

  it('forms its own group in a nested provider', async () => {
    const user = setup();
    mountView(() => [
      h(TooltipProvider, null, () => [
        h(TooltipRoot, null, () => [
          h(TooltipTrigger, { 'aria-label': 'First' }, () => 'First'),
          h(TooltipContent, { class: 'one' }, () => 'First tip'),
        ]),
        h(TooltipProvider, null, () =>
          h(TooltipRoot, null, () => [
            h(TooltipTrigger, { 'aria-label': 'Nested' }, () => 'Nested'),
            h(TooltipContent, { class: 'nested' }, () => 'Nested tip'),
          ]),
        ),
      ]),
    ]);
    await user.hover(trigger('First'));
    await elapse(700);
    await user.hover(trigger('Nested'));
    await elapse(699);
    expect(document.querySelector('.nested')).toBeNull();
  });

  it('gives disableHoverableContent, disableClosingTrigger and disabled to the roots inside', async () => {
    const user = setup();
    const disabled = ref(false);
    mountView(() =>
      h(TooltipProvider, { disableHoverableContent: true, disableClosingTrigger: true, disabled: disabled.value }, () =>
        h(TooltipRoot, null, () => [
          h(TooltipTrigger, { 'aria-label': 'First' }, () => 'First'),
          h(TooltipContent, null, () => 'First tip'),
        ]),
      ),
    );
    await user.hover(trigger('First'));
    await elapse(700);
    expect(isOpen()).toBe(true);
    await user.click(trigger('First'));
    await elapse(0);
    expect(isOpen()).toBe(true);
    await user.unhover(trigger('First'));
    await elapse(0);
    expect(isOpen()).toBe(false);
    disabled.value = true;
    await elapse(0);
    await user.hover(trigger('First'));
    await elapse(2000);
    expect(isOpen()).toBe(false);
  });

  it('keeps the tooltip shown on a press on the trigger with disableClosingTrigger on the root', async () => {
    const user = setup();
    mountView(() =>
      h(TooltipRoot, { open: true, disableClosingTrigger: true }, () => [
        h(TooltipTrigger, { 'aria-label': 'First' }, () => 'First'),
        h(TooltipContent, null, () => 'First tip'),
      ]),
    );
    await elapse(0);
    await user.click(trigger('First'));
    await elapse(0);
    expect(isOpen()).toBe(true);
  });

  it('has no closeDelay prop', () => {
    // @ts-expect-error closeDelay was removed (Reka UI has none)
    const props: InstanceType<typeof TooltipRoot>['$props'] = { closeDelay: 100 };
    expect(props).toBeDefined();
  });
});
