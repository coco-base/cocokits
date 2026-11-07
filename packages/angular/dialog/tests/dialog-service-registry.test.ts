import { Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Location } from '@angular/common';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/angular';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CCK_DIALOG_DEFAULT_OPTIONS, CckDialog, CckDialogConfig } from '../index';
import { stubOverlayApis } from './overlay-stubs';
import { ServicePlain, dialogElement, setup, settle } from './service-fixtures';

beforeEach(stubOverlayApis);
afterEach(() => {
  vi.restoreAllMocks();
  document.documentElement.removeAttribute('style');
  document.body.innerHTML = '';
});

const closed = (ref: { getState(): string }): Promise<void> =>
  vi.waitFor(() => {
    expect(ref.getState()).toBe('closed');
  });

/** A history traversal: TestBed gives the app a mock platform location, which delivers `popstate` itself. */
function popBack(): void {
  const location = TestBed.inject(Location);
  location.go('/was-here');
  location.go('/now-here');
  location.back();
}

describe('registry', () => {
  it('emits afterOpened synchronously, follows open and finish in openDialogs, and gets by id', async () => {
    const { host } = await setup();
    const service = host.service;
    const seen: unknown[] = [];
    service.afterOpened.subscribe((ref) => seen.push(ref));
    const a = service.open(ServicePlain, { id: 'a' });
    const b = service.open(ServicePlain, { id: 'b' });
    expect(seen).toEqual([a, b]);
    expect(service.openDialogs).toEqual([a, b]);
    expect(service.getDialogById('b')).toBe(b);
    b.close();
    await closed(b);
    expect(service.openDialogs).toEqual([a]);
    expect(service.getDialogById('b')).toBeUndefined();
  });

  it('emits afterAllClosed after the last one finishes and at once when nothing is open', async () => {
    const { host } = await setup();
    const service = host.service;
    const emissions: number[] = [];
    service.afterAllClosed.subscribe(() => emissions.push(service.openDialogs.length));
    expect(emissions).toEqual([0]);
    const a = service.open(ServicePlain);
    const b = service.open(ServicePlain);
    a.close();
    await closed(a);
    expect(emissions).toEqual([0]);
    b.close();
    await closed(b);
    expect(emissions).toEqual([0, 0]);
  });

  it('closes from the last opened, and leaves a dialog open whose predicate refuses', async () => {
    const { host } = await setup();
    const order: string[] = [];
    const refusing = new CckDialogConfig();
    refusing.id = 'stays';
    refusing.closePredicate = () => false;
    const stays = host.service.open(ServicePlain, refusing);
    const a = host.service.open(ServicePlain, { id: 'a' });
    const b = host.service.open(ServicePlain, { id: 'b' });
    for (const ref of [stays, a, b]) ref.beforeClosed().subscribe(() => order.push(ref.id));
    host.service.closeAll();
    await closed(a);
    await closed(b);
    expect(order).toEqual(['b', 'a']);
    expect(host.service.openDialogs).toEqual([stays]);
    expect(stays.getState()).toBe('open');
  });

  it('throws in development when a dialog with the same id is open', async () => {
    const { host } = await setup();
    host.service.open(ServicePlain, { id: 'same' });
    expect(() => host.service.open(ServicePlain, { id: 'same' })).toThrow(
      'CocoKits: a dialog with id "same" is already open.',
    );
  });
});

@Component({ selector: 'level-host', providers: [CckDialog], template: '' })
class LevelHost {
  readonly service = inject(CckDialog);
}

describe('a CckDialog in component providers', () => {
  it('shares the registry with its parent and closes only its own dialogs when destroyed', async () => {
    const { fixture } = await render(LevelHost);
    const root = TestBed.inject(CckDialog);
    const level = fixture.componentInstance.service;
    expect(level).not.toBe(root);
    const own = level.open(ServicePlain, { id: 'own' });
    const other = root.open(ServicePlain, { id: 'other' });
    expect(root.openDialogs).toEqual([own, other]);
    expect(level.openDialogs).toEqual([own, other]);
    fixture.destroy();
    await closed(own);
    expect(root.openDialogs).toEqual([other]);
    expect(other.getState()).toBe('open');
  });
});

describe('navigation', () => {
  const popstate = (): void => {
    popBack();
  };

  it('closes on a popstate even with disableClose and a refusing predicate, and never calls the predicate', async () => {
    const { host } = await setup();
    const predicate = vi.fn(() => false);
    const config = new CckDialogConfig();
    config.disableClose = true;
    config.closePredicate = predicate;
    const ref = host.service.open(ServicePlain, config);
    await dialogElement();
    popstate();
    await closed(ref);
    expect(predicate).not.toHaveBeenCalled();
  });

  it('keeps the dialog when closeOnNavigation is false', async () => {
    const { host } = await setup();
    const ref = host.service.open(ServicePlain, { closeOnNavigation: false });
    await dialogElement();
    popstate();
    await settle();
    expect(ref.getState()).toBe('open');
  });

  it("closes on a Location change with 'url-change', but not with 'pop-state'", async () => {
    const { host } = await setup();
    const location = TestBed.inject(Location);
    const urlChange = host.service.open(ServicePlain, { id: 'u', closeOnNavigation: 'url-change' });
    const popState = host.service.open(ServicePlain, { id: 'p', closeOnNavigation: 'pop-state' });
    await dialogElement();
    location.go('/somewhere');
    await closed(urlChange);
    expect(popState.getState()).toBe('open');
    popBack();
    await closed(popState);
  });
});

describe('CCK_DIALOG_DEFAULT_OPTIONS', () => {
  async function withDefaults(options: Partial<CckDialogConfig>): Promise<{ service: CckDialog; opener: HTMLElement }> {
    TestBed.configureTestingModule({
      providers: [{ provide: CCK_DIALOG_DEFAULT_OPTIONS, useValue: options }],
    });
    const { host, opener } = await setup();
    return { service: host.service, opener };
  }

  it('replaces the built-in defaults: Escape is refused, focus is not restored, and a popstate still closes', async () => {
    const user = userEvent.setup();
    const { service, opener } = await withDefaults({ disableClose: true });
    const ref = service.open(ServicePlain);
    await dialogElement();
    await user.keyboard('{Escape}');
    await settle();
    expect(ref.getState()).toBe('open');
    popBack();
    await closed(ref);
    await settle();
    expect(document.activeElement).not.toBe(opener);
  });

  it('acts as no navigation close when closeOnNavigation is present with undefined', async () => {
    const { service } = await withDefaults({ disableClose: true, closeOnNavigation: undefined });
    const ref = service.open(ServicePlain);
    await dialogElement();
    popBack();
    await settle();
    expect(ref.getState()).toBe('open');
  });

  it('keeps the built-ins when the value spreads a new config, and restores focus', async () => {
    const user = userEvent.setup();
    const { service, opener } = await withDefaults(Object.assign(new CckDialogConfig(), { disableClose: true }));
    const ref = service.open(ServicePlain, { disableClose: false });
    await dialogElement();
    await user.keyboard('{Escape}');
    await closed(ref);
    await vi.waitFor(() => {
      expect(document.activeElement).toBe(opener);
    });
  });
});
