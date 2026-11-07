import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { tooltipAnatomy } from '@cocokits/machines/tooltip';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckTooltipImports } from '../../index';
import { stubOverlayApis } from '../../tests/overlay-stubs';
import { CckTooltipHarness } from '../index';

@Component({
  imports: [CckTooltipImports],
  template: `
    <button cckTooltip="Copy the link" cckTooltipShowDelay="30" cckTooltipHideDelay="30">Copy</button>
    <ng-container cckTooltip cckTooltipShowDelay="0" cckTooltipHideDelay="0">
      <button cckTooltipTrigger>{{ info }}</button>
      <ng-template cckTooltipPortal>
        <div cckTooltipContent><strong>Rich</strong> help</div>
      </ng-template>
    </ng-container>
    <button cckTooltip="Never" cckTooltipDisabled>Off</button>
  `,
})
class Host {
  protected readonly info = 'Info';
}

async function setup() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  return { fixture, loader: TestbedHarnessEnvironment.loader(fixture) };
}

describe('CckTooltipHarness', () => {
  beforeEach(stubOverlayApis);
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('uses the trigger class as its host selector', () => {
    expect(CckTooltipHarness.hostSelector).toBe(`.${tooltipAnatomy.classes.trigger}`);
  });

  it('finds every tooltip trigger', async () => {
    const { loader } = await setup();
    expect(await loader.getAllHarnesses(CckTooltipHarness)).toHaveLength(3);
  });

  it('shows and hides the one-attribute form after its delays', async () => {
    const { loader } = await setup();
    const [copy] = await loader.getAllHarnesses(CckTooltipHarness);
    expect(await copy.isOpen()).toBe(false);
    expect(await copy.getTooltipText()).toBe('');
    await copy.show();
    expect(await copy.isOpen()).toBe(true);
    expect(await copy.getTooltipText()).toBe('Copy the link');
    await copy.hide();
    expect(await copy.isOpen()).toBe(false);
    expect(await copy.getTooltipText()).toBe('');
  });

  it('shows and hides the compound form with rich content', async () => {
    const { loader } = await setup();
    const info = (await loader.getAllHarnesses(CckTooltipHarness))[1];
    await info.show();
    expect(await info.getTooltipText()).toBe('Rich help');
    await info.hide();
    expect(await info.isOpen()).toBe(false);
  });

  it('fails to show a disabled tooltip', async () => {
    const { loader } = await setup();
    const off = (await loader.getAllHarnesses(CckTooltipHarness))[2];
    await expect(off.show()).rejects.toThrow(/did not show/);
  }, 10000);
});
