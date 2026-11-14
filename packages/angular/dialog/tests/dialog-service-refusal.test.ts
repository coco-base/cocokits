import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckDialogConfig, type CckDialogRef } from '../index';
import { stubOverlayApis } from './overlay-stubs';
import { ServiceBody, ServicePlain, dialogElement, must, pressBackdrop, setup, settle } from './service-fixtures';

beforeEach(stubOverlayApis);
afterEach(() => {
  vi.restoreAllMocks();
  document.documentElement.removeAttribute('style');
  document.body.innerHTML = '';
});

const closeButton = (name: string): HTMLElement =>
  must([...document.querySelectorAll<HTMLElement>('dialog button')].find((button) => button.textContent === name));

/** Counts what a ref emits and how its state looks after a refused request. */
function watch(ref: CckDialogRef): { backdrop: number; keys: string[]; lifecycle: string[] } {
  const seen = { backdrop: 0, keys: [] as string[], lifecycle: [] as string[] };
  ref.backdropClick().subscribe(() => seen.backdrop++);
  ref.keydownEvents().subscribe((event) => seen.keys.push(event.key));
  ref.beforeClosed().subscribe(() => seen.lifecycle.push('before'));
  ref.afterClosed().subscribe(() => seen.lifecycle.push('after'));
  return seen;
}

describe('disableClose', () => {
  it('blocks Escape and the backdrop while Close and ref.close still work; the input notifications still emit once', async () => {
    const user = userEvent.setup();
    const { host } = await setup();
    const ref = host.service.open(ServiceBody, { disableClose: true });
    const seen = watch(ref);
    const dialog = await dialogElement();

    await user.keyboard('{Escape}');
    pressBackdrop(dialog);
    await settle();
    expect(ref.getState()).toBe('open');
    expect(seen.keys).toEqual(['Escape']);
    expect(seen.backdrop).toBe(1);
    expect(seen.lifecycle).toEqual([]);
    expect(host.service.openDialogs).toContain(ref);

    await user.click(closeButton('Cancel'));
    await vi.waitFor(() => {
      expect(ref.getState()).toBe('closed');
    });
  });

  it('reads the value set on the ref while the dialog is open', async () => {
    const user = userEvent.setup();
    const { host } = await setup();
    const ref = host.service.open(ServicePlain, { disableClose: true });
    await dialogElement();
    ref.disableClose = false;
    await user.keyboard('{Escape}');
    await vi.waitFor(() => {
      expect(ref.getState()).toBe('closed');
    });
  });

  it('lets ref.close() close it', async () => {
    const { host } = await setup();
    const ref = host.service.open(ServicePlain, { disableClose: true });
    await dialogElement();
    ref.close();
    await vi.waitFor(() => {
      expect(ref.getState()).toBe('closed');
    });
  });
});

describe('closePredicate', () => {
  it('is called once per request with (result, config, componentInstance); false keeps the dialog open without a closing notification', async () => {
    const user = userEvent.setup();
    const { host } = await setup();
    const predicate = vi.fn(() => false);
    const config = new CckDialogConfig();
    config.closePredicate = predicate;
    const ref = host.service.open(ServiceBody, config);
    const seen = watch(ref);
    const dialog = await dialogElement();

    await user.keyboard('{Escape}');
    expect(predicate).toHaveBeenCalledTimes(1);
    expect(predicate).toHaveBeenLastCalledWith(
      undefined,
      expect.objectContaining({ role: 'dialog' }),
      ref.componentInstance,
    );

    pressBackdrop(dialog);
    expect(predicate).toHaveBeenCalledTimes(2);
    expect(seen.backdrop).toBe(1);

    await user.click(closeButton('Save'));
    expect(predicate).toHaveBeenCalledTimes(3);
    expect(predicate).toHaveBeenLastCalledWith('saved', expect.anything(), ref.componentInstance);

    await user.click(closeButton('Cancel'));
    expect(predicate).toHaveBeenCalledTimes(4);

    ref.close('direct');
    expect(predicate).toHaveBeenCalledTimes(5);
    expect(predicate).toHaveBeenLastCalledWith('direct', expect.anything(), ref.componentInstance);

    host.service.closeAll();
    expect(predicate).toHaveBeenCalledTimes(6);

    expect(ref.getState()).toBe('open');
    expect(seen.lifecycle).toEqual([]);
    expect(host.service.openDialogs).toContain(ref);
    expect(dialog.open).toBe(true);
  });

  it('is called once for a method=dialog close and shows the dialog again when it refuses', async () => {
    const { host } = await setup();
    const predicate = vi.fn(() => false);
    const config = new CckDialogConfig();
    config.closePredicate = predicate;
    const ref = host.service.open(ServicePlain, config);
    const dialog = await dialogElement();
    dialog.close();
    await settle();
    expect(predicate).toHaveBeenCalledTimes(1);
    expect(ref.getState()).toBe('open');
    expect(dialog.open).toBe(true);
  });

  it('lets a close through when it returns true', async () => {
    const { host } = await setup();
    const config = new CckDialogConfig();
    config.closePredicate = () => true;
    const ref = host.service.open(ServicePlain, config);
    await dialogElement();
    ref.close();
    await vi.waitFor(() => {
      expect(ref.getState()).toBe('closed');
    });
  });
});

describe('keydownEvents', () => {
  it('does not emit a keydown from a dialog opened above', async () => {
    const user = userEvent.setup();
    const { host } = await setup();
    const outer = host.service.open(ServiceBody);
    await dialogElement();
    const seen = watch(outer);
    const inner = host.service.open(ServiceBody, { id: 'inner' });
    await vi.waitFor(() => {
      expect(document.querySelectorAll('dialog[open]')).toHaveLength(2);
    });
    await user.keyboard('a');
    expect(seen.keys).toEqual([]);
    inner.close();
    await vi.waitFor(() => {
      expect(inner.getState()).toBe('closed');
    });
    await user.keyboard('b');
    expect(seen.keys).toEqual(['b']);
  });
});
