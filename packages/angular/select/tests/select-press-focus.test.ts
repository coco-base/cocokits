import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckSelectImports } from '../index';
import { stubOverlayApis } from './overlay-stubs';
import { trigger } from './helpers';

const imports = [...CckSelectImports];
const SELECT = `
  <button id="other">Other</button>
  <cck-select aria-label="Dish" [disabled]="disabled" [readonly]="readonly">
    <cck-select-option value="a">Apple</cck-select-option>
    <cck-select-option value="b">Banana</cck-select-option>
  </cck-select>`;

describe('Select trigger focus on a press', () => {
  beforeEach(stubOverlayApis);
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('focuses the trigger when the press did not, opens the list and keeps focus through Escape', async () => {
    const user = userEvent.setup();
    await render(SELECT, { imports, componentProperties: { disabled: false, readonly: false } });
    screen.getByRole('button', { name: 'Other' }).focus();
    // A script click focuses nothing, like a press in Safari.
    trigger().click();
    await screen.findByRole('listbox');
    expect(document.activeElement).toBe(trigger());
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).toBeNull();
    });
    expect(document.activeElement).toBe(trigger());
  });

  it('moves no focus on a read-only trigger', async () => {
    await render(SELECT, { imports, componentProperties: { disabled: false, readonly: true } });
    const other = screen.getByRole('button', { name: 'Other' });
    other.focus();
    trigger().click();
    expect(document.activeElement).toBe(other);
  });
});
