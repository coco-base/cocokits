import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideCckTheme } from '@cocokits/angular-core';
import { popoverAnatomy } from '@cocokits/machines/popover';
import { defineThemeConfig } from '@cocokits/shared';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckPopoverImports } from '../index';
import { stubOverlayApis } from './overlay-stubs';

// An option that targets every part that renders an element.
const themeConfig = defineThemeConfig({
  name: 'test',
  components: {
    [popoverAnatomy.block]: {
      probe: {
        attrName: 'probe',
        values: ['on'],
        default: 'on',
        partNames: ['anchor', 'trigger', 'content', 'title', 'description', 'close'],
      },
    },
  },
});

// An option that also targets the root, which renders no element: nothing can carry its attribute.
const rootThemeConfig = defineThemeConfig({
  name: 'test-root',
  components: {
    [popoverAnatomy.block]: {
      probe: { attrName: 'probe', values: ['on'], default: 'on', partNames: ['root', 'trigger'] },
    },
  },
});

const template = `
  <ng-container cckPopover>
    <div cckPopoverAnchor><button cckPopoverTrigger>Open</button></div>
    <ng-template cckPopoverPortal>
      <cck-popover-content><h2 cckPopoverTitle>Panel</h2><cck-popover-description>Text</cck-popover-description><button cckPopoverClose>Close</button></cck-popover-content>
    </ng-template>
  </ng-container>`;

describe('Popover theme', () => {
  beforeEach(stubOverlayApis);
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('puts the theme attribute on every part that renders an element', async () => {
    const user = userEvent.setup();
    await render(template, { imports: [...CckPopoverImports], providers: [provideCckTheme(themeConfig)] });
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await screen.findByRole('dialog');
    const { anchor, trigger, content, title, description, close } = popoverAnatomy.classes;
    for (const className of [anchor, trigger, content, title, description, close]) {
      expect(document.querySelector(`.${className}`)?.getAttribute('data-probe'), className).toBe('on');
    }
  });

  it('renders without error when a theme gives the root, which has no element, an attribute', async () => {
    const user = userEvent.setup();
    await render(template, { imports: [...CckPopoverImports], providers: [provideCckTheme(rootThemeConfig)] });
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await screen.findByRole('dialog');
    expect(screen.getByRole('button', { name: 'Open' }).getAttribute('data-probe')).toBe('on');
  });

  it('renders no theme attribute without a theme', async () => {
    const user = userEvent.setup();
    await render(template, { imports: [...CckPopoverImports] });
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await screen.findByRole('dialog');
    expect(document.querySelector('[data-probe]')).toBeNull();
  });
});
