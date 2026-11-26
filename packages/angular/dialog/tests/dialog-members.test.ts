import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { dialogAnatomy } from '@cocokits/machines/dialog';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckDialogConfig, CckDialogImports } from '../index';
import { stubOverlayApis } from './overlay-stubs';
import { closed } from './queries';
import { ServicePlain, dialogElement, setup } from './service-fixtures';

const imports = [...CckDialogImports];
const { classes } = dialogAnatomy;

const declare = (attributes: string, body = '<h2 cckDialogTitle>Title</h2>'): string =>
  `<button id="before">Before</button>
  <button [cckDialogTriggerFor]="dialog" ${attributes}>Open</button>
  <ng-template #dialog>
    <dialog cckDialogContent>${body}<button id="inside">Inside</button><button cckDialogClose>Close</button></dialog>
  </ng-template>
  <button id="after">After</button>`;

const trigger = (): HTMLElement => screen.getByRole('button', { name: 'Open' });
const open = async (user = userEvent.setup()): Promise<HTMLDialogElement> => {
  await user.click(trigger());
  return await waitFor(() => {
    const element = document.querySelector('dialog');
    if (!element?.hasAttribute('open')) throw new Error('the dialog is not open');
    return element;
  });
};

describe('Dialog parts', () => {
  beforeEach(stubOverlayApis);
  afterEach(() => {
    vi.restoreAllMocks();
    document.documentElement.removeAttribute('style');
  });

  it('renders header, body and footer with their classes and the theme attributes slot', async () => {
    await render(
      declare(
        '',
        '<cck-dialog-header><h2 cckDialogTitle>Title</h2></cck-dialog-header><cck-dialog-body>Text</cck-dialog-body><cck-dialog-footer>Actions</cck-dialog-footer>',
      ),
      { imports },
    );
    const dialog = await open();
    expect(dialog.querySelector(`cck-dialog-header.${classes.header}`)).not.toBeNull();
    expect(dialog.querySelector(`cck-dialog-body.${classes.body}`)?.textContent).toBe('Text');
    expect(dialog.querySelector(`cck-dialog-footer.${classes.footer}`)?.textContent).toBe('Actions');
    for (const part of ['header', 'body', 'footer']) {
      expect(dialog.querySelector(`cck-dialog-${part}`)?.hasAttribute('role'), part).toBe(false);
    }
    expect(screen.getByRole('dialog', { name: 'Title' })).toBe(dialog);
  });
});

describe('Dialog root members', () => {
  beforeEach(stubOverlayApis);
  afterEach(() => {
    vi.restoreAllMocks();
    document.documentElement.removeAttribute('style');
  });

  const sizes = [
    { name: 'none', attributes: '', style: {} },
    { name: 'a number is px', attributes: '[width]="480"', style: { width: '480px' } },
    {
      name: 'every member',
      attributes: 'width="40rem" [height]="300" minWidth="20rem" [minHeight]="100" maxWidth="90vw" maxHeight="80vh"',
      style: {
        width: '40rem',
        height: '300px',
        'min-width': '20rem',
        'min-height': '100px',
        'max-width': '90vw',
        'max-height': '80vh',
      },
    },
  ];
  it.each(sizes)('size members: $name', async ({ attributes, style }) => {
    await render(declare(attributes), { imports });
    const dialog = await open();
    expect(Object.fromEntries(Array.from(dialog.style, (name) => [name, dialog.style.getPropertyValue(name)]))).toEqual(
      style,
    );
  });

  it('role alertdialog is written, and the default writes none', async () => {
    await render(declare('role="alertdialog"'), { imports });
    expect((await open()).getAttribute('role')).toBe('alertdialog');
  });

  it('writes no role by default', async () => {
    await render(declare(''), { imports });
    expect((await open()).hasAttribute('role')).toBe(false);
  });

  it('is modal by default: showModal, and Escape closes it', async () => {
    const user = userEvent.setup();
    await render(declare(''), { imports });
    const dialog = await open(user);
    expect(dialog.hasAttribute('data-modal')).toBe(true);
    await user.keyboard('{Escape}');
    await closed();
  });

  describe('not modal', () => {
    it('opens with show(), with no modal mark, and the trigger closes it', async () => {
      const user = userEvent.setup();
      await render(declare('[modal]="false"'), { imports });
      const dialog = await open(user);
      expect(dialog.hasAttribute('open')).toBe(true);
      expect(dialog.hasAttribute('data-modal')).toBe(false);
      await user.click(trigger());
      await closed();
    });

    it('closes on Escape, on a focus move outside and not on a focus move inside', async () => {
      const user = userEvent.setup();
      await render(declare('[modal]="false"'), { imports });
      await open(user);
      screen.getByRole('button', { name: 'Inside' }).focus();
      expect(screen.queryByRole('dialog')).not.toBeNull();
      await user.keyboard('{Escape}');
      await closed();
      await open(user);
      screen.getByRole('button', { name: 'After' }).focus();
      await closed();
    });

    it('does not close on a focus move outside while disableClose is set', async () => {
      const user = userEvent.setup();
      await render(declare('[modal]="false" disableClose'), { imports });
      await open(user);
      screen.getByRole('button', { name: 'After' }).focus();
      await user.keyboard('{Escape}');
      expect(screen.queryByRole('dialog')).not.toBeNull();
    });
  });

  it('autoFocus with a selector focuses the first match', async () => {
    await render(declare('autoFocus="#inside"'), { imports });
    await open();
    await waitFor(() => {
      expect(document.activeElement?.id).toBe('inside');
    });
  });

  it('restoreFocus false leaves the focus where it is when the dialog closes', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(declare('[restoreFocus]="false"'), { imports });
    await open(user);
    await user.click(screen.getByRole('button', { name: 'Close' }));
    await closed();
    await fixture.whenStable();
    expect(document.activeElement).not.toBe(trigger());
  });

  it('restoreFocus with a selector moves the focus to the match', async () => {
    const user = userEvent.setup();
    await render(declare('restoreFocus="#after"'), { imports });
    await open(user);
    await user.click(screen.getByRole('button', { name: 'Close' }));
    await closed();
    await waitFor(() => {
      expect(document.activeElement?.id).toBe('after');
    });
  });
});

describe('CckDialogConfig members', () => {
  beforeEach(stubOverlayApis);
  afterEach(() => {
    vi.restoreAllMocks();
    document.documentElement.removeAttribute('style');
    document.body.innerHTML = '';
  });

  it('is modal with no size and no panel class by default', () => {
    const config = new CckDialogConfig();
    expect(config.modal).toBe(true);
    expect(config.width).toBeUndefined();
    expect(config.panelClass).toBeUndefined();
  });

  it('writes the size members and the panel classes on the dialog', async () => {
    const { host } = await setup();
    host.service.open(ServicePlain, {
      width: 400,
      maxHeight: '80vh',
      panelClass: ['wide', 'tinted'],
      ariaLabel: 'Plain',
    });
    const dialog = await dialogElement();
    expect(dialog.style.width).toBe('400px');
    expect(dialog.style.maxHeight).toBe('80vh');
    expect(dialog.classList.contains('wide')).toBe(true);
    expect(dialog.classList.contains('tinted')).toBe(true);
  });

  it('accepts one panel class as a string', async () => {
    const { host } = await setup();
    host.service.open(ServicePlain, { panelClass: 'solo', ariaLabel: 'Plain' });
    expect((await dialogElement()).classList.contains('solo')).toBe(true);
  });

  it('modal false opens a non-modal dialog', async () => {
    const { host } = await setup();
    host.service.open(ServicePlain, { modal: false, ariaLabel: 'Plain' });
    const dialog = await dialogElement();
    expect(dialog.hasAttribute('open')).toBe(true);
    expect(dialog.hasAttribute('data-modal')).toBe(false);
  });

  it('modal defaults to true, and role alertdialog is written', async () => {
    const { host } = await setup();
    host.service.open(ServicePlain, { role: 'alertdialog', ariaLabel: 'Plain' });
    const dialog = await dialogElement();
    expect(dialog.hasAttribute('data-modal')).toBe(true);
    expect(dialog.getAttribute('role')).toBe('alertdialog');
  });
});
