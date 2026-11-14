import { describe, expect, it, vi } from 'vitest';
import {
  TOOLTIP_LEAVE_GRACE_MS,
  createTooltipGroup,
  getTooltipProps,
  tooltipAnatomy,
  tooltipIds,
  tooltipMeta,
  transitionTooltip,
  type TooltipEvent,
  type TooltipState,
} from '../index';

const closed: TooltipState = { id: 't1', open: false };
const open: TooltipState = { id: 't1', open: true };
const event = new Event('x');

const enter = (pointerType: string): TooltipEvent => ({ type: 'TRIGGER.POINTER_ENTER', pointerType, event });

describe('classes and ARIA', () => {
  it('renders the part classes', () => {
    const parts = getTooltipProps(open, vi.fn());
    expect(tooltipAnatomy.classes).toMatchObject({
      trigger: 'cck-tooltip__trigger',
      content: 'cck-tooltip__content',
      arrow: 'cck-tooltip__arrow',
    });
    expect(parts.trigger.class).toBe('cck-tooltip__trigger');
    expect(parts.content.class).toBe('cck-tooltip__content');
  });

  it('describes the trigger by the content only while the content is mounted', () => {
    expect(getTooltipProps(closed, vi.fn()).trigger['aria-describedby']).toBeUndefined();
    expect(getTooltipProps(open, vi.fn()).trigger['aria-describedby']).toBe(tooltipIds('t1').content);
    expect(getTooltipProps({ ...closed, mounted: true }, vi.fn()).trigger['aria-describedby']).toBe(
      tooltipIds('t1').content,
    );
  });

  it('gives the content the tooltip role and never makes it focusable', () => {
    const content = getTooltipProps(open, vi.fn()).content;
    expect(content.role).toBe('tooltip');
    expect(content.id).toBe(tooltipIds('t1').content);
    expect(content).not.toHaveProperty('tabIndex');
  });

  it('renders the state, side (default top) and align (default center)', () => {
    const parts = getTooltipProps(open, vi.fn());
    expect(parts.trigger['data-state']).toBe('open');
    expect(parts.content).toMatchObject({ 'data-state': 'open', 'data-side': 'top', 'data-align': 'center' });
    expect(getTooltipProps({ ...closed, side: 'end', align: 'start' }, vi.fn()).content).toMatchObject({
      'data-state': 'closed',
      'data-side': 'end',
      'data-align': 'start',
    });
  });

  it('renders exactly the attributes the meta declares', () => {
    const dataKeys = (props: object): string[] =>
      Object.entries(props)
        .filter(([name, value]) => name.startsWith('data-') && value !== undefined)
        .map(([name]) => name);
    const parts = getTooltipProps(open, vi.fn());
    expect(dataKeys(parts.trigger)).toEqual([...tooltipMeta.dataAttrs.trigger]);
    expect(dataKeys(parts.content)).toEqual([...tooltipMeta.dataAttrs.content]);
  });

  it('shows closed while disabled, even when open is true', () => {
    const parts = getTooltipProps({ ...open, disabled: true }, vi.fn());
    expect(parts.trigger['data-state']).toBe('closed');
    expect(parts.trigger['aria-describedby']).toBeUndefined();
  });
});

describe('handlers', () => {
  it('send the pointer events with the pointer type', () => {
    const send = vi.fn();
    const trigger = getTooltipProps(closed, send).trigger;
    const pointer = Object.assign(new Event('pointerenter'), { pointerType: 'mouse' }) as unknown as PointerEvent;
    trigger.onPointerEnter(pointer);
    trigger.onPointerLeave(pointer);
    trigger.onPointerDown(pointer);
    expect(send.mock.calls.map(([sent]) => (sent as TooltipEvent).type)).toEqual([
      'TRIGGER.POINTER_ENTER',
      'TRIGGER.POINTER_LEAVE',
      'TRIGGER.POINTER_DOWN',
    ]);
    expect(send.mock.calls[0]?.[0]).toMatchObject({ pointerType: 'mouse' });
  });

  it('send the content pointer events', () => {
    const send = vi.fn();
    const content = getTooltipProps(open, send).content;
    content.onPointerEnter(new Event('pointerenter') as PointerEvent);
    content.onPointerLeave(new Event('pointerleave') as PointerEvent);
    expect(send.mock.calls.map(([sent]) => (sent as TooltipEvent).type)).toEqual([
      'CONTENT.POINTER_ENTER',
      'CONTENT.POINTER_LEAVE',
    ]);
  });

  it('send focus with the focus-visible answer of the state, false when it has none', () => {
    const send = vi.fn();
    getTooltipProps({ ...closed, isFocusVisible: () => true }, send).trigger.onFocus(new Event('focus') as FocusEvent);
    getTooltipProps(closed, send).trigger.onFocus(new Event('focus') as FocusEvent);
    getTooltipProps(closed, send).trigger.onBlur(new Event('blur') as FocusEvent);
    expect(send.mock.calls[0]?.[0]).toMatchObject({ type: 'TRIGGER.FOCUS', focusVisible: true });
    expect(send.mock.calls[1]?.[0]).toMatchObject({ type: 'TRIGGER.FOCUS', focusVisible: false });
    expect(send.mock.calls[2]?.[0]).toMatchObject({ type: 'TRIGGER.BLUR' });
  });
});

describe('transitionTooltip: opening', () => {
  it('opens after the delay (700 ms by default) on mouse or pen hover', () => {
    for (const pointerType of ['mouse', 'pen']) {
      expect(transitionTooltip(closed, enter(pointerType))).toEqual({
        schedule: { open: true, reason: 'hover', delay: 700 },
      });
    }
    expect(transitionTooltip({ ...closed, delay: 0 }, enter('mouse'))).toEqual({
      schedule: { open: true, reason: 'hover', delay: 0 },
    });
  });

  it('never opens on touch', () => {
    expect(transitionTooltip(closed, enter('touch'))).toBeNull();
  });

  it('opens at once on keyboard focus, and not on a pointer focus', () => {
    expect(transitionTooltip(closed, { type: 'TRIGGER.FOCUS', focusVisible: true, event })).toEqual({
      schedule: { open: true, reason: 'focus', delay: 0 },
    });
    expect(transitionTooltip(closed, { type: 'TRIGGER.FOCUS', focusVisible: false, event })).toBeNull();
  });

  it('never opens while disabled', () => {
    const disabled = { ...closed, disabled: true };
    expect(transitionTooltip(disabled, enter('mouse'))).toBeNull();
    expect(transitionTooltip(disabled, { type: 'TRIGGER.FOCUS', focusVisible: true, event })).toBeNull();
  });

  it('only cancels a pending close when the pointer comes back while open', () => {
    expect(transitionTooltip(open, enter('mouse'))).toEqual({});
    expect(transitionTooltip(open, { type: 'CONTENT.POINTER_ENTER', event })).toEqual({});
  });
});

describe('transitionTooltip: closing', () => {
  it('closes after closeDelay, at least the grace that lets the pointer reach the content', () => {
    expect(TOOLTIP_LEAVE_GRACE_MS).toBeGreaterThan(0);
    expect(transitionTooltip(open, { type: 'TRIGGER.POINTER_LEAVE', event })).toEqual({
      schedule: { open: false, reason: 'pointer-leave', delay: TOOLTIP_LEAVE_GRACE_MS },
    });
    expect(transitionTooltip({ ...open, closeDelay: 500 }, { type: 'TRIGGER.POINTER_LEAVE', event })).toEqual({
      schedule: { open: false, reason: 'pointer-leave', delay: 500 },
    });
    expect(transitionTooltip(open, { type: 'CONTENT.POINTER_LEAVE', event })).toEqual({
      schedule: { open: false, reason: 'pointer-leave', delay: TOOLTIP_LEAVE_GRACE_MS },
    });
  });

  it('cancels a pending open when the pointer leaves before it opened', () => {
    expect(transitionTooltip(closed, { type: 'TRIGGER.POINTER_LEAVE', event })).toEqual({});
    expect(transitionTooltip(closed, { type: 'CONTENT.POINTER_LEAVE', event })).toEqual({});
  });

  it('closes at once on blur, on a press on the trigger and on Escape', () => {
    expect(transitionTooltip(open, { type: 'TRIGGER.BLUR', event })).toEqual({
      schedule: { open: false, reason: 'blur', delay: 0 },
    });
    expect(transitionTooltip(open, { type: 'TRIGGER.POINTER_DOWN', event })).toEqual({
      schedule: { open: false, reason: 'press', delay: 0 },
    });
    expect(transitionTooltip(open, { type: 'CONTENT.DISMISS', reason: 'escape', event })).toEqual({
      schedule: { open: false, reason: 'escape', delay: 0 },
    });
  });

  it('closes at once on an outside press, with its own reason', () => {
    expect(transitionTooltip(open, { type: 'CONTENT.DISMISS', reason: 'outside-press', event })).toEqual({
      schedule: { open: false, reason: 'outside-press', delay: 0 },
    });
    expect(transitionTooltip(closed, { type: 'CONTENT.DISMISS', reason: 'outside-press', event })).toEqual({});
  });

  it('cancels a pending open on blur, press or Escape while closed', () => {
    expect(transitionTooltip(closed, { type: 'TRIGGER.BLUR', event })).toEqual({});
    expect(transitionTooltip(closed, { type: 'TRIGGER.POINTER_DOWN', event })).toEqual({});
    expect(transitionTooltip(closed, { type: 'CONTENT.DISMISS', reason: 'escape', event: null })).toEqual({});
  });
});

describe('disableHoverableContent and disableClosingTrigger', () => {
  const leaveTrigger: TooltipEvent = { type: 'TRIGGER.POINTER_LEAVE', event };

  it('hides at once when the pointer leaves, whatever closeDelay says', () => {
    expect(transitionTooltip({ ...open, disableHoverableContent: true, closeDelay: 500 }, leaveTrigger)).toEqual({
      schedule: { open: false, reason: 'pointer-leave', delay: 0 },
    });
  });

  it('ignores the pointer on the content', () => {
    expect(
      transitionTooltip({ ...open, disableHoverableContent: true }, { type: 'CONTENT.POINTER_ENTER', event }),
    ).toBeNull();
    expect(transitionTooltip(open, { type: 'CONTENT.POINTER_ENTER', event })).toEqual({});
  });

  it('ignores a press on the trigger only with disableClosingTrigger', () => {
    const press: TooltipEvent = { type: 'TRIGGER.POINTER_DOWN', event };
    expect(transitionTooltip({ ...open, disableClosingTrigger: true }, press)).toBeNull();
    expect(transitionTooltip(open, press)).toEqual({ schedule: { open: false, reason: 'press', delay: 0 } });
  });
});

describe('scroll', () => {
  it('closes a shown tooltip at once with the reason scroll', () => {
    expect(transitionTooltip(open, { type: 'ANCESTOR.SCROLL', event })).toEqual({
      schedule: { open: false, reason: 'scroll', delay: 0 },
    });
  });

  it('only cancels a pending open while closed', () => {
    expect(transitionTooltip(closed, { type: 'ANCESTOR.SCROLL', event })).toEqual({});
  });
});

describe('description', () => {
  const ids = tooltipIds('t1');

  it('described: the trigger names the description, the content is aria-hidden', () => {
    for (const state of [closed, open]) {
      const parts = getTooltipProps({ ...state, description: 'described' }, vi.fn());
      expect(parts.trigger['aria-describedby']).toBe(ids.description);
      expect(parts.content['aria-hidden']).toBe('true');
    }
    expect(ids.description).toBe('t1-description');
  });

  it('suppressed: the trigger names nothing, the content is aria-hidden', () => {
    const parts = getTooltipProps({ ...open, description: 'suppressed' }, vi.fn());
    expect(parts.trigger['aria-describedby']).toBeUndefined();
    expect(parts.content['aria-hidden']).toBe('true');
  });

  it('none (the default): the content id while mounted, no aria-hidden', () => {
    for (const description of [undefined, 'none' as const]) {
      const parts = getTooltipProps({ ...open, description }, vi.fn());
      expect(parts.trigger['aria-describedby']).toBe(ids.content);
      expect(parts.content['aria-hidden']).toBeUndefined();
      expect(getTooltipProps({ ...closed, description }, vi.fn()).trigger['aria-describedby']).toBeUndefined();
    }
  });

  it('treats a disabled tooltip as none', () => {
    const parts = getTooltipProps({ ...open, disabled: true, description: 'described' }, vi.fn());
    expect(parts.trigger['aria-describedby']).toBeUndefined();
    expect(parts.content['aria-hidden']).toBeUndefined();
  });
});

describe('createTooltipGroup', () => {
  const setup = (skipDelayDuration?: number) => {
    let time = 1000;
    const group = createTooltipGroup({ skipDelayDuration, now: () => time });
    return { group, advance: (ms: number) => (time += ms) };
  };

  it('waits the own delay in a fresh group', () => {
    expect(setup().group.delayFor(700)).toBe(700);
  });

  it('opens at once while a tooltip of the group is open', () => {
    const { group, advance } = setup();
    group.opened();
    advance(5000);
    expect(group.delayFor(700)).toBe(0);
  });

  it('opens at once within skipDelayDuration after a close, then waits again', () => {
    const { group, advance } = setup(300);
    group.opened();
    group.closed();
    advance(299);
    expect(group.delayFor(700)).toBe(0);
    advance(1);
    expect(group.delayFor(700)).toBe(700);
  });

  it('never skips with skipDelayDuration 0', () => {
    const { group } = setup(0);
    group.opened();
    expect(group.delayFor(700)).toBe(700);
    group.closed();
    expect(group.delayFor(700)).toBe(700);
  });

  it('defaults to a 300 ms window on the real clock', () => {
    const group = createTooltipGroup();
    group.opened();
    group.closed();
    expect(group.delayFor(700)).toBe(0);
  });
});

describe('meta', () => {
  it('links the APG pattern and declares the roles and elements', () => {
    expect(tooltipMeta.apg).toBe('https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/');
    expect(tooltipMeta.roles.content).toBe('tooltip');
    expect(tooltipMeta.defaultElements).toMatchObject({ trigger: 'button', content: 'div', arrow: 'span' });
  });

  it('lists every keyboard row of the spec', () => {
    expect(tooltipMeta.keyboard.map((row) => row.key)).toEqual(['Tab (focus arrives)', 'Escape', 'Tab (focus leaves)']);
  });
});

describe('arrow and kept content', () => {
  it('renders a decorative arrow, natively hidden only while it cannot point', () => {
    expect(getTooltipProps(open, vi.fn()).arrow).toEqual({
      class: 'cck-tooltip__arrow',
      'aria-hidden': 'true',
      hidden: undefined,
    });
    expect(getTooltipProps({ ...open, arrowHidden: true }, vi.fn()).arrow.hidden).toBe(true);
    expect(tooltipMeta.roles.arrow).toBeNull();
    expect(tooltipMeta.dataAttrs.arrow).toEqual([]);
  });

  it('hides closed content that stays mounted, and only that', () => {
    expect(getTooltipProps(closed, vi.fn()).content.hidden).toBeUndefined();
    expect(getTooltipProps({ ...closed, mounted: true, keptClosed: true }, vi.fn()).content).toMatchObject({
      hidden: true,
      'data-state': 'closed',
    });
    expect(getTooltipProps({ ...open, keptClosed: false }, vi.fn()).content.hidden).toBeUndefined();
  });
});

describe('meta defaults', () => {
  it('names the side and the align the content renders with no input', () => {
    const { content } = getTooltipProps(open, vi.fn());
    expect(content['data-side']).toBe(tooltipMeta.dataAttrDetails?.['data-side']?.default);
    expect(content['data-align']).toBe(tooltipMeta.dataAttrDetails?.['data-align']?.default);
  });
});
