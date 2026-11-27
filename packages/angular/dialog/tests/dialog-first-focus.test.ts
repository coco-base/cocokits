import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { CckRadioImports } from '@cocokits/angular/radio';
import { CckRadioGroupImports } from '@cocokits/angular/radio-group';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckDialogImports } from '../index';
import { stubOverlayApis } from './overlay-stubs';

const imports = [...CckDialogImports, ...CckRadioGroupImports, ...CckRadioImports];

/** A dialog whose first control is a RadioGroup with the second radio checked. */
const declare = (attributes: string): string =>
  `<button [cckDialogTriggerFor]="dialog" ${attributes}>Open</button>
  <ng-template #dialog>
    <dialog cckDialogContent>
      <h2 cckDialogTitle>Plan</h2>
      <cck-radio-group aria-label="Plan" value="pro">
        <cck-radio submitValue="free">Free</cck-radio>
        <cck-radio submitValue="pro">Pro</cck-radio>
      </cck-radio-group>
      <button cckDialogClose>Cancel</button>
    </dialog>
  </ng-template>`;

const opened = (): Promise<HTMLDialogElement> =>
  waitFor(() => {
    const element = document.querySelector('dialog');
    if (!element?.hasAttribute('open')) throw new Error('the dialog is not open');
    return element;
  });

describe('Dialog first focus', () => {
  beforeEach(stubOverlayApis);
  afterEach(() => {
    vi.restoreAllMocks();
    document.documentElement.removeAttribute('style');
  });

  it('focuses the checked radio of a group, not the first radio', async () => {
    await render(declare(''), { imports });
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    await opened();
    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByRole('radio', { name: 'Pro' }));
    });
  });

  it('does not scroll the page when a dialog starts open', async () => {
    const focus = vi.spyOn(HTMLElement.prototype, 'focus');
    await render(declare('[open]="true"'), { imports });
    await opened();
    const pro = screen.getByRole('radio', { name: 'Pro' });
    await waitFor(() => {
      expect(document.activeElement).toBe(pro);
    });
    expect(focus.mock.contexts.at(-1)).toBe(pro);
    expect(focus.mock.lastCall).toEqual([{ preventScroll: true }]);
  });
});
