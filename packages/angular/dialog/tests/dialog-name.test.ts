import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckDialogImports } from '../index';
import { stubOverlayApis } from './overlay-stubs';

const imports = [...CckDialogImports];
const TEXT =
  'CocoKits: a DialogContent has no accessible name. Add a cckDialogTitle with text, or an aria-label, or an aria-labelledby that points to an element with text, to the element with cckDialogContent.';
const dialog = (content: string): string => `
  <ng-container cckDialog>
    <button cckDialogTrigger>Open</button>
    <ng-template cckDialogPortal>${content}</ng-template>
  </ng-container>`;

describe('the accessible name warning of a DialogContent', () => {
  beforeEach(stubOverlayApis);
  afterEach(() => {
    vi.restoreAllMocks();
  });

  async function open(content: string) {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await render(dialog(content), { imports });
    await userEvent.setup().click(screen.getByRole('button', { name: 'Open' }));
    await screen.findByRole('dialog', { hidden: true });
    await new Promise((resolve) => setTimeout(resolve, 20));
    return spy;
  }

  it.each([
    ['a dangling aria-labelledby', '<dialog cckDialogContent aria-labelledby="nowhere">x</dialog>'],
    ['an empty aria-label', '<dialog cckDialogContent aria-label="">x</dialog>'],
    ['an empty Title', '<dialog cckDialogContent><h2 cckDialogTitle></h2></dialog>'],
  ])('warns with %s', async (_name, content) => {
    expect(await open(content)).toHaveBeenCalledWith(TEXT);
  });

  it('does not warn with a Title that has text', async () => {
    expect(await open('<dialog cckDialogContent><h2 cckDialogTitle>T</h2></dialog>')).not.toHaveBeenCalled();
  });
});
