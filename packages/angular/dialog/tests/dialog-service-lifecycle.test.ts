import { ApplicationRef, inputBinding, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import userEvent from '@testing-library/user-event';
import { firstValueFrom, toArray, type Observable } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CCK_DIALOG_DATA, CckDialogRef, type CckDialogState } from '../index';
import { stubOverlayApis } from './overlay-stubs';
import { ServiceBody, ServicePlain, dialogElement, must, setup, settle } from './service-fixtures';

beforeEach(stubOverlayApis);
afterEach(() => {
  vi.restoreAllMocks();
  document.documentElement.removeAttribute('style');
  document.body.innerHTML = '';
});

describe('CckDialog.open: a component', () => {
  it('gives the component its data and ref; a close runs beforeClosed then afterClosed once and completes', async () => {
    const { host } = await setup();
    const ref = host.service.open<ServiceBody, string, string>(ServiceBody, { data: 'payload' });
    expect(ref.componentInstance.data).toBe('payload');
    expect(ref.componentInstance.ref).toBe(ref);
    expect(ref.componentRef).not.toBeNull();
    expect(ref.getState()).toBe('open');

    const events: string[] = [];
    const states: CckDialogState[] = [];
    ref.beforeClosed().subscribe({
      next: (value) => {
        events.push(`before:${String(value)}`);
        states.push(ref.getState());
      },
      complete: () => events.push('before:complete'),
    });
    ref.afterClosed().subscribe({
      next: (value) => {
        events.push(`after:${String(value)}`);
        states.push(ref.getState());
      },
      complete: () => events.push('after:complete'),
    });
    await dialogElement();
    ref.close('x');
    await settle();
    await settle();
    await vi.waitFor(() => {
      expect(events).toContain('after:complete');
    });
    expect(events).toEqual(['before:x', 'before:complete', 'after:x', 'after:complete']);
    expect(states).toEqual(['closing', 'closed']);
    expect(ref.componentInstance).toBeNull();
    expect(document.querySelector('dialog')).toBeNull();
  });

  it('follows a signal bound with inputBinding', async () => {
    const { host } = await setup();
    const label = signal('One');
    host.service.open(ServiceBody, { bindings: [inputBinding('label', label)] });
    const dialog = await dialogElement();
    expect(dialog.querySelector('h2')?.textContent).toBe('One');
    label.set('Two');
    await TestBed.inject(ApplicationRef).whenStable();
    expect(dialog.querySelector('h2')?.textContent).toBe('Two');
  });

  it('gives the value of a Close, and undefined for Escape, a bare Close and a method=dialog form', async () => {
    const user = userEvent.setup();
    const { host } = await setup();
    const results: unknown[] = [];
    for (const press of [
      () => user.click(must(document.querySelector<HTMLElement>('button[class*="close"]:nth-of-type(2)'))),
      () => user.keyboard('{Escape}'),
      () => user.click(must(document.querySelector<HTMLElement>('button[class*="close"]'))),
    ]) {
      const ref = host.service.open(ServiceBody);
      const closed = firstValueFrom(ref.afterClosed());
      await dialogElement();
      await press();
      results.push(await closed);
      await vi.waitFor(() => {
        expect(document.querySelector('dialog')).toBeNull();
      });
      must(document.getElementById('opener')).focus();
    }
    expect(results).toEqual(['saved', undefined, undefined]);
  });

  it('gives undefined for a method=dialog form', async () => {
    const { host } = await setup();
    const ref = host.service.open(ServiceBody);
    const closed = firstValueFrom(ref.afterClosed());
    const dialog = await dialogElement();
    dialog.close();
    await expect(closed).resolves.toBeUndefined();
  });

  it('puts the result of ref.close in the stream; only the first close counts', async () => {
    const { host } = await setup();
    const ref = host.service.open<ServiceBody, unknown, number>(ServiceBody);
    const closed = firstValueFrom(ref.afterClosed().pipe(toArray()));
    await dialogElement();
    ref.close(1);
    ref.close(2);
    expect(ref.getState()).toBe('closing');
    await expect(closed).resolves.toEqual([1]);
  });
});

describe('CckDialog.open: a template', () => {
  it('renders it with the data as $implicit and the ref as dialogRef; both component fields are null', async () => {
    const { host } = await setup();
    const ref = host.service.open(host.template(), { data: 'from data' });
    const dialog = await dialogElement();
    expect(dialog.querySelector('#tpl-data')?.textContent).toBe('from data');
    expect(ref.componentRef).toBeNull();
    expect(ref.componentInstance).toBeNull();
  });
});

describe('CckDialog.open: when afterOpened emits', () => {
  it('is never synchronous, then emits once after the dialog is shown, completes, and replays to a late subscriber', async () => {
    const { host } = await setup();
    const ref = host.service.open(ServicePlain);
    let count = 0;
    ref.afterOpened().subscribe(() => count++);
    expect(count).toBe(0);
    await dialogElement();
    await vi.waitFor(() => {
      expect(count).toBe(1);
    });
    let late = 0;
    let lateDone = false;
    ref.afterOpened().subscribe({ next: () => late++, complete: () => (lateDone = true) });
    expect([late, lateDone]).toEqual([1, true]);
  });

  it('waits for the running CSS enter animation of the dialog', async () => {
    let finish: () => void = () => undefined;
    const finished = new Promise<void>((resolve) => {
      finish = resolve;
    });
    const getAnimations = vi.fn(() => [
      {
        animationName: 'enter',
        playState: 'running',
        effect: { getComputedTiming: () => ({ endTime: 200 }) },
        finished,
      },
    ]);
    HTMLDialogElement.prototype.getAnimations =
      getAnimations as unknown as typeof HTMLDialogElement.prototype.getAnimations;
    const { host } = await setup();
    const ref = host.service.open(ServicePlain);
    let opened = false;
    ref.afterOpened().subscribe(() => (opened = true));
    await dialogElement();
    await settle();
    await settle();
    expect(opened).toBe(false);
    finish();
    await vi.waitFor(() => {
      expect(opened).toBe(true);
    });
    Reflect.deleteProperty(HTMLDialogElement.prototype, 'getAnimations');
  });
});

describe('CckDialog.open: late subscribers', () => {
  it('replays beforeClosed during and after a close, and gives afterClosed, backdropClick and keydownEvents only the completion', async () => {
    const { host } = await setup();
    const ref = host.service.open<ServicePlain, unknown, string>(ServicePlain);
    await dialogElement();
    ref.close('r');
    const during: string[] = [];
    ref.beforeClosed().subscribe({ next: (v) => during.push(`n:${String(v)}`), complete: () => during.push('c') });
    expect(during).toEqual(['n:r', 'c']);
    await vi.waitFor(() => {
      expect(ref.getState()).toBe('closed');
    });
    const after: string[] = [];
    ref.beforeClosed().subscribe({ next: (v) => after.push(`n:${String(v)}`), complete: () => after.push('c') });
    const streams: Observable<unknown>[] = [ref.afterClosed(), ref.backdropClick(), ref.keydownEvents()];
    for (const stream of streams) {
      stream.subscribe({ next: () => after.push('unexpected'), complete: () => after.push('done') });
    }
    expect(after).toEqual(['n:r', 'c', 'done', 'done', 'done']);
  });

  it('gives a subscriber right after open() the emission of afterOpened', async () => {
    const { host } = await setup();
    const ref = host.service.open(ServicePlain);
    const emitted = firstValueFrom(ref.afterOpened(), { defaultValue: 'none' as unknown as undefined });
    await expect(emitted).resolves.toBeUndefined();
  });
});

describe('CckDialog.open: ids', () => {
  it('uses the config id as the id of the dialog and the ref', async () => {
    const { host } = await setup();
    const ref = host.service.open(ServicePlain, { id: 'my-dialog' });
    const dialog = await dialogElement();
    expect(ref.id).toBe('my-dialog');
    expect(dialog.id).toBe('my-dialog');
  });

  it('injects the data token in the component', async () => {
    const { host } = await setup();
    const ref = host.service.open(ServicePlain, { data: 7 });
    expect(ref.componentInstance.data).toBe(7);
    expect(CCK_DIALOG_DATA).toBeDefined();
    expect(CckDialogRef).toBeDefined();
  });
});
