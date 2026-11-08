import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideCckTheme } from '@cocokits/angular-core';
import { dialogAnatomy } from '@cocokits/machines/dialog';
import { defineThemeConfig } from '@cocokits/shared';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckDialogImports } from '../index';
import { stubOverlayApis } from './overlay-stubs';

// An option that targets every part that renders an element, and the root, which renders none.
const themeConfig = defineThemeConfig({
  name: 'test',
  components: {
    [dialogAnatomy.block]: {
      probe: {
        attrName: 'probe',
        values: ['on'],
        default: 'on',
        partNames: ['root', 'trigger', 'content', 'title', 'description', 'close'],
      },
    },
  },
});

const template = `
  <ng-container cckDialog>
    <button cckDialogTrigger>Open</button>
    <ng-template cckDialogPortal>
      <dialog cckDialogContent>
        <h2 cckDialogTitle>Panel</h2>
        <cck-dialog-description>Text</cck-dialog-description>
        <button cckDialogClose>Close</button>
      </dialog>
    </ng-template>
  </ng-container>`;

describe('Dialog theme', () => {
  beforeEach(stubOverlayApis);
  afterEach(() => {
    vi.restoreAllMocks();
    document.documentElement.removeAttribute('style');
  });

  it('puts the theme attribute on every part with an element, and renders without error for the root', async () => {
    const user = userEvent.setup();
    await render(template, { imports: [...CckDialogImports], providers: [provideCckTheme(themeConfig)] });
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await screen.findByRole('dialog');
    const { trigger, content, title, description, close } = dialogAnatomy.classes;
    for (const className of [trigger, content, title, description, close]) {
      expect(document.querySelector(`.${className}`)?.getAttribute('data-probe'), className).toBe('on');
    }
  });

  it('renders no theme attribute without a theme', async () => {
    const user = userEvent.setup();
    await render(template, { imports: [...CckDialogImports] });
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await screen.findByRole('dialog');
    expect(document.querySelector('[data-probe]')).toBeNull();
  });
});
