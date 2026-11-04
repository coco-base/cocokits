import { ApplicationRef, Component, Injector, ViewContainerRef, inject, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { render } from '@testing-library/angular';
import { axe } from 'vitest-axe';
import { CckDir, CckDirection, CckOverlayLayer } from '@cocokits/angular-core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CCK_DIALOG_DATA, CckDialog, CckDialogImports, CckDialogRef } from '../index';
import { stubOverlayApis } from './overlay-stubs';
import { dialogElement, must, setup, settle } from './service-fixtures';

/** A body whose Title and Description can come and go. */
@Component({
  selector: 'toggle-body',
  imports: [CckDialogImports],
  template: `
    @if (title()) {
      <h2 cckDialogTitle [id]="titleId()">Title</h2>
    }
    @if (description()) {
      <p cckDialogDescription>Description</p>
    }
  `,
})
class ToggleBody {
  readonly title = signal(true);
  readonly description = signal(true);
  readonly titleId = signal<string | undefined>(undefined);
}

@Component({
  selector: 'direction-body',
  template: `<span id="dir">{{ direction.dir() }}</span>`,
})
class DirectionBody {
  readonly direction = inject(CckDirection);
}

@Component({
  selector: 'rtl-host',
  imports: [CckDir],
  template: `<div cckDir dir="rtl" id="rtl-zone"><ng-container #slot /></div>`,
})
class RtlHost {
  readonly service = inject(CckDialog);
  readonly slot = viewChild.required('slot', { read: ViewContainerRef });
}

beforeEach(stubOverlayApis);
afterEach(() => {
  vi.restoreAllMocks();
  document.documentElement.removeAttribute('style');
  document.body.innerHTML = '';
});

describe('attributes of the service dialog', () => {
  it('writes the id, and role, aria-modal and aria-label only when set', async () => {
    const { host } = await setup();
    const ref = host.service.open(ToggleBody);
    const dialog = await dialogElement();
    expect(dialog.id).toBe(ref.id);
    expect(dialog.hasAttribute('role')).toBe(false);
    expect(dialog.hasAttribute('aria-modal')).toBe(false);
    expect(dialog.hasAttribute('aria-label')).toBe(false);
    host.service.closeAll();
    await vi.waitFor(() => {
      expect(document.querySelector('dialog')).toBeNull();
    });

    host.service.open(ToggleBody, { role: 'alertdialog', ariaModal: true, ariaLabel: 'Named' });
    const second = await dialogElement();
    expect(second.getAttribute('role')).toBe('alertdialog');
    expect(second.getAttribute('aria-modal')).toBe('true');
    expect(second.getAttribute('aria-label')).toBe('Named');
    expect(second.hasAttribute('aria-labelledby')).toBe(false);
  });

  it('merges the configured labelledby ids with the Title id, without duplicates, as the Title comes and goes', async () => {
    const { host } = await setup();
    const ref = host.service.open(ToggleBody, { ariaLabelledBy: 'outside other' });
    const dialog = await dialogElement();
    const body = ref.componentInstance;
    const titleId = (): string => must(dialog.querySelector('h2')).id;
    expect(dialog.getAttribute('aria-labelledby')).toBe(`outside other ${titleId()}`);
    body.titleId.set('outside');
    await settle();
    await settle();
    expect(dialog.getAttribute('aria-labelledby')).toBe('outside other');
    body.title.set(false);
    await settle();
    await settle();
    expect(dialog.getAttribute('aria-labelledby')).toBe('outside other');
  });

  it('merges the configured describedby ids with the Description id, as it comes and goes', async () => {
    const { host } = await setup();
    const ref = host.service.open(ToggleBody, { ariaDescribedBy: 'hint' });
    const dialog = await dialogElement();
    const description = must(dialog.querySelector('p'));
    expect(dialog.getAttribute('aria-describedby')).toBe(`hint ${description.id}`);
    ref.componentInstance.description.set(false);
    await settle();
    await settle();
    expect(dialog.getAttribute('aria-describedby')).toBe('hint');
  });

  it('has no axe violations for a named dialog, and warns for an unnamed one only', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { host } = await setup();
    host.service.open(DirectionBody, { ariaLabel: 'Direction' });
    await dialogElement();
    await settle();
    expect((await axe(document.body)).violations).toEqual([]);
    expect(warn).not.toHaveBeenCalled();
    host.service.closeAll();
    await vi.waitFor(() => {
      expect(document.querySelector('dialog')).toBeNull();
    });
    host.service.open(DirectionBody, { ariaLabelledBy: 'somewhere' });
    await dialogElement();
    await settle();
    expect(warn).not.toHaveBeenCalled();
    host.service.closeAll();
    await vi.waitFor(() => {
      expect(document.querySelector('dialog')).toBeNull();
    });
    host.service.open(DirectionBody);
    await dialogElement();
    await settle();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('no accessible name'));
  });
});

describe('the Title id input', () => {
  it('sets the Title id and the content aria-labelledby follows it', async () => {
    const { host } = await setup();
    const ref = host.service.open(ToggleBody);
    const dialog = await dialogElement();
    ref.componentInstance.titleId.set('my-title');
    await settle();
    await settle();
    expect(dialog.querySelector('h2')?.id).toBe('my-title');
    expect(dialog.getAttribute('aria-labelledby')).toBe('my-title');
  });
});

describe('the injector and the direction', () => {
  it('gives the component the direction above the view container, and config.direction wins', async () => {
    const { fixture } = await render(RtlHost);
    const service = fixture.componentInstance.service;
    const inRtl = service.open(DirectionBody, { viewContainerRef: fixture.componentInstance.slot(), ariaLabel: 'a' });
    const dialog = await dialogElement();
    expect(inRtl.componentInstance.direction.dir()).toBe('rtl');
    expect(dialog.closest('[popover]')?.getAttribute('dir')).toBe('rtl');
    inRtl.close();
    await vi.waitFor(() => {
      expect(inRtl.getState()).toBe('closed');
    });
    const forced = service.open(DirectionBody, {
      viewContainerRef: fixture.componentInstance.slot(),
      direction: 'ltr',
      ariaLabel: 'b',
    });
    const second = await dialogElement();
    expect(forced.componentInstance.direction.dir()).toBe('ltr');
    expect(second.closest('[popover]')?.getAttribute('dir')).toBe('ltr');
  });

  it('cannot have CckDialogRef, the data or the layer replaced by the injector in the config', async () => {
    const { host } = await setup();
    const fake = {};
    const injector = Injector.create({
      providers: [
        { provide: CckDialogRef, useValue: fake },
        { provide: CCK_DIALOG_DATA, useValue: 'wrong' },
        { provide: CckOverlayLayer, useValue: fake },
      ],
    });
    const ref = host.service.open(DirectionBody, { injector, data: 'right', ariaLabel: 'x' });
    const component = ref.componentRef;
    const seen = component?.injector;
    expect(seen?.get(CckDialogRef)).toBe(ref);
    expect(seen?.get(CCK_DIALOG_DATA)).toBe('right');
    expect(seen?.get(CckOverlayLayer)).not.toBe(fake);
    await dialogElement();
  });
});

describe('viewContainerRef', () => {
  it('adds no element at the container, and leaves the application view count unchanged', async () => {
    const { fixture } = await render(RtlHost);
    const host = fixture.nativeElement as HTMLElement;
    const before = host.innerHTML;
    const appRef = TestBed.inject(ApplicationRef);
    const count = appRef.viewCount;
    fixture.componentInstance.service.open(DirectionBody, {
      viewContainerRef: fixture.componentInstance.slot(),
      ariaLabel: 'a',
    });
    await dialogElement();
    expect(host.innerHTML).toBe(before);
    expect(appRef.viewCount).toBe(count);
  });
});
