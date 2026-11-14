// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { selectAnatomy, selectMeta } from '@cocokits/machines/select';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { undeclaredData } from '../../internal/tests/declared-data';
import { Select } from '../index';
import { stubTopLayer, Dishes, Opt } from './fixtures';

beforeEach(() => {
  stubTopLayer();
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('Select declared data attributes', () => {
  it('emits only the data-* the meta declares on every part', async () => {
    render(
      <Dishes multiple required invalid defaultValue={['Cake']}>
        <Select.Group disabled>
          <Select.Label>Desserts</Select.Label>
          <Opt value="Cake">Cake</Opt>
        </Select.Group>
        <Opt value="Pizza" disabled>
          Pizza
        </Opt>
        <Opt value="Burger">Burger</Opt>
      </Dishes>,
    );
    await userEvent.click(screen.getByRole('combobox'));
    await screen.findByRole('listbox');
    const results = undeclaredData(selectAnatomy.classes, selectMeta.dataAttrs);
    for (const { part, found, undeclared } of results) {
      if (found > 0) expect(undeclared, part).toEqual([]);
    }
    expect(results.find((entry) => entry.part === 'option')?.found).toBe(3);
  });
});
