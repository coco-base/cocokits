import { render, screen } from '@testing-library/angular';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CCK_POPOVER_DEFAULT_OPTIONS, CckPopoverImports } from '../index';
import { stubOverlayApis } from './overlay-stubs';

const imports = [...CckPopoverImports];
const provided = [{ provide: CCK_POPOVER_DEFAULT_OPTIONS, useValue: { side: 'top', align: 'start' } }];

function template(attrs: string): string {
  return `
    <ng-container cckPopover [open]="true">
      <button cckPopoverTrigger>Open</button>
      <ng-template cckPopoverPortal><div cckPopoverContent aria-label="Panel" ${attrs}>Text</div></ng-template>
    </ng-container>`;
}

describe('CCK_POPOVER_DEFAULT_OPTIONS', () => {
  beforeEach(stubOverlayApis);
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('defaults to bottom and center', async () => {
    await render(template(''), { imports });
    const dialog = await screen.findByRole('dialog');
    expect(dialog.getAttribute('data-side')).toBe('bottom');
    expect(dialog.getAttribute('data-align')).toBe('center');
  });

  it('takes the provided side and align', async () => {
    await render(template(''), { imports, providers: provided });
    const dialog = await screen.findByRole('dialog');
    expect(dialog.getAttribute('data-side')).toBe('top');
    expect(dialog.getAttribute('data-align')).toBe('start');
  });

  it('lets an input on the element win over the provided value', async () => {
    await render(template('side="end" align="end"'), { imports, providers: provided });
    const dialog = await screen.findByRole('dialog');
    expect(dialog.getAttribute('data-side')).toBe('end');
    expect(dialog.getAttribute('data-align')).toBe('end');
  });
});
