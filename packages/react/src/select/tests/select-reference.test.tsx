// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { OverlayPositionOptions } from '@cocokits/cdk/positioning';
import { Dishes, Opt, stubTopLayer } from './fixtures';

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

describe('Select.Content positioning props', () => {
  it('passes the shared props to startOverlayPosition', async () => {
    const boundary = document.body.appendChild(document.createElement('div'));
    render(
      <Dishes
        defaultOpen
        contentProps={{
          sideOffset: 12,
          alignOffset: 3,
          avoidCollisions: false,
          collisionPadding: { top: 8 },
          sticky: 'always',
          hideWhenDetached: true,
          collisionBoundary: [boundary],
          updatePositionStrategy: 'always',
        }}
      >
        <Opt value="Cake">Cake</Opt>
      </Dishes>,
    );
    await waitFor(() => {
      expect(starts.length).toBeGreaterThan(0);
    });
    expect(last()).toMatchObject({
      sideOffset: 12,
      alignOffset: 3,
      avoidCollisions: false,
      collisionPadding: { top: 8 },
      sticky: 'always',
      hideWhenDetached: true,
      collisionBoundary: [boundary],
      updatePositionStrategy: 'always',
    });
  });

  it('passes nothing when the props are unset', async () => {
    render(
      <Dishes defaultOpen>
        <Opt value="Cake">Cake</Opt>
      </Dishes>,
    );
    await waitFor(() => {
      expect(starts.length).toBeGreaterThan(0);
    });
    expect(Object.keys(last()).sort()).toEqual([
      'align',
      'getAnchor',
      'getContent',
      'getDirection',
      'onPlacementChange',
      'side',
    ]);
  });

  it('hides the list while the anchor is detached', async () => {
    render(
      <Dishes defaultOpen contentProps={{ hideWhenDetached: true }}>
        <Opt value="Cake">Cake</Opt>
      </Dishes>,
    );
    const list = await screen.findByRole('listbox');
    await waitFor(() => {
      expect(last().onAnchorHiddenChange).toBeTypeOf('function');
    });
    await waitFor(() => {
      last().onAnchorHiddenChange?.(true);
      expect(list.hasAttribute('hidden')).toBe(true);
    });
  });
});

describe('Select.Content forceMount', () => {
  const contentElement = (): HTMLElement => {
    const found = document.querySelector<HTMLElement>('.cck-select__content');
    if (!found) throw new Error('not mounted');
    return found;
  };

  it('keeps the closed list in the document, hidden, with its items, and without positioning', async () => {
    render(
      <Dishes contentProps={{ forceMount: true }}>
        <Opt value="Cake">Cake</Opt>
        <Opt value="Burger">Burger</Opt>
      </Dishes>,
    );
    const list = await waitFor(contentElement);
    expect(list.hasAttribute('hidden')).toBe(true);
    expect(list.getAttribute('data-state')).toBe('closed');
    expect(list.querySelectorAll('[role="option"]').length).toBe(2);
    expect(starts.length).toBe(0);
    expect(screen.getByRole('combobox').getAttribute('aria-controls')).toBe(list.id);
  });

  it('shows the same element when it opens, and hides it again after it closes', async () => {
    render(
      <Dishes contentProps={{ forceMount: true }}>
        <Opt value="Cake">Cake</Opt>
        <Opt value="Burger">Burger</Opt>
      </Dishes>,
    );
    const list = await waitFor(contentElement);
    await userEvent.click(screen.getByRole('combobox'));
    await waitFor(() => {
      expect(list.hasAttribute('hidden')).toBe(false);
    });
    expect(list.getAttribute('data-state')).toBe('open');
    expect(starts.length).toBeGreaterThan(0);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(list.hasAttribute('hidden')).toBe(true);
    });
    expect(contentElement()).toBe(list);
    expect(list.getAttribute('data-state')).toBe('closed');
  });

  it('selects an item of a force-mounted list and shows its text', async () => {
    render(
      <Dishes placeholder="Choose" contentProps={{ forceMount: true }}>
        <Opt value="Cake">Cake</Opt>
        <Opt value="Burger">Burger</Opt>
      </Dishes>,
    );
    await waitFor(contentElement);
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(await screen.findByRole('option', { name: 'Burger' }));
    await waitFor(() => {
      expect(screen.getByRole('combobox').textContent).toContain('Burger');
    });
  });
});
