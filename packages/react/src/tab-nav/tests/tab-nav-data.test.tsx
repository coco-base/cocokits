// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';

import { tabNavAnatomy, tabNavMeta } from '@cocokits/machines/tab-nav';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { undeclaredData } from '../../internal/tests/declared-data';
import { Example } from './fixtures';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('TabNav declared data attributes', () => {
  it('emits only the data-* the meta declares on every part', () => {
    render(<Example lockSettings />);
    expect(screen.getAllByRole('link').length).toBe(3);
    for (const { part, found, undeclared } of undeclaredData(tabNavAnatomy.classes, tabNavMeta.dataAttrs)) {
      if (found > 0) expect(undeclared, part).toEqual([]);
    }
  });
});
