import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { selectAnatomy, selectMeta } from '@cocokits/machines/select';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckSelectImports } from '../index';
import { stubOverlayApis } from './overlay-stubs';

describe('Select data attributes', () => {
  beforeEach(stubOverlayApis);
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('only emits data-* declared in the meta, on every part', async () => {
    const user = userEvent.setup();
    await render(
      `<cck-select aria-label="Dish" name="dish" required multiple>
        <cck-select-option value="Cake">Cake</cck-select-option>
        <cck-select-option-group label="Mains"><cck-select-option value="Pizza" disabled>Pizza</cck-select-option></cck-select-option-group>
      </cck-select>`,
      { imports: [...CckSelectImports] },
    );
    await user.click(screen.getByRole('combobox'));
    await screen.findByRole('listbox');
    await user.click(screen.getByRole('option', { name: 'Cake' }));
    const declared: Readonly<Record<string, readonly string[]>> = selectMeta.dataAttrs;
    let checked = 0;
    for (const [part, allowed] of Object.entries(declared)) {
      for (const el of document.querySelectorAll(`.${(selectAnatomy.classes as Record<string, string>)[part]}`)) {
        const names = Array.from(el.attributes, (a) => a.name).filter((n) => n.startsWith('data-'));
        expect(
          names.filter((n) => !allowed.includes(n)),
          part,
        ).toEqual([]);
        checked++;
      }
    }
    expect(checked).toBeGreaterThan(1);
  });
});
