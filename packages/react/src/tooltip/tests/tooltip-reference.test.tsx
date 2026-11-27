// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState, type ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { OverlayPositionOptions } from '@cocokits/cdk/positioning';
import { Tooltip } from '../index';
import { stubTopLayer, tooltipContent } from './fixtures';

const { starts } = vi.hoisted(() => ({ starts: [] as OverlayPositionOptions[] }));

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

describe('Tooltip.Arrow', () => {
  function WithArrow({ arrowPadding }: { readonly arrowPadding?: number }): ReactElement {
    return (
      <Tooltip.Root defaultOpen>
        <Tooltip.Trigger aria-label="Copy link">Copy</Tooltip.Trigger>
        <Tooltip.Content arrowPadding={arrowPadding}>
          Copy the link
          <Tooltip.Arrow data-testid="arrow" />
        </Tooltip.Content>
      </Tooltip.Root>
    );
  }

  it('renders a decorative span with the class and the built-in triangle inside the content', async () => {
    render(<WithArrow />);
    const arrow = await screen.findByTestId('arrow');
    expect(arrow.tagName).toBe('SPAN');
    expect(arrow.className).toBe('cck-tooltip__arrow');
    expect(arrow.getAttribute('aria-hidden')).toBe('true');
    expect(arrow.hasAttribute('hidden')).toBe(false);
    expect(arrow.parentElement).toBe(tooltipContent());
    const svg = arrow.querySelector('svg');
    expect(svg?.getAttribute('viewBox')).toBe('0 0 30 10');
    expect(svg?.querySelector('polygon')?.getAttribute('points')).toBe('0,0 30,0 15,10');
  });

  it('lets children replace the triangle and render replace the element', async () => {
    render(
      <Tooltip.Root defaultOpen>
        <Tooltip.Trigger aria-label="Copy link">Copy</Tooltip.Trigger>
        <Tooltip.Content>
          Copy the link
          <Tooltip.Arrow data-testid="arrow" render={<i />}>
            <b>tip</b>
          </Tooltip.Arrow>
        </Tooltip.Content>
      </Tooltip.Root>,
    );
    const arrow = await screen.findByTestId('arrow');
    expect(arrow.tagName).toBe('I');
    expect(arrow.querySelector('svg')).toBeNull();
    expect(arrow.querySelector('b')?.textContent).toBe('tip');
  });

  it('gives the arrow to the positioning, with arrowPadding, and hides it when the module says so', async () => {
    render(<WithArrow arrowPadding={4} />);
    const arrow = await screen.findByTestId('arrow');
    await waitFor(() => {
      expect(last().getArrow?.()).toBe(arrow);
    });
    expect(last().arrowPadding).toBe(4);
    const report = last().onArrowHiddenChange;
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
      <Tooltip.Root defaultOpen>
        <Tooltip.Trigger aria-label="Copy link">Copy</Tooltip.Trigger>
        <Tooltip.Content arrowPadding={4}>Copy the link</Tooltip.Content>
      </Tooltip.Root>,
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
        <Tooltip.Root>
          <Tooltip.Arrow />
        </Tooltip.Root>,
      ),
    ).toThrow('<Tooltip.Arrow> must be placed within <Tooltip.Content>');
  });
});

describe('Tooltip positioning props', () => {
  it('passes collisionBoundary and updatePositionStrategy, and nothing when unset', async () => {
    const boundary = document.body.appendChild(document.createElement('div'));
    const { unmount } = render(
      <Tooltip.Root defaultOpen>
        <Tooltip.Trigger aria-label="Copy link">Copy</Tooltip.Trigger>
        <Tooltip.Content collisionBoundary={boundary} updatePositionStrategy="always">
          Copy the link
        </Tooltip.Content>
      </Tooltip.Root>,
    );
    await waitFor(() => {
      expect(starts.length).toBeGreaterThan(0);
    });
    expect(last().collisionBoundary).toEqual([boundary]);
    expect(last().updatePositionStrategy).toBe('always');
    unmount();
    starts.length = 0;
    render(
      <Tooltip.Root defaultOpen>
        <Tooltip.Trigger aria-label="Copy link">Copy</Tooltip.Trigger>
        <Tooltip.Content>Copy the link</Tooltip.Content>
      </Tooltip.Root>,
    );
    await waitFor(() => {
      expect(starts.length).toBeGreaterThan(0);
    });
    expect(Object.keys(last())).not.toContain('collisionBoundary');
    expect(Object.keys(last())).not.toContain('updatePositionStrategy');
  });
});

describe('Tooltip forceMount', () => {
  function Forced(): ReactElement {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button
          onClick={() => {
            setOpen(!open);
          }}
        >
          toggle
        </button>
        <Tooltip.Root open={open}>
          <Tooltip.Trigger aria-label="Copy link">Copy</Tooltip.Trigger>
          <Tooltip.Content forceMount>
            <span data-testid="inner">Copy the link</span>
            <Tooltip.Arrow />
          </Tooltip.Content>
        </Tooltip.Root>
      </>
    );
  }

  it('keeps the closed content in the document, hidden, and without positioning', async () => {
    render(<Forced />);
    const content = await waitFor(() => {
      const found = tooltipContent();
      if (!found) throw new Error('not mounted');
      return found;
    });
    expect(content.hasAttribute('hidden')).toBe(true);
    expect(content.getAttribute('data-state')).toBe('closed');
    expect(starts.length).toBe(0);
  });

  it('shows the same element when it opens and hides it again after it closes', async () => {
    render(<Forced />);
    const content = await waitFor(() => {
      const found = tooltipContent();
      if (!found) throw new Error('not mounted');
      return found;
    });
    const inner = screen.getByTestId('inner');
    await userEvent.click(screen.getByRole('button', { name: 'toggle' }));
    await waitFor(() => {
      expect(content.hasAttribute('hidden')).toBe(false);
    });
    expect(content.getAttribute('data-state')).toBe('open');
    expect(starts.length).toBeGreaterThan(0);
    await userEvent.click(screen.getByRole('button', { name: 'toggle' }));
    await waitFor(() => {
      expect(content.hasAttribute('hidden')).toBe(true);
    });
    expect(tooltipContent()).toBe(content);
    expect(screen.getByTestId('inner')).toBe(inner);
  });
});
