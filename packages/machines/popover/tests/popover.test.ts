import { describe, expect, it, vi } from 'vitest';
import {
  getPopoverProps,
  popoverAnatomy,
  popoverIds,
  popoverMeta,
  transitionPopover,
  type PopoverState,
} from '../index';

const closed: PopoverState = { id: 'p1', open: false };
const open: PopoverState = { id: 'p1', open: true };
const click = (): Event => new Event('click', { cancelable: true });

describe('classes', () => {
  it('renders the part classes', () => {
    const parts = getPopoverProps(open, vi.fn());
    expect(popoverAnatomy.classes).toMatchObject({
      trigger: 'cck-popover__trigger',
      anchor: 'cck-popover__anchor',
      content: 'cck-popover__content',
      title: 'cck-popover__title',
      description: 'cck-popover__description',
      close: 'cck-popover__close',
      arrow: 'cck-popover__arrow',
    });
    expect(parts.anchor.class).toBe('cck-popover__anchor');
    expect(parts.title.class).toBe('cck-popover__title');
    expect(parts.description.class).toBe('cck-popover__description');
    expect(parts.trigger.class).toBe('cck-popover__trigger');
    expect(parts.content.class).toBe('cck-popover__content');
    expect(parts.close.class).toBe('cck-popover__close');
  });
});

describe('trigger ARIA (disclosure)', () => {
  it('renders aria-expanded always and aria-controls only while the content is mounted', () => {
    expect(getPopoverProps(closed, vi.fn()).trigger['aria-expanded']).toBe('false');
    expect(getPopoverProps(closed, vi.fn()).trigger['aria-controls']).toBeUndefined();
    expect(getPopoverProps(open, vi.fn()).trigger['aria-expanded']).toBe('true');
    expect(getPopoverProps(open, vi.fn()).trigger['aria-controls']).toBe(popoverIds('p1').content);
    expect(getPopoverProps({ ...closed, mounted: true }, vi.fn()).trigger['aria-controls']).toBe(
      popoverIds('p1').content,
    );
  });

  it('is a button that opens a dialog', () => {
    expect(getPopoverProps(closed, vi.fn()).trigger).toMatchObject({ type: 'button', 'aria-haspopup': 'dialog' });
  });
});

describe('content', () => {
  it('is a non-modal dialog that can take programmatic focus', () => {
    const content = getPopoverProps(open, vi.fn()).content;
    expect(content).toMatchObject({ role: 'dialog', tabIndex: -1, id: popoverIds('p1').content });
    expect(content['aria-modal']).toBeUndefined();
  });

  it('renders the resolved side and align, defaulting to bottom and center', () => {
    expect(getPopoverProps(open, vi.fn()).content).toMatchObject({ 'data-side': 'bottom', 'data-align': 'center' });
    expect(getPopoverProps({ ...open, side: 'end', align: 'start' }, vi.fn()).content).toMatchObject({
      'data-side': 'end',
      'data-align': 'start',
    });
  });

  it('labels and describes the content only while a Title or Description is mounted', () => {
    const ids = popoverIds('p1');
    const bare = getPopoverProps(open, vi.fn());
    expect(bare.content['aria-labelledby']).toBeUndefined();
    expect(bare.content['aria-describedby']).toBeUndefined();
    const named = getPopoverProps({ ...open, hasTitle: true, hasDescription: true }, vi.fn());
    expect(named.content['aria-labelledby']).toBe(ids.title);
    expect(named.content['aria-describedby']).toBe(ids.description);
    expect(named.title.id).toBe(ids.title);
    expect(named.description.id).toBe(ids.description);
  });

  it('derives the title and description ids from the popover id', () => {
    expect(popoverIds('p1')).toEqual({
      trigger: 'p1-trigger',
      content: 'p1-content',
      title: 'p1-title',
      description: 'p1-description',
    });
  });

  it('renders hidden only while the anchor is hidden', () => {
    expect(getPopoverProps(open, vi.fn()).content.hidden).toBeUndefined();
    expect(getPopoverProps({ ...open, anchorHidden: false }, vi.fn()).content.hidden).toBeUndefined();
    expect(getPopoverProps({ ...open, anchorHidden: true }, vi.fn()).content.hidden).toBe(true);
  });

  it('renders the state on the trigger and the content', () => {
    expect(getPopoverProps(open, vi.fn()).trigger['data-state']).toBe('open');
    expect(getPopoverProps(closed, vi.fn()).content['data-state']).toBe('closed');
  });

  it('renders exactly the attributes the meta declares', () => {
    const dataKeys = (props: object): string[] =>
      Object.entries(props)
        .filter(([name, value]) => name.startsWith('data-') && value !== undefined)
        .map(([name]) => name);
    const parts = getPopoverProps(open, vi.fn());
    expect(dataKeys(parts.trigger)).toEqual([...popoverMeta.dataAttrs.trigger]);
    expect(dataKeys(parts.content)).toEqual([...popoverMeta.dataAttrs.content]);
    expect(dataKeys(parts.anchor)).toEqual([...popoverMeta.dataAttrs.anchor]);
    expect(dataKeys(parts.title)).toEqual([...popoverMeta.dataAttrs.title]);
    expect(dataKeys(parts.description)).toEqual([...popoverMeta.dataAttrs.description]);
    expect(dataKeys(parts.close)).toEqual([...popoverMeta.dataAttrs.close]);
    expect(dataKeys(parts.arrow)).toEqual([...popoverMeta.dataAttrs.arrow]);
  });
});

describe('handlers', () => {
  it('send the trigger and close clicks', () => {
    const send = vi.fn();
    const parts = getPopoverProps(open, send);
    const event = click();
    parts.trigger.onClick(event);
    parts.close.onClick(event);
    expect(send).toHaveBeenNthCalledWith(1, { type: 'TRIGGER.CLICK', event });
    expect(send).toHaveBeenNthCalledWith(2, { type: 'CLOSE.CLICK', event });
  });

  it('send nothing when a consumer handler vetoed the click', () => {
    const send = vi.fn();
    const event = click();
    event.preventDefault();
    getPopoverProps(open, send).trigger.onClick(event);
    getPopoverProps(open, send).close.onClick(event);
    expect(send).not.toHaveBeenCalled();
  });
});

describe('transitionPopover', () => {
  const event = click();

  it('toggles from the trigger', () => {
    expect(transitionPopover(closed, { type: 'TRIGGER.CLICK', event })).toEqual({ open: true, reason: 'trigger' });
    expect(transitionPopover(open, { type: 'TRIGGER.CLICK', event })).toEqual({ open: false, reason: 'trigger' });
  });

  it('closes from the Close part', () => {
    expect(transitionPopover(open, { type: 'CLOSE.CLICK', event })).toEqual({ open: false, reason: 'close' });
  });

  it('closes on every layer stack reason', () => {
    for (const reason of ['escape', 'outside-press', 'focus-out'] as const) {
      expect(transitionPopover(open, { type: 'CONTENT.DISMISS', reason, event })).toEqual({ open: false, reason });
    }
  });

  it('reports nothing when it is already closed', () => {
    expect(transitionPopover(closed, { type: 'CLOSE.CLICK', event })).toBeNull();
    expect(transitionPopover(closed, { type: 'CONTENT.DISMISS', reason: 'escape', event: null })).toBeNull();
  });
});

describe('meta', () => {
  it('limits the modal Tab row to the frameworks it names, with a neutral context', () => {
    const modal = popoverMeta.keyboard.filter((row) => row.frameworks !== undefined);
    expect(modal).toHaveLength(1);
    expect(modal[0]).toMatchObject({ context: 'inside the content of a modal popover', frameworks: ['react', 'vue'] });
  });

  it('links the dialog pattern of the content, and declares roles and elements', () => {
    expect(popoverMeta.apg).toBe('https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/');
    expect(popoverMeta.roles.content).toBe('dialog');
    expect(popoverMeta.defaultElements).toMatchObject({
      trigger: 'button',
      anchor: 'div',
      content: 'div',
      title: 'h2',
      description: 'p',
      close: 'button',
      arrow: 'span',
    });
    expect(popoverMeta.roles.anchor).toBeNull();
  });

  it('lists every keyboard row of the spec', () => {
    expect(popoverMeta.keyboard.map((row) => row.key)).toEqual([
      'Enter / Space',
      'Tab / Shift+Tab',
      'Escape',
      'Tab / Shift+Tab',
    ]);
    expect(popoverMeta.keyboard.at(-1)?.context).toContain('modal');
  });
});

describe('arrow', () => {
  it('is decorative, carries its class and is not hidden by default', () => {
    expect(getPopoverProps(open, vi.fn()).arrow).toEqual({
      class: 'cck-popover__arrow',
      'aria-hidden': 'true',
      hidden: undefined,
    });
    expect(popoverMeta.roles.arrow).toBeNull();
  });

  it('is natively hidden while it cannot point at the anchor', () => {
    expect(getPopoverProps({ ...open, arrowHidden: true }, vi.fn()).arrow.hidden).toBe(true);
    expect(getPopoverProps({ ...open, arrowHidden: false }, vi.fn()).arrow.hidden).toBeUndefined();
  });
});

describe('modal and kept content', () => {
  it('renders aria-modal only with modal', () => {
    expect(getPopoverProps(open, vi.fn()).content['aria-modal']).toBeUndefined();
    expect(getPopoverProps({ ...open, modal: false }, vi.fn()).content['aria-modal']).toBeUndefined();
    expect(getPopoverProps({ ...open, modal: true }, vi.fn()).content['aria-modal']).toBe('true');
  });

  it('hides closed content that stays mounted, and only that', () => {
    expect(getPopoverProps(closed, vi.fn()).content.hidden).toBeUndefined();
    expect(getPopoverProps({ ...closed, mounted: true, keptClosed: true }, vi.fn()).content).toMatchObject({
      hidden: true,
      'data-state': 'closed',
    });
    expect(getPopoverProps({ ...open, keptClosed: false }, vi.fn()).content.hidden).toBeUndefined();
  });
});

describe('meta defaults', () => {
  it('names the side and the align the content renders with no input', () => {
    const { content } = getPopoverProps(open, vi.fn());
    expect(content['data-side']).toBe(popoverMeta.dataAttrDetails?.['data-side']?.default);
    expect(content['data-align']).toBe(popoverMeta.dataAttrDetails?.['data-align']?.default);
  });
});
