// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Popover } from '../../popover';
import { Tooltip } from '../../tooltip';
import { Dialog } from '../index';
import { stubTopLayer } from './fixtures';

beforeEach(stubTopLayer);
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const trigger = (): HTMLElement => screen.getByTestId('trigger');
const ready = async (): Promise<void> => {
  await screen.findByTestId('trigger');
};

interface Case {
  readonly name: string;
  readonly ui: (props: object) => ReactElement;
  /** Whether the part's action has run. */
  readonly done: () => boolean;
  /** Whether `done` is already true before any activation. */
  readonly doneAtStart: boolean;
}

const cases: readonly Case[] = [
  {
    name: 'Dialog.Trigger',
    ui: (props) => (
      <Dialog.Root>
        <Dialog.Trigger data-testid="trigger" {...props}>
          Open
        </Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Title>t</Dialog.Title>
        </Dialog.Content>
      </Dialog.Root>
    ),
    done: () => document.querySelector('dialog[open]') !== null,
    doneAtStart: false,
  },
  {
    name: 'Popover.Trigger',
    ui: (props) => (
      <Popover.Root>
        <Popover.Trigger data-testid="trigger" {...props}>
          Open
        </Popover.Trigger>
        <Popover.Content aria-label="c">c</Popover.Content>
      </Popover.Root>
    ),
    done: () => trigger().getAttribute('aria-expanded') === 'true',
    doneAtStart: false,
  },
  {
    name: 'Dialog.Close',
    ui: (props) => (
      <Dialog.Root defaultOpen>
        <Dialog.Trigger>Open</Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Title>t</Dialog.Title>
          <Dialog.Close data-testid="trigger" {...props}>
            x
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Root>
    ),
    done: () => document.querySelector('dialog[open]') === null,
    doneAtStart: false,
  },
  {
    name: 'Popover.Close',
    ui: (props) => (
      <Popover.Root defaultOpen>
        <Popover.Trigger>t</Popover.Trigger>
        <Popover.Content aria-label="c">
          <Popover.Close data-testid="trigger" {...props}>
            x
          </Popover.Close>
        </Popover.Content>
      </Popover.Root>
    ),
    done: () => screen.queryByTestId('trigger') === null,
    doneAtStart: false,
  },
];

const veto = (event: { preventDefault: () => void }): void => {
  event.preventDefault();
};

describe.each(cases)('$name nativeButton', ({ name, ui, done }) => {
  it('renders type="button" by default and logs no error', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(ui({}));
    await ready();
    expect(trigger().tagName).toBe('BUTTON');
    expect(trigger().getAttribute('type')).toBe('button');
    expect(error).not.toHaveBeenCalled();
  });

  it('renders role, tabindex and no type on a link with nativeButton={false}', async () => {
    render(ui({ nativeButton: false, render: <a href="#x" /> }));
    await ready();
    expect(trigger().tagName).toBe('A');
    expect(trigger().hasAttribute('type')).toBe(false);
    expect(trigger().getAttribute('role')).toBe('button');
    expect(trigger().getAttribute('tabindex')).toBe('0');
  });

  it('activates on Enter keydown', async () => {
    render(ui({ nativeButton: false, render: <span /> }));
    await ready();
    fireEvent.keyDown(trigger(), { key: 'Enter' });
    expect(done()).toBe(true);
  });

  it('lets a consumer keydown preventDefault veto Enter', async () => {
    render(ui({ nativeButton: false, render: <span />, onKeyDown: veto }));
    await ready();
    fireEvent.keyDown(trigger(), { key: 'Enter' });
    expect(done()).toBe(false);
  });

  it('prevents the scroll on Space keydown and activates on keyup', async () => {
    render(ui({ nativeButton: false, render: <span /> }));
    await ready();
    expect(fireEvent.keyDown(trigger(), { key: ' ' })).toBe(false);
    expect(done()).toBe(false);
    fireEvent.keyUp(trigger(), { key: ' ' });
    expect(done()).toBe(true);
  });

  it('lets a consumer keyup preventDefault veto Space', async () => {
    render(ui({ nativeButton: false, render: <span />, onKeyUp: veto }));
    await ready();
    fireEvent.keyUp(trigger(), { key: ' ' });
    expect(done()).toBe(false);
  });

  it('ignores Enter and Space while an IME composes', async () => {
    render(ui({ nativeButton: false, render: <span /> }));
    await ready();
    expect(fireEvent.keyDown(trigger(), { key: 'Enter', isComposing: true })).toBe(true);
    expect(fireEvent.keyDown(trigger(), { key: ' ', isComposing: true })).toBe(true);
    fireEvent.keyUp(trigger(), { key: ' ', isComposing: true });
    expect(done()).toBe(false);
  });

  it('lets a consumer role and tabIndex win over the defaults', async () => {
    render(ui({ nativeButton: false, render: <span />, role: 'link', tabIndex: -1 }));
    await ready();
    expect(trigger().getAttribute('role')).toBe('link');
    expect(trigger().getAttribute('tabindex')).toBe('-1');
  });

  it('leaves Enter on an <a href> to the browser', async () => {
    const onClick = vi.fn();
    render(ui({ nativeButton: false, render: <a href="#x" />, onClick }));
    await ready();
    fireEvent.keyDown(trigger(), { key: 'Enter' });
    expect(onClick).not.toHaveBeenCalled();
    expect(done()).toBe(false);
  });

  it('logs a CocoKits error naming the part on a mismatch', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(ui({ render: <a href="#x" /> }));
    await ready();
    expect(error).toHaveBeenCalledWith(expect.stringContaining(`CocoKits: <${name}>`));
  });

  it('logs a CocoKits error for nativeButton={false} on a <button>', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(ui({ nativeButton: false }));
    await ready();
    expect(error).toHaveBeenCalledWith(expect.stringContaining(`CocoKits: <${name} nativeButton={false}>`));
  });
});

describe('Tooltip.Trigger nativeButton', () => {
  it('renders type="button" by default', () => {
    render(
      <Tooltip.Root>
        <Tooltip.Trigger data-testid="trigger">i</Tooltip.Trigger>
        <Tooltip.Content>tip</Tooltip.Content>
      </Tooltip.Root>,
    );
    expect(trigger().getAttribute('type')).toBe('button');
  });

  it('renders tabindex only on another element, and focus opens the tooltip', () => {
    render(
      <Tooltip.Root>
        <Tooltip.Trigger data-testid="trigger" nativeButton={false} render={<span />}>
          i
        </Tooltip.Trigger>
        <Tooltip.Content>tip</Tooltip.Content>
      </Tooltip.Root>,
    );
    expect(trigger().getAttribute('tabindex')).toBe('0');
    expect(trigger().hasAttribute('role')).toBe(false);
    expect(trigger().hasAttribute('type')).toBe(false);
    expect(trigger().getAttribute('data-state')).toBe('closed');
    fireEvent.focus(trigger());
    expect(trigger().getAttribute('data-state')).not.toBe('closed');
  });
});
