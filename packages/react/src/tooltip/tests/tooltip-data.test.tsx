// @vitest-environment jsdom
import { cleanup, render, waitFor } from '@testing-library/react';

import { tooltipAnatomy, tooltipMeta } from '@cocokits/machines/tooltip';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { undeclaredData } from '../../internal/tests/declared-data';
import { Example, stubTopLayer, tooltipContent } from './fixtures';

beforeEach(stubTopLayer);
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('Tooltip declared data attributes', () => {
  it('emits only the data-* the meta declares on every part', async () => {
    render(<Example defaultOpen />);
    await waitFor(() => {
      expect(tooltipContent()).not.toBeNull();
    });
    for (const { part, found, undeclared } of undeclaredData(tooltipAnatomy.classes, tooltipMeta.dataAttrs)) {
      if (found > 0) expect(undeclared, part).toEqual([]);
    }
  });
});
