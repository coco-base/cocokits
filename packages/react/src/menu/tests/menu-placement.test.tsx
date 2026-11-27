// @vitest-environment jsdom
import { cleanup, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DirectionProvider } from '@cocokits/react-core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Example, menu, stubLayout, stubTopLayer, trigger } from './fixtures';

beforeEach(stubTopLayer);
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const BOX = { left: 300, top: 100, width: 100, height: 20 } as const;

/** The left edge the content got, read from the positioned wrapper. */
const left = (): number => Number.parseFloat(menu()?.style.left ?? 'NaN');

describe('Menu placement', () => {
  it('opens below the trigger, aligned to its start, with the defaults on the content', async () => {
    stubLayout(BOX);
    render(<Example />);
    await userEvent.click(trigger());
    await waitFor(() => {
      expect(menu()?.style.left).not.toBe('0px');
    });
    expect(menu()?.getAttribute('data-side')).toBe('bottom');
    expect(menu()?.getAttribute('data-align')).toBe('start');
    expect(left()).toBe(BOX.left);
  });

  it('moves to the other side when there is no room, and says so in data-side', async () => {
    stubLayout({ ...BOX, top: 770 });
    render(<Example />);
    await userEvent.click(trigger());
    await waitFor(() => {
      expect(menu()?.getAttribute('data-side')).toBe('top');
    });
  });

  it('keeps data-align at the resolved alignment for align end', async () => {
    stubLayout(BOX);
    render(<Example content={{ align: 'end' }} />);
    await userEvent.click(trigger());
    await waitFor(() => {
      expect(menu()?.style.left).not.toBe('0px');
    });
    expect(menu()?.getAttribute('data-align')).toBe('end');
    expect(left()).toBe(BOX.left + BOX.width - 50);
  });

  it('applies sideOffset and alignOffset', async () => {
    stubLayout(BOX);
    render(<Example content={{ sideOffset: 10, alignOffset: 7 }} />);
    await userEvent.click(trigger());
    await waitFor(() => {
      expect(menu()?.style.top).toBe(`${String(BOX.top + BOX.height + 10)}px`);
    });
    expect(left()).toBe(BOX.left + 7);
  });

  it.each([
    { dir: 'ltr' as const, side: 'start' as const, right: false },
    { dir: 'rtl' as const, side: 'start' as const, right: true },
    { dir: 'ltr' as const, side: 'end' as const, right: true },
    { dir: 'rtl' as const, side: 'end' as const, right: false },
  ])('puts side $side on the right of the trigger: $right (dir $dir)', async ({ dir, side, right }) => {
    stubLayout(BOX);
    render(
      <DirectionProvider dir={dir}>
        <Example content={{ side }} />
      </DirectionProvider>,
    );
    await userEvent.click(trigger());
    await waitFor(() => {
      expect(menu()?.style.left).not.toBe('0px');
    });
    expect(menu()?.getAttribute('data-side')).toBe(side);
    if (right) expect(left()).toBeGreaterThanOrEqual(BOX.left + BOX.width);
    else expect(left() + 50).toBeLessThanOrEqual(BOX.left);
  });
});
