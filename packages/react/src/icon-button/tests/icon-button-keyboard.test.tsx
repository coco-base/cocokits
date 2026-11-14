// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { IconButton } from '../index';

afterEach(cleanup);

describe('IconButton keyboard (the Keyboard table of the spec)', () => {
  it.each(['{Enter}', ' '])('activates a button with %j', async (key) => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<IconButton aria-label="Add" onClick={onClick} />);
    await user.tab();
    await user.keyboard(key);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('activates a link with Enter', async () => {
    const onClick = vi.fn((event: { preventDefault: () => void }) => {
      event.preventDefault();
    });
    const user = userEvent.setup();
    render(<IconButton aria-label="Go" nativeButton={false} render={<a href="#go" />} onClick={onClick} />);
    await user.tab();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('does nothing on a link with Space', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<IconButton aria-label="Go" nativeButton={false} render={<a href="#go" />} onClick={onClick} />);
    await user.tab();
    await user.keyboard(' ');
    expect(onClick).not.toHaveBeenCalled();
  });

  it('blocks Enter on a disabled link', async () => {
    const onClick = vi.fn();
    render(<IconButton aria-label="Go" nativeButton={false} disabled render={<a href="#go" />} onClick={onClick} />);
    const anchor = screen.getByRole('link', { name: 'Go' });
    anchor.focus();
    await userEvent.setup().keyboard('{Enter}');
    expect(onClick).not.toHaveBeenCalled();
  });

  it('skips a disabled button and a disabled link with Tab and Shift+Tab', async () => {
    const user = userEvent.setup();
    render(
      <>
        <IconButton aria-label="First" />
        <IconButton aria-label="Off button" disabled />
        <IconButton aria-label="Off link" nativeButton={false} disabled render={<a href="#off" />} />
        <IconButton aria-label="Last" />
      </>,
    );
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'First' }));
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Last' }));
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'First' }));
  });
});
