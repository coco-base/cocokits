// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import type { ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Tooltip } from '../index';
import { elapse, isOpen, setup, stubTopLayer, tooltipContent } from './fixtures';

beforeEach(() => {
  stubTopLayer();
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'requestAnimationFrame', 'cancelAnimationFrame', 'Date'] });
  Reflect.set(globalThis, 'jest', { advanceTimersByTime: (ms: number) => vi.advanceTimersByTime(ms) });
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  Reflect.deleteProperty(globalThis, 'jest');
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const first = (): HTMLElement => screen.getByRole('button', { name: 'One' });
const second = (): HTMLElement => screen.getByRole('button', { name: 'Two' });

function Two({ rootDelay }: { readonly rootDelay?: number }): ReactElement {
  return (
    <>
      <Tooltip.Root delayDuration={rootDelay}>
        <Tooltip.Trigger>One</Tooltip.Trigger>
        <Tooltip.Content>First tip</Tooltip.Content>
      </Tooltip.Root>
      <Tooltip.Root delayDuration={rootDelay}>
        <Tooltip.Trigger>Two</Tooltip.Trigger>
        <Tooltip.Content>Second tip</Tooltip.Content>
      </Tooltip.Root>
    </>
  );
}

describe('Tooltip.Provider', () => {
  it('renders no element of its own', () => {
    const { container } = render(
      <Tooltip.Provider>
        <span>child</span>
      </Tooltip.Provider>,
    );
    expect(container.innerHTML).toBe('<span>child</span>');
  });

  it('gives the Root its delayDuration, and a Root value overrides it', async () => {
    const user = setup();
    const { unmount } = render(
      <Tooltip.Provider delayDuration={200}>
        <Two />
      </Tooltip.Provider>,
    );
    await user.hover(first());
    elapse(199);
    expect(isOpen()).toBe(false);
    elapse(1);
    await waitFor(() => {
      expect(isOpen()).toBe(true);
    });
    unmount();
    render(
      <Tooltip.Provider delayDuration={200}>
        <Two rootDelay={50} />
      </Tooltip.Provider>,
    );
    await user.hover(first());
    elapse(50);
    await waitFor(() => {
      expect(isOpen()).toBe(true);
    });
  });

  it('opens the next hover without delay within skipDelayDuration after a close, then waits again', async () => {
    const user = setup();
    render(
      <Tooltip.Provider delayDuration={500} skipDelayDuration={300}>
        <Two />
      </Tooltip.Provider>,
    );
    await user.hover(first());
    elapse(500);
    await waitFor(() => {
      expect(isOpen()).toBe(true);
    });
    await user.unhover(first());
    elapse(100);
    await waitFor(() => {
      expect(isOpen()).toBe(false);
    });
    elapse(100);
    await user.hover(second());
    await waitFor(() => {
      expect(tooltipContent()?.textContent).toBe('Second tip');
    });
    await user.unhover(second());
    elapse(100);
    await waitFor(() => {
      expect(isOpen()).toBe(false);
    });
    elapse(400);
    await user.hover(first());
    elapse(499);
    expect(isOpen()).toBe(false);
    elapse(1);
    await waitFor(() => {
      expect(isOpen()).toBe(true);
    });
  });

  it('never skips with skipDelayDuration 0', async () => {
    const user = setup();
    render(
      <Tooltip.Provider delayDuration={500} skipDelayDuration={0}>
        <Two />
      </Tooltip.Provider>,
    );
    await user.hover(first());
    elapse(500);
    await waitFor(() => {
      expect(isOpen()).toBe(true);
    });
    await user.unhover(first());
    elapse(100);
    await waitFor(() => {
      expect(isOpen()).toBe(false);
    });
    await user.hover(second());
    elapse(499);
    expect(isOpen()).toBe(false);
    elapse(1);
    await waitFor(() => {
      expect(isOpen()).toBe(true);
    });
  });

  it('has no group without a Provider', async () => {
    const user = setup();
    render(<Two />);
    await user.hover(first());
    elapse(700);
    await waitFor(() => {
      expect(isOpen()).toBe(true);
    });
    await user.unhover(first());
    elapse(100);
    await waitFor(() => {
      expect(isOpen()).toBe(false);
    });
    await user.hover(second());
    elapse(699);
    expect(isOpen()).toBe(false);
  });

  it('gives disableHoverableContent to the Root: leaving the trigger closes at once', async () => {
    const user = setup();
    render(
      <Tooltip.Provider disableHoverableContent>
        <Two />
      </Tooltip.Provider>,
    );
    await user.hover(first());
    elapse(700);
    await waitFor(() => {
      expect(isOpen()).toBe(true);
    });
    await user.unhover(first());
    await waitFor(() => {
      expect(isOpen()).toBe(false);
    });
  });

  it('forms its own group when nested', async () => {
    const user = setup();
    render(
      <Tooltip.Provider delayDuration={500}>
        <Tooltip.Root>
          <Tooltip.Trigger>One</Tooltip.Trigger>
          <Tooltip.Content>First tip</Tooltip.Content>
        </Tooltip.Root>
        <Tooltip.Provider delayDuration={500}>
          <Tooltip.Root>
            <Tooltip.Trigger>Two</Tooltip.Trigger>
            <Tooltip.Content>Second tip</Tooltip.Content>
          </Tooltip.Root>
        </Tooltip.Provider>
      </Tooltip.Provider>,
    );
    await user.hover(first());
    elapse(500);
    await waitFor(() => {
      expect(isOpen()).toBe(true);
    });
    await user.unhover(first());
    elapse(100);
    await user.hover(second());
    elapse(499);
    expect(isOpen()).toBe(false);
  });

  it('does not accept closeDelay or delay on the Root', () => {
    // @ts-expect-error closeDelay was removed
    render(<Tooltip.Root closeDelay={1} />);
    // @ts-expect-error delay was renamed to delayDuration
    render(<Tooltip.Root delay={1} />);
  });
});
