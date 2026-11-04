// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState, type ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { OverlayPositionOptions } from '@cocokits/cdk/positioning';
import { Popover } from '../index';
import { nextFrame, stubTopLayer } from './fixtures';

const { starts, scrollLocks } = vi.hoisted(() => ({
  starts: [] as OverlayPositionOptions[],
  scrollLocks: { locked: 0, unlocked: 0 },
}));

vi.mock('@cocokits/cdk/scroll-lock', () => ({
  lockScroll: () => {
    scrollLocks.locked += 1;
    return () => {
      scrollLocks.unlocked += 1;
    };
  },
}));

vi.mock('@cocokits/cdk/positioning', async (importOriginal) => {
  const original = await importOriginal<typeof import('@cocokits/cdk/positioning')>();
  return {
    ...original,
    startOverlayPosition: (options: OverlayPositionOptions) => {
      starts.push(options);
      return vi.fn();
    },
  };
});

beforeEach(() => {
  stubTopLayer();
  starts.length = 0;
  scrollLocks.locked = 0;
  scrollLocks.unlocked = 0;
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const last = (): OverlayPositionOptions => {
  const start = starts.at(-1);
  if (start === undefined) throw new Error('positioning was not started');
  return start;
};
const trigger = (): HTMLElement => screen.getByRole('button', { name: 'Share' });
const scrollLocked = (): boolean => scrollLocks.locked > scrollLocks.unlocked;

describe('Popover.Arrow', () => {
  it('renders a decorative span with the class and the built-in triangle inside the content', async () => {
    render(
      <Popover.Root defaultOpen>
        <Popover.Trigger>Share</Popover.Trigger>
        <Popover.Content aria-label="x">
          text
          <Popover.Arrow data-testid="arrow" />
        </Popover.Content>
      </Popover.Root>,
    );
    const arrow = await screen.findByTestId('arrow');
    expect(arrow.tagName).toBe('SPAN');
    expect(arrow.className).toBe('cck-popover__arrow');
    expect(arrow.getAttribute('aria-hidden')).toBe('true');
    expect(arrow.hasAttribute('hidden')).toBe(false);
    expect(arrow.parentElement).toBe(screen.getByRole('dialog'));
    const svg = arrow.querySelector('svg');
    expect(svg?.getAttribute('viewBox')).toBe('0 0 30 10');
    expect(svg?.querySelector('polygon')?.getAttribute('points')).toBe('0,0 30,0 15,10');
  });

  it('lets children replace the triangle and render replace the element', async () => {
    render(
      <Popover.Root defaultOpen>
        <Popover.Trigger>Share</Popover.Trigger>
        <Popover.Content aria-label="x">
          <Popover.Arrow data-testid="arrow" render={<i />}>
            <b>tip</b>
          </Popover.Arrow>
        </Popover.Content>
      </Popover.Root>,
    );
    const arrow = await screen.findByTestId('arrow');
    expect(arrow.tagName).toBe('I');
    expect(arrow.querySelector('svg')).toBeNull();
    expect(arrow.querySelector('b')?.textContent).toBe('tip');
  });

  it('gives the arrow to the positioning, with arrowPadding, and hides it when the module says so', async () => {
    render(
      <Popover.Root defaultOpen>
        <Popover.Trigger>Share</Popover.Trigger>
        <Popover.Content aria-label="x" arrowPadding={6}>
          <Popover.Arrow data-testid="arrow" />
        </Popover.Content>
      </Popover.Root>,
    );
    const arrow = await screen.findByTestId('arrow');
    await waitFor(() => {
      expect(last().getArrow?.()).toBe(arrow);
    });
    expect(last().arrowPadding).toBe(6);
    const report = last().onArrowHiddenChange;
    expect(report).toBeTypeOf('function');
    await waitFor(() => {
      report?.(true);
      expect(arrow.hasAttribute('hidden')).toBe(true);
    });
    report?.(false);
    await waitFor(() => {
      expect(arrow.hasAttribute('hidden')).toBe(false);
    });
  });

  it('passes no arrow option without an arrow part', async () => {
    render(
      <Popover.Root defaultOpen>
        <Popover.Trigger>Share</Popover.Trigger>
        <Popover.Content aria-label="x" arrowPadding={6}>
          text
        </Popover.Content>
      </Popover.Root>,
    );
    await waitFor(() => {
      expect(starts.length).toBeGreaterThan(0);
    });
    const names = Object.keys(last());
    expect(names).not.toContain('getArrow');
    expect(names).not.toContain('arrowPadding');
    expect(names).not.toContain('onArrowHiddenChange');
  });

  it('throws outside the content', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() =>
      render(
        <Popover.Root>
          <Popover.Arrow />
        </Popover.Root>,
      ),
    ).toThrow('<Popover.Arrow> must be placed within <Popover.Content>');
  });
});

describe('Popover positioning props', () => {
  it('passes collisionBoundary and updatePositionStrategy, and nothing when unset', async () => {
    const boundary = document.body.appendChild(document.createElement('div'));
    const { unmount } = render(
      <Popover.Root defaultOpen>
        <Popover.Trigger>Share</Popover.Trigger>
        <Popover.Content aria-label="x" collisionBoundary={[boundary, null]} updatePositionStrategy="always">
          text
        </Popover.Content>
      </Popover.Root>,
    );
    await waitFor(() => {
      expect(starts.length).toBeGreaterThan(0);
    });
    expect(last().collisionBoundary).toEqual([boundary, null]);
    expect(last().updatePositionStrategy).toBe('always');
    unmount();
    starts.length = 0;
    render(
      <Popover.Root defaultOpen>
        <Popover.Trigger>Share</Popover.Trigger>
        <Popover.Content aria-label="x">text</Popover.Content>
      </Popover.Root>,
    );
    await waitFor(() => {
      expect(starts.length).toBeGreaterThan(0);
    });
    expect(Object.keys(last())).not.toContain('collisionBoundary');
    expect(Object.keys(last())).not.toContain('updatePositionStrategy');
  });

  it('turns a single element into a list', async () => {
    const boundary = document.body.appendChild(document.createElement('div'));
    render(
      <Popover.Root defaultOpen>
        <Popover.Trigger>Share</Popover.Trigger>
        <Popover.Content aria-label="x" collisionBoundary={boundary}>
          text
        </Popover.Content>
      </Popover.Root>,
    );
    await waitFor(() => {
      expect(starts.length).toBeGreaterThan(0);
    });
    expect(last().collisionBoundary).toEqual([boundary]);
  });

  it('does not restart the positioning for an inline list with the same elements', async () => {
    const boundary = document.body.appendChild(document.createElement('div'));
    function Example(): ReactElement {
      const [count, setCount] = useState(0);
      return (
        <Popover.Root defaultOpen>
          <Popover.Trigger>Share</Popover.Trigger>
          <Popover.Content aria-label="x" collisionBoundary={[boundary]}>
            <button
              onClick={() => {
                setCount(count + 1);
              }}
            >
              rerender {count}
            </button>
          </Popover.Content>
        </Popover.Root>
      );
    }
    render(<Example />);
    await waitFor(() => {
      expect(starts.length).toBeGreaterThan(0);
    });
    const before = starts.length;
    await userEvent.click(await screen.findByRole('button', { name: /rerender/ }));
    expect(starts.length).toBe(before);
  });
});

describe('Popover modal', () => {
  function ModalExample({ modal = true }: { readonly modal?: boolean }): ReactElement {
    return (
      <>
        <button>before</button>
        <Popover.Root modal={modal}>
          <Popover.Trigger>Share</Popover.Trigger>
          <Popover.Content aria-label="Share link">
            <button>first</button>
            <button>last</button>
          </Popover.Content>
        </Popover.Root>
        <button>after</button>
      </>
    );
  }

  it('gives the content aria-modal, makes the page inert while open and restores it after close', async () => {
    render(<ModalExample />);
    await userEvent.click(trigger());
    const dialog = await screen.findByRole('dialog', { name: 'Share link' });
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(screen.getByText('before').closest('[inert]')).not.toBeNull();
    expect(trigger().closest('[inert]')).not.toBeNull();
    expect(dialog.closest('[inert]')).toBeNull();
    expect(scrollLocked()).toBe(true);

    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    expect(document.querySelector('[inert]')).toBeNull();
    expect(scrollLocked()).toBe(false);
    await nextFrame();
    await nextFrame();
    expect(document.activeElement).toBe(trigger());
  });

  it('has no aria-modal, no inert page and no scroll lock when not modal', async () => {
    render(<ModalExample modal={false} />);
    await userEvent.click(trigger());
    const dialog = await screen.findByRole('dialog', { name: 'Share link' });
    expect(dialog.hasAttribute('aria-modal')).toBe(false);
    expect(document.querySelector('[inert]')).toBeNull();
    expect(scrollLocked()).toBe(false);
  });

  it('wraps Tab inside the content', async () => {
    render(<ModalExample />);
    await userEvent.click(trigger());
    await screen.findByRole('dialog', { name: 'Share link' });
    await nextFrame();
    await nextFrame();
    const first = screen.getByRole('button', { name: 'first' });
    const end = screen.getByRole('button', { name: 'last' });
    expect(document.activeElement).toBe(first);
    await userEvent.tab({ shift: true });
    expect(document.activeElement).toBe(end);
    await userEvent.tab();
    expect(document.activeElement).toBe(first);
  });

  it('closes on a press outside, which is inert and so cannot receive the click', async () => {
    render(
      <>
        <button>outside</button>
        <Popover.Root modal>
          <Popover.Trigger>Share</Popover.Trigger>
          <Popover.Content aria-label="x">text</Popover.Content>
        </Popover.Root>
      </>,
    );
    await userEvent.click(trigger());
    await screen.findByRole('dialog');
    const outside = screen.getByText('outside');
    expect(outside.closest('[inert]')).not.toBeNull();
    await userEvent.click(outside, { pointerEventsCheck: 0 });
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });

  it('keeps the value it opened with when modal changes while open', async () => {
    function Switch(): ReactElement {
      const [modal, setModal] = useState(false);
      return (
        <Popover.Root modal={modal}>
          <Popover.Trigger>Share</Popover.Trigger>
          <Popover.Content aria-label="x">
            <button
              onClick={() => {
                setModal(true);
              }}
            >
              switch
            </button>
          </Popover.Content>
        </Popover.Root>
      );
    }
    render(<Switch />);
    await userEvent.click(trigger());
    await userEvent.click(await screen.findByRole('button', { name: 'switch' }));
    expect(screen.getByRole('dialog').hasAttribute('aria-modal')).toBe(false);
    expect(document.querySelector('[inert]')).toBeNull();
  });
});

describe('Popover forceMount', () => {
  function Forced(): ReactElement {
    return (
      <Popover.Root>
        <Popover.Trigger>Share</Popover.Trigger>
        <Popover.Content aria-label="x" forceMount>
          <input aria-label="field" />
        </Popover.Content>
      </Popover.Root>
    );
  }
  const contentElement = (): HTMLElement => {
    const found = document.querySelector<HTMLElement>('.cck-popover__content');
    if (!found) throw new Error('not mounted');
    return found;
  };

  it('keeps the closed content in the document, hidden, with no positioning and no guards', async () => {
    render(<Forced />);
    const dialog = await waitFor(contentElement);
    expect(dialog.hasAttribute('hidden')).toBe(true);
    expect(dialog.getAttribute('data-state')).toBe('closed');
    expect(starts.length).toBe(0);
    expect(dialog.previousElementSibling).toBeNull();
    expect(trigger().getAttribute('aria-controls')).toBe(dialog.id);
  });

  it('shows the same element when it opens and keeps its inner state across open and close', async () => {
    render(<Forced />);
    const dialog = await waitFor(contentElement);
    const field = dialog.querySelector('input');
    await userEvent.click(trigger());
    await waitFor(() => {
      expect(dialog.hasAttribute('hidden')).toBe(false);
    });
    expect(dialog.getAttribute('data-state')).toBe('open');
    await userEvent.type(screen.getByLabelText('field'), 'abc');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(dialog.hasAttribute('hidden')).toBe(true);
    });
    expect(contentElement()).toBe(dialog);
    expect(dialog.querySelector('input')).toBe(field);
    expect(field?.value).toBe('abc');
  });
});
