// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { popoverAnatomy, popoverMeta } from '@cocokits/machines/popover';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { undeclaredData } from '../../internal/tests/declared-data';
import { Example, stubTopLayer } from './fixtures';

beforeEach(stubTopLayer);
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('Popover declared data attributes', () => {
  it('emits only the data-* the meta declares on every part', async () => {
    render(<Example />);
    await userEvent.click(screen.getByRole('button', { name: 'Share' }));
    await screen.findByRole('dialog');
    expect(screen.getByRole('button', { name: 'Done' })).toBeTruthy();
    for (const { part, found, undeclared } of undeclaredData(popoverAnatomy.classes, popoverMeta.dataAttrs)) {
      if (found > 0) expect(undeclared, part).toEqual([]);
    }
  });
});
