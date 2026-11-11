import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckPopoverImports } from '../index';
import { stubOverlayApis } from './overlay-stubs';

const imports = [...CckPopoverImports];
const TEXT =
  'CocoKits: a PopoverContent has no accessible name. Add a cckPopoverTitle with text, or an aria-label, or an aria-labelledby that points to an element with text.';
const popover = (content: string): string => `
  <ng-container cckPopover>
    <button cckPopoverTrigger>Open</button>
    <ng-template cckPopoverPortal>${content}</ng-template>
  </ng-container>`;

describe('the accessible name warning of a PopoverContent', () => {
  beforeEach(stubOverlayApis);
  afterEach(() => {
    vi.restoreAllMocks();
  });

  async function open(content: string) {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await render(popover(content), { imports });
    await userEvent.setup().click(screen.getByRole('button', { name: 'Open' }));
    await screen.findByRole('dialog', { hidden: true });
    await new Promise((resolve) => setTimeout(resolve, 20));
    return spy;
  }

  it.each([
    ['a dangling aria-labelledby', '<cck-popover-content aria-labelledby="nowhere">x</cck-popover-content>'],
    ['an empty aria-label', '<cck-popover-content aria-label="">x</cck-popover-content>'],
    ['an empty Title', '<cck-popover-content><h2 cckPopoverTitle></h2></cck-popover-content>'],
  ])('warns with %s', async (_name, content) => {
    expect(await open(content)).toHaveBeenCalledWith(TEXT);
  });

  it('does not warn with a Title that has text', async () => {
    expect(await open('<cck-popover-content><h2 cckPopoverTitle>T</h2></cck-popover-content>')).not.toHaveBeenCalled();
  });
});
