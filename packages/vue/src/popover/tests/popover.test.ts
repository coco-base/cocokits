// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup, screen } from '@testing-library/vue';
import { h, nextTick, ref } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { popoverMeta } from '@cocokits/machines/popover';
import { PopoverClose, PopoverContent, PopoverRoot, PopoverTrigger } from '../index';
import { dialog, mountView, popoverView, settle, stubOverlayBrowser, trigger } from './fixtures';

beforeEach(stubOverlayBrowser);
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

function classesOf(element: Element): string[] {
  return [...element.classList];
}

describe('Popover rendered contract', () => {
  it('renders no element for the root, and a closed trigger with the disclosure ARIA', () => {
    const { container } = mountView(popoverView({}));
    expect(container.children).toHaveLength(3);
    expect(classesOf(trigger())).toEqual(expect.arrayContaining(['cck-popover__trigger']));
    expect(trigger().getAttribute('type')).toBe('button');
    expect(trigger().getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    expect(trigger().hasAttribute('aria-controls')).toBe(false);
    expect(trigger().getAttribute('data-state')).toBe('closed');
    expect(dialog()).toBeNull();
  });

  it('renders the default elements of the meta', async () => {
    mountView(popoverView({}));
    await userEvent.click(trigger());
    await settle();
    expect(screen.getByRole('dialog', { name: 'Share' }).localName).toBe(popoverMeta.defaultElements?.content);
    expect(screen.getByRole('button', { name: 'Close' }).localName).toBe(popoverMeta.defaultElements?.close);
  });

  it('opens on a click: a labelled dialog in the overlay container, linked to the trigger', async () => {
    const { container } = mountView(popoverView({}));
    await userEvent.click(trigger());
    await settle();
    const content = screen.getByRole('dialog', { name: 'Share' });
    expect(classesOf(content)).toEqual(expect.arrayContaining(['cck-popover__content']));
    expect(content.getAttribute('data-state')).toBe('open');
    expect(content.getAttribute('data-side')).toBe('bottom');
    expect(content.getAttribute('data-align')).toBe('center');
    expect(content.hasAttribute('aria-modal')).toBe(false);
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    expect(trigger().getAttribute('aria-controls')).toBe(content.id);
    expect(trigger().getAttribute('data-state')).toBe('open');
    // Portaled into a top-layer host in the body, not next to the trigger.
    expect(container.contains(content)).toBe(false);
    expect(content.parentElement?.getAttribute('popover')).toBe('manual');
    expect(content.style.position).toBe('fixed');
  });

  it('renders the requested side and alignment as data attributes', async () => {
    mountView(popoverView({ rootProps: { open: true }, contentProps: { side: 'top', align: 'end' } }));
    await settle();
    const content = screen.getByRole('dialog');
    expect(content.getAttribute('data-side')).toBe('top');
    expect(content.getAttribute('data-align')).toBe('end');
  });

  it('throws a descriptive error for a part outside a root', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(() => mountView(() => h(PopoverTrigger))).toThrow('<PopoverTrigger> must be used inside <PopoverRoot>');
    expect(() => mountView(() => h(PopoverContent))).toThrow('<PopoverContent> must be used inside <PopoverRoot>');
    expect(() => mountView(() => h(PopoverClose))).toThrow('<PopoverClose> must be used inside <PopoverRoot>');
  });

  it('warns in development when the content has no accessible name', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    mountView(popoverView({ rootProps: { open: true }, contentProps: { 'aria-label': undefined } }));
    await settle();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('has no accessible name'));
  });

  it('merges the theme attributes and the consumer attributes, and the anatomy class wins no attribute', async () => {
    mountView(() => [
      h(PopoverRoot, null, () => [
        h(PopoverTrigger, { class: 'mine', 'data-x': '1' }, () => 'Share'),
        h(PopoverContent, { 'aria-label': 'Share', class: 'extra' }, () => 'text'),
      ]),
    ]);
    expect(classesOf(trigger())).toEqual(expect.arrayContaining(['cck-popover__trigger', 'mine']));
    expect(trigger().getAttribute('data-x')).toBe('1');
    await userEvent.click(trigger());
    await settle();
    expect(classesOf(screen.getByRole('dialog'))).toEqual(expect.arrayContaining(['cck-popover__content', 'extra']));
  });
});

describe('Popover open model', () => {
  it('keeps its own state without a binding and emits update:open', async () => {
    const onUpdate = vi.fn();
    mountView(popoverView({ rootProps: { 'onUpdate:open': onUpdate } }));
    await userEvent.click(trigger());
    await settle();
    expect(onUpdate).toHaveBeenCalledExactlyOnceWith(true);
    expect(dialog()).not.toBeNull();
  });

  it('emits update:open only: the root has no change event with a reason', () => {
    expect((PopoverRoot as { emits?: readonly string[] }).emits).toEqual(['update:open']);
  });

  it('starts open for an initial open prop, and shows the content only after mount', async () => {
    mountView(popoverView({ rootProps: { open: true } }));
    await settle();
    expect(dialog()).not.toBeNull();
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
  });

  it('follows a controlled prop and does not emit update:open when the parent sets it', async () => {
    const open = ref(false);
    const onChange = vi.fn();
    mountView(popoverView({ open, rootProps: { 'onUpdate:open': onChange } }));
    open.value = true;
    await settle();
    expect(dialog()).not.toBeNull();
    open.value = false;
    await settle();
    expect(dialog()).toBeNull();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('keeps the old state when the parent ignores the update, and still reports the request', async () => {
    const onChange = vi.fn();
    mountView(() => popoverView({ rootProps: { open: false, 'onUpdate:open': onChange } })());
    await userEvent.click(trigger());
    await nextTick();
    await settle();
    expect(dialog()).toBeNull();
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('emits update:open for Close, Escape and an outside press', async () => {
    const onUpdate = vi.fn();
    mountView(popoverView({ rootProps: { 'onUpdate:open': onUpdate } }));
    await userEvent.click(trigger());
    await settle();
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    await settle();
    await userEvent.click(trigger());
    await settle();
    await userEvent.keyboard('{Escape}');
    await settle();
    await userEvent.click(trigger());
    await settle();
    await userEvent.click(document.body);
    await settle();
    expect(onUpdate.mock.calls).toEqual([[true], [false], [true], [false], [true], [false]]);
  });
});

describe('Popover without a consumer veto', () => {
  it('toggles although a consumer click handler calls preventDefault', async () => {
    mountView(() => [
      h(PopoverRoot, null, () => [
        h(
          PopoverTrigger,
          {
            onClick: (event: Event) => {
              event.preventDefault();
            },
          },
          () => 'Share',
        ),
        h(PopoverContent, { 'aria-label': 'Share' }, () => 'text'),
      ]),
    ]);
    await userEvent.click(trigger());
    await settle();
    expect(dialog()).not.toBeNull();
  });

  it('closes although a consumer click handler of the Close calls preventDefault', async () => {
    mountView(
      popoverView({
        rootProps: { open: true },
        inner: () =>
          h(
            PopoverClose,
            {
              onClick: (e: Event) => {
                e.preventDefault();
              },
            },
            () => 'Close',
          ),
      }),
    );
    await settle();
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    await settle();
    expect(dialog()).toBeNull();
  });
});

describe('Popover asChild', () => {
  it('merges the trigger and the Close onto their child and keeps the child element', async () => {
    mountView(() => [
      h(PopoverRoot, null, () => [
        h(PopoverTrigger, { asChild: true }, () => h('button', { type: 'submit', class: 'own' }, 'Share')),
        h(PopoverContent, { 'aria-label': 'Share' }, () =>
          h(PopoverClose, { asChild: true }, () => h('button', { class: 'close-own' }, 'Done')),
        ),
      ]),
    ]);
    expect(classesOf(trigger())).toEqual(expect.arrayContaining(['cck-popover__trigger', 'own']));
    expect(trigger().getAttribute('type')).toBe('submit');
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    await userEvent.click(trigger());
    await settle();
    const done = screen.getByRole('button', { name: 'Done' });
    expect(classesOf(done)).toEqual(expect.arrayContaining(['cck-popover__close', 'close-own']));
    await userEvent.click(done);
    await settle();
    expect(dialog()).toBeNull();
  });
});

describe('Popover cleanup', () => {
  it('removes the host and the document listeners on unmount', async () => {
    const remove = vi.spyOn(document, 'removeEventListener');
    const rendered = mountView(popoverView({ rootProps: { open: true } }));
    await settle();
    expect(document.querySelector('[popover]')).not.toBeNull();
    rendered.unmount();
    await settle();
    expect(document.querySelector('[popover]')).toBeNull();
    const removed = remove.mock.calls.map(([type]) => type);
    expect(removed).toContain('keydown');
    expect(removed).toContain('pointerdown');
    expect(removed).toContain('focusin');
  });
});
