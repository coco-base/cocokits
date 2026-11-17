// @vitest-environment jsdom
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StrictMode, type ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Dialog, type DialogContentProps, type DialogRootProps } from '../index';
import { boxAt, button, closed, content, isOpen, nextFrame, pressOn, stubTopLayer } from './fixtures';

beforeEach(stubTopLayer);
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
  document.documentElement.removeAttribute('style');
});

const ROOT_KEYS = [
  'role',
  'autoFocus',
  'restoreFocus',
  'width',
  'height',
  'minWidth',
  'minHeight',
  'maxWidth',
  'maxHeight',
];

function Configured({
  root,
  ...props
}: DialogContentProps & DialogRootProps & { readonly root?: DialogRootProps }): ReactElement {
  // The config members belong to the Root; the rest goes to the Content.
  const own = Object.fromEntries(Object.entries(props).filter(([key]) => ROOT_KEYS.includes(key)));
  const content = Object.fromEntries(Object.entries(props).filter(([key]) => !ROOT_KEYS.includes(key)));
  return (
    <StrictMode>
      <button>before</button>
      <Dialog.Root {...root} {...own}>
        <Dialog.Trigger>Open</Dialog.Trigger>
        <Dialog.Content aria-label="Settings" {...content}>
          <Dialog.Header>
            <Dialog.Title>Settings</Dialog.Title>
            <Dialog.Close aria-label="Close dialog">x</Dialog.Close>
          </Dialog.Header>
          <Dialog.Body>
            <h3>Heading</h3>
            <input aria-label="Name" />
            <input aria-label="Email" />
          </Dialog.Body>
          <Dialog.Footer>
            <button>Save</button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>
    </StrictMode>
  );
}

const open = async (): Promise<void> => {
  await userEvent.click(button('Open'));
};

describe('Dialog header, body and footer', () => {
  it.each([
    ['header', 'cck-dialog__header'],
    ['body', 'cck-dialog__body'],
    ['footer', 'cck-dialog__footer'],
  ])('renders the %s as a div with its class, no role and no data attribute', async (_name, className) => {
    render(<Configured />);
    await open();
    const part = content()?.querySelector(`.${className}`);
    expect(part?.tagName).toBe('DIV');
    expect(part?.hasAttribute('role')).toBe(false);
    expect(part?.getAttributeNames()).toEqual(['class']);
  });

  it('keeps the Title as the name of the dialog and holds the Close in the header', async () => {
    render(<Configured aria-label={undefined} />);
    await open();
    expect(screen.getByRole('dialog', { name: 'Settings' })).toBe(content());
    expect(content()?.querySelector('.cck-dialog__header .cck-dialog__close')).not.toBeNull();
  });

  it('passes native props and renders the author element', async () => {
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Content aria-label="Settings">
          <Dialog.Footer className="mine" data-test="x" render={<footer />}>
            Actions
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>,
    );
    await waitFor(() => {
      expect(isOpen()).toBe(true);
    });
    const footer = screen.getByText('Actions');
    expect(footer.tagName).toBe('FOOTER');
    expect(footer.className).toBe('cck-dialog__footer mine');
    expect(footer.getAttribute('data-test')).toBe('x');
  });
});

describe('Dialog role and size members', () => {
  it.each<[string, DialogRootProps, string | null]>([
    ['no role', {}, null],
    ['dialog', { role: 'dialog' }, null],
    ['alertdialog', { role: 'alertdialog' }, 'alertdialog'],
  ])('writes the role only for alertdialog: %s', async (_name, props, role) => {
    render(<Configured {...props} />);
    await open();
    expect(document.querySelector('dialog')?.getAttribute('role') ?? null).toBe(role);
  });

  it.each<[string, DialogRootProps, Record<string, string>]>([
    ['none', {}, {}],
    ['numbers are px', { width: 480, minHeight: 120 }, { width: '480px', minHeight: '120px' }],
    [
      'strings are CSS lengths',
      { width: '40rem', maxWidth: '90vw', height: '50vh', minWidth: 200, maxHeight: '80%' },
      { width: '40rem', maxWidth: '90vw', height: '50vh', minWidth: '200px', maxHeight: '80%' },
    ],
  ])('writes the size members as the inline style: %s', async (_name, props, expected) => {
    render(<Configured {...props} />);
    await open();
    const style = content()?.style;
    for (const member of ['width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight']) {
      expect(style?.[member as 'width']).toBe(expected[member] ?? '');
    }
  });
});

describe('Dialog disableClose and closePredicate', () => {
  it('keeps the dialog open on Escape and on a press on the backdrop, and Close still closes it', async () => {
    const onOpenChange = vi.fn();
    render(<Configured root={{ disableClose: true, onOpenChange }} />);
    await open();
    onOpenChange.mockClear();
    await userEvent.keyboard('{Escape}');
    const dialog = content();
    if (!dialog) throw new Error('no dialog');
    boxAt(dialog);
    pressOn(dialog, { clientX: 10, clientY: 10 });
    await act(nextFrame);
    expect(isOpen()).toBe(true);
    expect(onOpenChange).not.toHaveBeenCalled();
    await userEvent.click(button('Close dialog'));
    await closed();
    expect(onOpenChange).toHaveBeenCalledWith(false, expect.objectContaining({ reason: 'close' }));
  });

  it.each([
    ['Escape', async () => userEvent.keyboard('{Escape}'), 'escape'],
    ['the Close part', async () => userEvent.click(button('Close dialog')), 'close'],
  ])('asks closePredicate once for %s with the reason, and a false keeps it open', async (_name, close, reason) => {
    const closePredicate = vi.fn(() => false);
    render(<Configured root={{ closePredicate }} />);
    await open();
    await close();
    await act(nextFrame);
    expect(closePredicate).toHaveBeenCalledTimes(1);
    expect(closePredicate).toHaveBeenCalledWith(expect.objectContaining({ reason }));
    expect(isOpen()).toBe(true);
  });

  it('closes when closePredicate returns true, and never asks to open', async () => {
    const closePredicate = vi.fn(() => true);
    render(<Configured root={{ closePredicate }} />);
    await open();
    expect(closePredicate).not.toHaveBeenCalled();
    await userEvent.click(button('Close dialog'));
    await closed();
    expect(closePredicate).toHaveBeenCalledTimes(1);
  });
});

describe('Dialog closeOnNavigation', () => {
  it.each([
    ['popstate', () => new PopStateEvent('popstate')],
    ['hashchange', () => new HashChangeEvent('hashchange')],
  ])('closes on %s, also with disableClose and a closePredicate that refuses', async (_name, make) => {
    const closePredicate = vi.fn(() => false);
    render(<Configured root={{ disableClose: true, closePredicate }} />);
    await open();
    act(() => {
      window.dispatchEvent(make());
    });
    await closed();
    expect(closePredicate).not.toHaveBeenCalled();
  });

  it('stays open on navigation with closeOnNavigation false', async () => {
    render(<Configured root={{ closeOnNavigation: false }} />);
    await open();
    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    await act(nextFrame);
    expect(isOpen()).toBe(true);
  });
});

describe('Dialog autoFocus and restoreFocus', () => {
  it.each<[string, DialogRootProps['autoFocus'], string]>([
    ['the native focusing steps by default', undefined, 'Close dialog'],
    ['first-tabbable', 'first-tabbable', 'Close dialog'],
    ['true', true, 'Close dialog'],
    ['a selector', '[aria-label="Email"]', 'Email'],
    ['first-heading', 'first-heading', 'Settings'],
  ])('focuses the element for autoFocus %s', async (_name, autoFocus, expected) => {
    render(<Configured autoFocus={autoFocus} />);
    await open();
    const active = document.activeElement;
    expect(active?.getAttribute('aria-label') ?? active?.textContent).toBe(expected);
  });

  it.each<[string, DialogRootProps['autoFocus']]>([
    ['dialog', 'dialog'],
    ['false', false],
  ])('focuses the dialog itself for autoFocus %s', async (_name, autoFocus) => {
    render(<Configured autoFocus={autoFocus} />);
    await open();
    expect(document.activeElement).toBe(content());
  });

  it.each<[string, (other: HTMLElement) => DialogRootProps['restoreFocus'], string]>([
    ['true: the trigger', () => true, 'Open'],
    ['a selector', () => '#other', 'other'],
    ['an element', (other) => other, 'other'],
  ])('moves the focus after the close for restoreFocus %s', async (_name, restoreFocus, expected) => {
    const other = document.body.appendChild(document.createElement('button'));
    other.id = 'other';
    other.textContent = 'other';
    render(<Configured restoreFocus={restoreFocus(other)} />);
    await open();
    await userEvent.click(button('Close dialog'));
    await closed();
    await act(nextFrame);
    await waitFor(() => {
      expect(document.activeElement?.textContent).toBe(expected);
    });
  });

  it('leaves the focus alone for restoreFocus false', async () => {
    render(<Configured restoreFocus={false} />);
    await open();
    await userEvent.click(button('Close dialog'));
    await closed();
    await act(nextFrame);
    expect(document.activeElement).not.toBe(button('Open'));
  });
});
