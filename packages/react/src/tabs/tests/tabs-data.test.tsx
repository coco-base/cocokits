// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';

import { tabsAnatomy, tabsMeta } from '@cocokits/machines/tabs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { undeclaredData } from '../../internal/tests/declared-data';
import { Example } from './fixtures';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('Tabs declared data attributes', () => {
  it('emits only the data-* the meta declares on every part', () => {
    render(<Example defaultValue="account" lockPassword />);
    expect(screen.getAllByRole('tab').length).toBe(3);
    for (const { part, found, undeclared } of undeclaredData(tabsAnatomy.classes, tabsMeta.dataAttrs)) {
      if (found > 0) expect(undeclared, part).toEqual([]);
    }
  });
});
