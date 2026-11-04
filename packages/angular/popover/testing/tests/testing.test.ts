import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { popoverAnatomy } from '@cocokits/machines/popover';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckPopoverImports } from '../../index';
import { stubOverlayApis } from '../../tests/overlay-stubs';
import { CckPopoverHarness } from '../index';

@Component({
  imports: [CckPopoverImports],
  template: `
    <ng-container cckPopover>
      <button cckPopoverTrigger>Share</button>
      <ng-template cckPopoverPortal>
        <div cckPopoverContent>
          <h2 cckPopoverTitle>Share this page</h2>
          <p cckPopoverDescription>Anyone with the link can read it.</p>
          <button cckPopoverClose>Done</button>
        </div>
      </ng-template>
    </ng-container>
    <ng-container cckPopover>
      <button cckPopoverTrigger disabled>{{ invite }}</button>
      <ng-template cckPopoverPortal>
        <div cckPopoverContent aria-label="Invite">Invite someone</div>
      </ng-template>
    </ng-container>
  `,
})
class Host {
  protected readonly invite = 'Invite';
}

async function setup() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  return { fixture, loader: TestbedHarnessEnvironment.loader(fixture) };
}

describe('CckPopoverHarness', () => {
  beforeEach(stubOverlayApis);
  afterEach(() => {
    vi.restoreAllMocks();
    document.documentElement.removeAttribute('style');
  });

  it('uses the trigger class as its host selector', () => {
    expect(CckPopoverHarness.hostSelector).toBe(`.${popoverAnatomy.classes.trigger}`);
  });

  it('finds popovers and filters by the trigger text', async () => {
    const { loader } = await setup();
    expect(await loader.getAllHarnesses(CckPopoverHarness)).toHaveLength(2);
    const share = await loader.getHarness(CckPopoverHarness.with({ triggerText: 'Share' }));
    expect(await share.getTriggerText()).toBe('Share');
    const invite = await loader.getHarness(CckPopoverHarness.with({ triggerText: /^Inv/ }));
    expect(await invite.getTriggerText()).toBe('Invite');
    expect(await loader.getAllHarnesses(CckPopoverHarness.with({ triggerText: 'Nope' }))).toEqual([]);
  });

  it('reads the disabled state', async () => {
    const { loader } = await setup();
    expect(await (await loader.getHarness(CckPopoverHarness.with({ triggerText: 'Share' }))).isDisabled()).toBe(false);
    expect(await (await loader.getHarness(CckPopoverHarness.with({ triggerText: 'Invite' }))).isDisabled()).toBe(true);
  });

  it('opens, reads the portaled content and closes with Escape', async () => {
    const { loader, fixture } = await setup();
    const popover = await loader.getHarness(CckPopoverHarness.with({ triggerText: 'Share' }));
    expect(await popover.isOpen()).toBe(false);
    expect(await popover.getTitleText()).toBeNull();
    await popover.open();
    await fixture.whenStable();
    expect(await popover.isOpen()).toBe(true);
    expect(await popover.getTitleText()).toBe('Share this page');
    expect(await popover.getDescriptionText()).toBe('Anyone with the link can read it.');
    await popover.open();
    expect(await popover.isOpen()).toBe(true);
    await popover.close();
    await fixture.whenStable();
    expect(await popover.isOpen()).toBe(false);
    expect(await popover.getTitleText()).toBeNull();
  });

  it('finds harnesses inside the open content', async () => {
    const { loader, fixture } = await setup();
    const popover = await loader.getHarness(CckPopoverHarness.with({ triggerText: 'Share' }));
    await expect(popover.getAllHarnesses(CckPopoverHarness)).rejects.toThrow(/closed popover/);
    await popover.open();
    await fixture.whenStable();
    expect(await popover.getAllHarnesses(CckPopoverHarness)).toEqual([]);
  });

  it('focuses and blurs the trigger', async () => {
    const { loader } = await setup();
    const popover = await loader.getHarness(CckPopoverHarness.with({ triggerText: 'Share' }));
    await popover.focus();
    expect(await popover.isFocused()).toBe(true);
    await popover.blur();
    expect(await popover.isFocused()).toBe(false);
  });
});
