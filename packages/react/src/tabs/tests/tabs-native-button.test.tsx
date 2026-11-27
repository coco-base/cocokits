// @vitest-environment jsdom
import { cleanup, fireEvent, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { KeyboardEvent } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DirectionProvider } from '@cocokits/react-core';
import { Tabs } from '../index';
import { tab } from './fixtures';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function Example({
  nativeButton,
  disabled,
  onKeyDown,
}: {
  readonly nativeButton?: boolean;
  readonly disabled?: boolean;
  readonly onKeyDown?: (event: KeyboardEvent) => void;
}) {
  return (
    <Tabs.Root defaultValue="a" activationMode="manual">
      <Tabs.List aria-label="x">
        <Tabs.Trigger value="a">A</Tabs.Trigger>
        <Tabs.Trigger
          value="b"
          disabled={disabled}
          nativeButton={nativeButton}
          onKeyDown={onKeyDown}
          render={nativeButton === false ? <span /> : undefined}
        >
          B
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="a">panel a</Tabs.Content>
      <Tabs.Content value="b">panel b</Tabs.Content>
    </Tabs.Root>
  );
}

describe('Tabs.Trigger nativeButton', () => {
  it('renders type="button" on a native trigger', () => {
    render(<Example />);
    expect(tab('B').getAttribute('type')).toBe('button');
  });

  it('keeps role="tab" and the roving tabindex, with no type, on another element', () => {
    render(<Example nativeButton={false} />);
    expect(tab('B').tagName).toBe('SPAN');
    expect(tab('B').hasAttribute('type')).toBe(false);
    expect(tab('B').getAttribute('tabindex')).toBe('-1');
    expect(tab('A').getAttribute('tabindex')).toBe('0');
  });

  it('selects on Enter and Space keydown', () => {
    const { unmount } = render(<Example nativeButton={false} />);
    fireEvent.keyDown(tab('B'), { key: 'Enter' });
    expect(tab('B').getAttribute('aria-selected')).toBe('true');
    unmount();
    render(<Example nativeButton={false} />);
    fireEvent.keyDown(tab('B'), { key: ' ' });
    expect(tab('B').getAttribute('aria-selected')).toBe('true');
  });

  it('lets a consumer keydown preventDefault veto the selection', () => {
    render(
      <Example
        nativeButton={false}
        onKeyDown={(event) => {
          event.preventDefault();
        }}
      />,
    );
    fireEvent.keyDown(tab('B'), { key: 'Enter' });
    expect(tab('B').getAttribute('aria-selected')).toBe('false');
  });

  it('prevents the scroll of Space, on a disabled tab too, and selects only an enabled one', () => {
    const { unmount } = render(<Example nativeButton={false} />);
    expect(fireEvent.keyDown(tab('B'), { key: ' ' })).toBe(false);
    expect(tab('B').getAttribute('aria-selected')).toBe('true');
    unmount();
    render(<Example nativeButton={false} disabled />);
    expect(fireEvent.keyDown(tab('B'), { key: ' ' })).toBe(false);
    expect(tab('B').getAttribute('aria-selected')).toBe('false');
  });

  it('lets a consumer keydown preventDefault veto Space as well', () => {
    render(
      <Example
        nativeButton={false}
        onKeyDown={(event) => {
          event.preventDefault();
        }}
      />,
    );
    fireEvent.keyDown(tab('B'), { key: ' ' });
    expect(tab('B').getAttribute('aria-selected')).toBe('false');
  });

  it('uses aria-disabled instead of disabled and ignores activation', async () => {
    const user = userEvent.setup();
    render(<Example nativeButton={false} disabled />);
    expect(tab('B').getAttribute('aria-disabled')).toBe('true');
    expect(tab('B').hasAttribute('disabled')).toBe(false);
    await user.click(tab('B'));
    fireEvent.keyDown(tab('B'), { key: 'Enter' });
    expect(tab('B').getAttribute('aria-selected')).toBe('false');
  });

  it('logs a CocoKits error naming the part when the tag does not match', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(<Example nativeButton={false} />);
    expect(error).not.toHaveBeenCalled();
    cleanup();
    render(
      <Tabs.Root defaultValue="a">
        <Tabs.List aria-label="x">
          <Tabs.Trigger value="a" render={<span />}>
            A
          </Tabs.Trigger>
        </Tabs.List>
      </Tabs.Root>,
    );
    expect(error).toHaveBeenCalledWith(expect.stringContaining('CocoKits: <Tabs.Trigger>'));
  });
});

describe('Tabs.Root dir', () => {
  const Row = ({ dir }: { readonly dir?: 'ltr' | 'rtl' }) => (
    <Tabs.Root defaultValue="a" dir={dir}>
      <Tabs.List aria-label="x">
        <Tabs.Trigger value="a">A</Tabs.Trigger>
        <Tabs.Trigger value="b">B</Tabs.Trigger>
      </Tabs.List>
    </Tabs.Root>
  );

  it('flips the arrows inside an ltr provider and renders the own value', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <DirectionProvider dir="ltr">
        <Row dir="rtl" />
      </DirectionProvider>,
    );
    expect(container.querySelector('.cck-tabs')?.getAttribute('dir')).toBe('rtl');
    tab('A').focus();
    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(tab('B'));
  });

  it('renders no dir attribute when omitted, even inside a provider', () => {
    const { container } = render(
      <DirectionProvider dir="rtl">
        <Row />
      </DirectionProvider>,
    );
    expect(container.querySelector('.cck-tabs')?.hasAttribute('dir')).toBe(false);
  });
});
