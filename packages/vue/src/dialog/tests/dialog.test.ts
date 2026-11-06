// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup, screen } from '@testing-library/vue';
import { h, nextTick, ref } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DialogClose, DialogContent, DialogRoot, DialogTitle, DialogTrigger } from '../index';
import { boxAt, button, dialog, dialogView, mountView, pressOn, settle, stubOverlayBrowser, trigger } from './fixtures';

beforeEach(stubOverlayBrowser);
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  Reflect.deleteProperty(HTMLElement.prototype, 'getAnimations');
  document.body.innerHTML = '';
  document.documentElement.removeAttribute('style');
});

type User = ReturnType<typeof userEvent.setup>;

const classesOf = (element: Element): string[] => [...element.classList];

describe('Dialog rendered contract', () => {
  it('renders no element for the root, and a closed trigger with the disclosure ARIA', () => {
    const { container } = mountView(dialogView({}));
    expect(container.children).toHaveLength(3);
    expect(classesOf(trigger())).toEqual(expect.arrayContaining(['cck-dialog__trigger']));
    expect(trigger().getAttribute('type')).toBe('button');
    expect(trigger().getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    expect(trigger().hasAttribute('aria-controls')).toBe(false);
    expect(trigger().getAttribute('data-state')).toBe('closed');
    expect(dialog()).toBeNull();
    expect(document.querySelector('[popover]')).toBeNull();
  });

  it('opens a native modal dialog outside the container, labelled and described, linked to the trigger', async () => {
    const { container } = mountView(dialogView({}));
    await userEvent.click(trigger());
    await settle();
    const content = screen.getByRole<HTMLDialogElement>('dialog', {
      name: 'Delete project',
      description: 'This cannot be undone.',
    });
    expect(content.localName).toBe('dialog');
    expect(content.open).toBe(true);
    expect(content.matches(':modal')).toBe(true);
    expect(classesOf(content)).toEqual(expect.arrayContaining(['cck-dialog__content']));
    expect(content.getAttribute('data-state')).toBe('open');
    expect(content.hasAttribute('role')).toBe(false);
    expect(content.hasAttribute('aria-modal')).toBe(false);
    expect(container.contains(content)).toBe(false);
    expect(content.parentElement?.getAttribute('popover')).toBe('manual');
    const title = screen.getByRole('heading', { name: 'Delete project' });
    expect(title.tagName).toBe('H2');
    expect(classesOf(title)).toEqual(expect.arrayContaining(['cck-dialog__title']));
    expect(content.getAttribute('aria-labelledby')).toBe(title.id);
    const description = screen.getByText('This cannot be undone.');
    expect(description.tagName).toBe('P');
    expect(classesOf(description)).toEqual(expect.arrayContaining(['cck-dialog__description']));
    expect(content.getAttribute('aria-describedby')).toBe(description.id);
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    expect(trigger().getAttribute('aria-controls')).toBe(content.id);
    expect(trigger().getAttribute('data-state')).toBe('open');
    expect(classesOf(button('Cancel'))).toEqual(expect.arrayContaining(['cck-dialog__close']));
    expect(button('Cancel').getAttribute('type')).toBe('button');
  });

  it('has no aria-labelledby or aria-describedby without a Title and a Description', async () => {
    mountView(
      dialogView({ rootProps: { open: true }, contentProps: { 'aria-label': 'Plain' }, inner: () => h('p', 'x') }),
    );
    await settle();
    expect(dialog()?.hasAttribute('aria-labelledby')).toBe(false);
    expect(dialog()?.hasAttribute('aria-describedby')).toBe(false);
  });

  it('adds no focus guard and no manual inert: the native modal needs no guards', async () => {
    mountView(dialogView({}));
    await userEvent.click(trigger());
    await settle();
    expect(dialog()?.parentElement?.querySelectorAll('[tabindex]').length).toBe(0);
    expect(document.querySelector('[inert]')).toBeNull();
  });

  it('merges the consumer attributes and keeps the fixed class and ids', async () => {
    mountView(() => [
      h(DialogRoot, null, () => [
        h(DialogTrigger, { class: 'mine', 'data-x': '1', id: 'mine' }, () => 'Delete'),
        h(DialogContent, { class: 'extra', id: 'mine', 'aria-label': 'x' }, () => 'text'),
      ]),
    ]);
    expect(classesOf(trigger())).toEqual(expect.arrayContaining(['cck-dialog__trigger', 'mine']));
    expect(trigger().getAttribute('data-x')).toBe('1');
    await userEvent.click(trigger());
    await settle();
    expect(classesOf(screen.getByRole('dialog'))).toEqual(expect.arrayContaining(['cck-dialog__content', 'extra']));
    expect(screen.getByRole('dialog').id).not.toBe('mine');
  });

  it('renders the title as another heading with asChild and keeps its id', async () => {
    mountView(() => [
      h(DialogRoot, { open: true }, () => [
        h(DialogTrigger, null, () => 'Delete'),
        h(DialogContent, null, () => [h(DialogTitle, { asChild: true }, () => h('h3', 'Heading'))]),
      ]),
    ]);
    await settle();
    const heading = screen.getByRole('heading', { name: 'Heading' });
    expect(heading.tagName).toBe('H3');
    expect(classesOf(heading)).toEqual(expect.arrayContaining(['cck-dialog__title']));
    expect(dialog()?.getAttribute('aria-labelledby')).toBe(heading.id);
  });

  it('throws a descriptive error for a part outside a root', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(() => mountView(() => h(DialogTrigger))).toThrow('<DialogTrigger> must be used inside <DialogRoot>');
    expect(() => mountView(() => h(DialogContent))).toThrow('<DialogContent> must be used inside <DialogRoot>');
    expect(() => mountView(() => h(DialogClose))).toThrow('<DialogClose> must be used inside <DialogRoot>');
  });

  it('warns in development when the content has no accessible name, and not when a Title names it', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    mountView(dialogView({ rootProps: { open: true }, inner: () => h('p', 'x') }));
    await settle();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('needs an accessible name'));
    cleanup();
    warn.mockClear();
    mountView(dialogView({ rootProps: { open: true } }));
    await settle();
    expect(warn).not.toHaveBeenCalled();
  });
});

describe('Dialog open model', () => {
  it('keeps its own state without a binding and emits update:open', async () => {
    const onUpdate = vi.fn();
    mountView(dialogView({ rootProps: { 'onUpdate:open': onUpdate } }));
    await userEvent.click(trigger());
    await settle();
    expect(onUpdate).toHaveBeenCalledExactlyOnceWith(true);
    expect(dialog()).not.toBeNull();
  });

  it('emits update:open only: the root has no change event with a reason', () => {
    expect((DialogRoot as { emits?: readonly string[] }).emits).toEqual(['update:open']);
  });

  it('opens and closes from the keyboard with Enter, Escape and Space', async () => {
    const onUpdate = vi.fn();
    const user = userEvent.setup();
    mountView(dialogView({ rootProps: { 'onUpdate:open': onUpdate } }));
    trigger().focus();
    await user.keyboard('{Enter}');
    await settle();
    expect(dialog()).not.toBeNull();
    await user.keyboard('{Escape}');
    await settle();
    expect(dialog()).toBeNull();
    expect(document.activeElement).toBe(trigger());
    await user.keyboard(' ');
    await settle();
    expect(dialog()).not.toBeNull();
    expect(onUpdate.mock.calls).toEqual([[true], [false], [true]]);
  });

  it('starts open for an initial open prop, and shows the content only after mount', async () => {
    mountView(dialogView({ rootProps: { open: true } }));
    await settle();
    expect(dialog()).not.toBeNull();
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
  });

  it('follows a controlled prop and does not emit update:open when the parent sets it', async () => {
    const open = ref(false);
    const onChange = vi.fn();
    mountView(dialogView({ open, rootProps: { 'onUpdate:open': onChange } }));
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
    mountView(() => dialogView({ rootProps: { open: false, 'onUpdate:open': onChange } })());
    await userEvent.click(trigger());
    await nextTick();
    await settle();
    expect(dialog()).toBeNull();
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('opens although a consumer click handler of the trigger calls preventDefault (no veto)', async () => {
    mountView(() => [
      h(DialogRoot, null, () => [
        h(
          DialogTrigger,
          {
            onClick: (event: Event) => {
              event.preventDefault();
            },
          },
          () => 'Delete',
        ),
        h(DialogContent, { 'aria-label': 'x' }, () => 'text'),
      ]),
    ]);
    await userEvent.click(trigger());
    await settle();
    expect(dialog()).not.toBeNull();
  });

  it('closes although a consumer click handler of the Close calls preventDefault (no veto)', async () => {
    mountView(
      dialogView({
        rootProps: { open: true },
        contentProps: { 'aria-label': 'x' },
        inner: () =>
          h(
            DialogClose,
            {
              onClick: (e: Event) => {
                e.preventDefault();
              },
            },
            () => 'Cancel',
          ),
      }),
    );
    await settle();
    await userEvent.click(button('Cancel'));
    await settle();
    expect(dialog()).toBeNull();
  });

  it('keeps the content until the exit animation has finished', async () => {
    mountView(dialogView({}));
    await userEvent.click(trigger());
    await settle();
    const element = dialog();
    let finish: () => void = () => undefined;
    const finished = new Promise<void>((resolve) => {
      finish = resolve;
    });
    Object.defineProperty(element, 'getAnimations', {
      value: () => [
        {
          finished,
          animationName: 'exit',
          playState: 'running',
          effect: { getComputedTiming: () => ({ endTime: 300 }) },
        },
      ],
      configurable: true,
    });
    await userEvent.keyboard('{Escape}');
    await settle();
    expect(dialog()?.getAttribute('data-state')).toBe('closed');
    expect(trigger().getAttribute('aria-controls')).toBe(element?.id);
    finish();
    await settle();
    expect(dialog()).toBeNull();
    expect(trigger().hasAttribute('aria-controls')).toBe(false);
  });
});

describe('Dialog dismissal', () => {
  it.each([
    ['Escape', async (user: User) => user.keyboard('{Escape}')],
    ['Close', async (user: User) => user.click(button('Cancel'))],
    [
      'a press on the backdrop',
      () => {
        const element = dialog();
        if (!element) throw new Error('no dialog');
        boxAt(element);
        pressOn(element, { clientX: 10, clientY: 10 });
      },
    ],
    [
      'the platform closing the dialog (form method=dialog)',
      () => {
        dialog()?.close();
      },
    ],
  ] as const)('closes on %s and emits update:open', async (_name, perform) => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    mountView(dialogView({ rootProps: { 'onUpdate:open': onUpdate } }));
    await user.click(trigger());
    await settle();
    await perform(user);
    await settle();
    expect(dialog()).toBeNull();
    expect(onUpdate.mock.calls).toEqual([[true], [false]]);
  });

  it('does not close on a press inside the dialog box, including its own padding', async () => {
    mountView(dialogView({}));
    await userEvent.click(trigger());
    await settle();
    const element = dialog();
    if (!element) throw new Error('no dialog');
    boxAt(element);
    pressOn(element, { clientX: 150, clientY: 150 });
    await userEvent.click(screen.getByText('This cannot be undone.'));
    await settle();
    expect(dialog()).not.toBeNull();
  });

  it('lets a controlled parent refuse a dismissal and keeps the dialog modal', async () => {
    const onChange = vi.fn();
    mountView(dialogView({ rootProps: { open: true, 'onUpdate:open': onChange } }));
    await settle();
    await userEvent.keyboard('{Escape}');
    await settle();
    expect(onChange).toHaveBeenCalledWith(false);
    expect(dialog()).not.toBeNull();
    expect(dialog()?.matches(':modal')).toBe(true);
  });

  it('shows the dialog again when the platform closes it and the parent refuses', async () => {
    mountView(dialogView({ rootProps: { open: true, 'onUpdate:open': () => undefined } }));
    await settle();
    dialog()?.close();
    await settle();
    expect(dialog()?.open).toBe(true);
  });
});

describe('Dialog focus', () => {
  it('lets the native focusing steps place focus: the first focusable element', async () => {
    mountView(dialogView({}));
    await userEvent.click(trigger());
    await settle();
    expect(document.activeElement).toBe(screen.getByRole('link', { name: 'First' }));
  });

  it.each([
    ['Escape', async (user: User) => user.keyboard('{Escape}')],
    ['Close', async (user: User) => user.click(button('Cancel'))],
    [
      'a press on the backdrop',
      () => {
        const element = dialog();
        if (!element) throw new Error('no dialog');
        boxAt(element);
        pressOn(element, { clientX: 10, clientY: 10 });
      },
    ],
  ] as const)('returns to the trigger on %s', async (_name, perform) => {
    const user = userEvent.setup();
    mountView(dialogView({}));
    await user.click(trigger());
    await settle();
    await perform(user);
    await settle();
    expect(dialog()).toBeNull();
    expect(document.activeElement).toBe(trigger());
  });

  it('does not take focus back when the whole tree is removed while open', async () => {
    const view = mountView(dialogView({}));
    await userEvent.click(trigger());
    await settle();
    const other = document.createElement('button');
    document.body.append(other);
    view.unmount();
    other.focus();
    await settle();
    expect(document.activeElement).toBe(other);
  });
});

describe('Dialog scroll lock', () => {
  it('locks the page scroll while open and restores it on close and on unmount', async () => {
    const view = mountView(dialogView({}));
    expect(document.documentElement.style.overflow).toBe('');
    await userEvent.click(trigger());
    await settle();
    expect(document.documentElement.style.overflow).toBe('hidden');
    await userEvent.keyboard('{Escape}');
    await settle();
    expect(document.documentElement.style.overflow).toBe('');
    await userEvent.click(trigger());
    await settle();
    expect(document.documentElement.style.overflow).toBe('hidden');
    view.unmount();
    await settle();
    expect(document.documentElement.style.overflow).toBe('');
    expect(document.querySelector('[popover="manual"]')).toBeNull();
  });
});
