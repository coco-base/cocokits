// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { dialogAnatomy, dialogMeta } from '@cocokits/machines/dialog';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { undeclaredData } from '../../internal/tests/declared-data';
import { Example, stubTopLayer } from './fixtures';

beforeEach(stubTopLayer);
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('Dialog declared data attributes', () => {
  it('emits only the data-* the meta declares on every part', async () => {
    render(<Example />);
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    await waitFor(() => {
      expect(document.querySelector('dialog[open]')).not.toBeNull();
    });
    for (const { part, found, undeclared } of undeclaredData(dialogAnatomy.classes, {
      ...dialogMeta.dataAttrs,
      // The jsdom stub of `showModal` marks the dialog; the platform does not.
      content: [...dialogMeta.dataAttrs.content, 'data-modal'],
    })) {
      if (found > 0) expect(undeclared, part).toEqual([]);
    }
  });
});
