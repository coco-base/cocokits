// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup, screen } from '@testing-library/vue';
import { defineComponent, h, ref, type Component } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PopoverContent, PopoverRoot, PopoverTrigger } from '../../popover';
import { DialogClose, DialogContent, DialogRoot, DialogTitle, DialogTrigger } from '../index';
import { button, mountView, pressOn, settle, stubOverlayBrowser } from './fixtures';

beforeEach(stubOverlayBrowser);
afterEach(() => {
  cleanup();
  Reflect.deleteProperty(HTMLElement.prototype, 'getAnimations');
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
  document.documentElement.removeAttribute('style');
});

/** A promise that stands in for the exit animation of an element. */
function animate(element: HTMLElement): () => Promise<void> {
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
  return async () => {
    finish();
    await finished;
    await settle();
  };
}

describe('A modal that exits', () => {
  it('keeps the page locked until its exit animation has finished', async () => {
    mountView(() =>
      h(DialogRoot, null, () => [
        h(DialogTrigger, null, () => 'Delete'),
        h(DialogContent, null, () => [
          h(DialogTitle, null, () => 'Delete project'),
          h(DialogClose, null, () => 'Cancel'),
        ]),
      ]),
    );
    await userEvent.click(button('Delete'));
    await settle();
    const dialog = screen.getByRole('dialog', { name: 'Delete project' });
    const finish = animate(dialog);
    expect(document.documentElement.style.overflow).toBe('hidden');
    await userEvent.keyboard('{Escape}');
    await settle();
    expect(dialog.getAttribute('data-state')).toBe('closed');
    expect(document.documentElement.style.overflow).toBe('hidden');
    await finish();
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.documentElement.style.overflow).toBe('');
  });

  it('stays a barrier: Escape and a press during the exit reach no layer below', async () => {
    const outerUpdates: boolean[] = [];
    mountView(() =>
      h(DialogRoot, { 'onUpdate:open': (open: boolean) => outerUpdates.push(open) }, () => [
        h(DialogTrigger, null, () => 'Outer'),
        h(DialogContent, { 'aria-label': 'outer' }, () =>
          h(DialogRoot, null, () => [
            h(DialogTrigger, null, () => 'Inner'),
            h(DialogContent, null, () => [
              h(DialogTitle, null, () => 'Inner dialog'),
              h(DialogClose, null, () => 'Cancel'),
            ]),
          ]),
        ),
      ]),
    );
    await userEvent.click(button('Outer'));
    await settle();
    await userEvent.click(button('Inner'));
    await settle();
    const inner = screen.getByRole('dialog', { name: 'Inner dialog' });
    const finish = animate(inner);
    await userEvent.keyboard('{Escape}');
    await settle();
    expect(inner.getAttribute('data-state')).toBe('closed');

    await userEvent.keyboard('{Escape}');
    pressOn(document.body, { clientX: 5, clientY: 5 });
    await settle();
    expect(screen.getByRole('dialog', { name: 'outer' })).toBeTruthy();
    expect(outerUpdates).toEqual([true]);

    await finish();
    expect(screen.queryByRole('dialog', { name: 'Inner dialog' })).toBeNull();
    await userEvent.keyboard('{Escape}');
    await settle();
    expect(screen.queryByRole('dialog', { name: 'outer' })).toBeNull();
  });
});

describe('Dialog focus return to the opener', () => {
  function controlled(removable: boolean): Component {
    return defineComponent({
      setup() {
        const open = ref(false);
        const present = ref(true);
        return () => [
          present.value
            ? h(
                'button',
                {
                  onClick: () => {
                    open.value = true;
                  },
                },
                'Open it',
              )
            : null,
          h(
            DialogRoot,
            {
              open: open.value,
              'onUpdate:open': (value: boolean) => {
                open.value = value;
              },
            },
            () => [
              h(DialogTrigger, null, () => 'Delete'),
              h(DialogContent, null, () => [
                h(DialogTitle, null, () => 'Delete project'),
                removable
                  ? h(
                      'button',
                      {
                        onClick: () => {
                          present.value = false;
                        },
                      },
                      'Remove opener',
                    )
                  : null,
                h(DialogClose, null, () => 'Cancel'),
              ]),
            ],
          ),
        ];
      },
    });
  }

  it('returns focus to the element that had it when the dialog opened, not to the Trigger', async () => {
    mountView(() => h(controlled(false)));
    await userEvent.click(button('Open it'));
    await settle();
    expect(screen.queryByRole('dialog')).not.toBeNull();
    await userEvent.keyboard('{Escape}');
    await settle();
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(button('Open it'));
  });

  it('falls back to the body of the document when the opener is gone', async () => {
    mountView(() => h(controlled(true)));
    await userEvent.click(button('Open it'));
    await settle();
    await userEvent.click(button('Remove opener'));
    await settle();
    expect(screen.queryByRole('button', { name: 'Open it' })).toBeNull();
    await userEvent.click(button('Cancel'));
    await settle();
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(document.body);
  });
});

describe('A close the browser forced after a cancel with no key', () => {
  it('closes with reason escape once and does not show the dialog again', async () => {
    const updates: boolean[] = [];
    mountView(() =>
      h(DialogRoot, { 'onUpdate:open': (open: boolean) => updates.push(open) }, () => [
        h(DialogTrigger, null, () => 'Delete'),
        h(DialogContent, { 'aria-label': 'Locked' }, () => h(DialogClose, null, () => 'Cancel')),
      ]),
    );
    await userEvent.click(button('Delete'));
    await settle();
    const dialog = screen.getByRole<HTMLDialogElement>('dialog', { name: 'Locked' });
    dialog.dispatchEvent(new Event('cancel', { cancelable: false }));
    dialog.close();
    await settle();
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(updates).toEqual([true, false]);
  });
});

describe('Tab out of a popover inside a modal dialog', () => {
  it('goes to the next tabbable inside the dialog, never to the inert page', async () => {
    mountView(() => [
      h('button', 'Outside'),
      h(DialogRoot, null, () => [
        h(DialogTrigger, null, () => 'Delete'),
        h(DialogContent, { 'aria-label': 'd' }, () => [
          h(PopoverRoot, null, () => [
            h(PopoverTrigger, null, () => 'More'),
            h(PopoverContent, { 'aria-label': 'more' }, () => h('button', 'Inside')),
          ]),
          h('button', 'After popover'),
        ]),
      ]),
    ]);
    await userEvent.click(button('Delete'));
    await settle();
    await userEvent.click(button('More'));
    await settle();
    expect(document.activeElement).toBe(button('Inside'));
    await userEvent.tab();
    expect(document.activeElement).toBe(button('After popover'));
  });
});

describe('Shift+Tab out of a popover inside a modal dialog', () => {
  it('goes back to the trigger inside the dialog', async () => {
    mountView(() => [
      h('button', 'Outside'),
      h(DialogRoot, null, () => [
        h(DialogTrigger, null, () => 'Delete'),
        h(DialogContent, { 'aria-label': 'd' }, () => [
          h(PopoverRoot, null, () => [
            h(PopoverTrigger, null, () => 'More'),
            h(PopoverContent, { 'aria-label': 'more' }, () => h('button', 'Inside')),
          ]),
          h('button', 'After popover'),
        ]),
      ]),
    ]);
    await userEvent.click(button('Delete'));
    await settle();
    await userEvent.click(button('More'));
    await settle();
    expect(document.activeElement).toBe(button('Inside'));
    await userEvent.tab({ shift: true });
    expect(document.activeElement).toBe(button('More'));
  });
});

describe('Dialog that is open from the start, Content before Trigger', () => {
  it('returns focus to the element that had it before the page mounted, not to the Trigger', async () => {
    const opener = document.createElement('button');
    opener.textContent = 'Page opener';
    document.body.append(opener);
    opener.focus();
    const open = ref(true);
    mountView(() =>
      h(
        DialogRoot,
        {
          open: open.value,
          'onUpdate:open': (value: boolean) => {
            open.value = value;
          },
        },
        () => [
          h(DialogContent, { 'aria-label': 'Early' }, () => h(DialogClose, null, () => 'Cancel')),
          h(DialogTrigger, null, () => 'Delete'),
        ],
      ),
    );
    await settle();
    expect(screen.queryByRole('dialog', { name: 'Early' })).not.toBeNull();
    await userEvent.keyboard('{Escape}');
    await settle();
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(opener);
  });
});

describe('Reopen during the exit', () => {
  it('still returns focus to the original opener after the final close', async () => {
    const open = ref(false);
    const Page = defineComponent({
      setup() {
        return () => [
          h('button', { onClick: () => (open.value = true) }, 'Open it'),
          h(DialogRoot, { open: open.value, 'onUpdate:open': (value: boolean) => (open.value = value) }, () => [
            h(DialogTrigger, null, () => 'Delete'),
            h(DialogContent, { 'aria-label': 'd' }, () => h(DialogClose, null, () => 'Cancel')),
          ]),
        ];
      },
    });
    mountView(() => h(Page));
    await userEvent.click(button('Open it'));
    await settle();
    const dialog = screen.getByRole('dialog');
    const finish = animate(dialog);
    await userEvent.keyboard('{Escape}');
    await settle();
    // Reopen from the page while focus is still inside the exiting dialog.
    open.value = true;
    await settle();
    await userEvent.keyboard('{Escape}');
    await settle();
    await finish();
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(button('Open it'));
  });
});
