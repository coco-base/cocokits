import { Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { dialogAnatomy } from '@cocokits/machines/dialog';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckDialog, CckDialogImports } from '../../index';
import { stubOverlayApis } from '../../tests/overlay-stubs';
import { CckDialogHarness } from '../index';

@Component({
  imports: [CckDialogImports],
  template: `
    <ng-container cckDialog>
      <button cckDialogTrigger>Open declarative</button>
      <ng-template cckDialogPortal>
        <dialog cckDialogContent>
          <h2 cckDialogTitle>Delete project</h2>
          <p cckDialogDescription>This cannot be undone.</p>
          <button cckDialogClose>Cancel</button>
        </dialog>
      </ng-template>
    </ng-container>
    <button id="service" (click)="open()">Open service</button>
  `,
})
class Host {
  private readonly service = inject(CckDialog);

  open(): void {
    this.service.open(ServiceContent, { ariaLabel: 'Service dialog', role: 'alertdialog' });
  }
}

@Component({ imports: [CckDialogImports], template: `<p>{{ body }}</p>` })
class ServiceContent {
  protected readonly body = 'Service body';
}

async function setup() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  return {
    fixture,
    root: TestbedHarnessEnvironment.documentRootLoader(fixture),
    click: async (selector: string): Promise<void> => {
      const button = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(selector);
      if (!button) throw new Error(`No element matches ${selector}.`);
      button.click();
      await fixture.whenStable();
    },
  };
}

describe('CckDialogHarness', () => {
  beforeEach(stubOverlayApis);
  afterEach(() => {
    vi.restoreAllMocks();
    document.documentElement.removeAttribute('style');
  });

  it('uses the content class as its host selector', () => {
    expect(CckDialogHarness.hostSelector).toBe(`.${dialogAnatomy.classes.content}`);
  });

  it('finds no dialog while closed and reads the declarative dialog once open', async () => {
    const { root, click } = await setup();
    expect(await root.getAllHarnesses(CckDialogHarness)).toEqual([]);
    await click('button[cckDialogTrigger]');
    const dialog = await root.getHarness(CckDialogHarness);
    expect(await dialog.getRole()).toBe('dialog');
    expect(await dialog.getTitleText()).toBe('Delete project');
    expect(await dialog.getDescriptionText()).toBe('This cannot be undone.');
    expect(await dialog.getText()).toContain('Delete project');
    expect(await dialog.getAriaLabelledby()).toBeTruthy();
    expect(await dialog.getAriaDescribedby()).toMatch(/-description$/);
    expect(await dialog.getAriaLabel()).toBeNull();
    expect(await dialog.getId()).toBeTruthy();
  });

  it('reads the dialog of the service and has no title or description for it', async () => {
    const { root, click } = await setup();
    await click('#service');
    const dialog = await root.getHarness(CckDialogHarness);
    expect(await dialog.getRole()).toBe('alertdialog');
    expect(await dialog.getAriaLabel()).toBe('Service dialog');
    expect(await dialog.getText()).toBe('Service body');
    expect(await dialog.getTitleText()).toBeNull();
    expect(await dialog.getDescriptionText()).toBeNull();
  });

  it('closes the dialog with Escape', async () => {
    const { root, click, fixture } = await setup();
    await click('button[cckDialogTrigger]');
    const dialog = await root.getHarness(CckDialogHarness);
    await dialog.close();
    await fixture.whenStable();
    expect(await root.getAllHarnesses(CckDialogHarness)).toEqual([]);
  });
});
