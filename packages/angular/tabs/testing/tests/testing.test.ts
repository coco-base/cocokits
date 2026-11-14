import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { tabsAnatomy } from '@cocokits/machines/tabs';
import { describe, expect, it } from 'vitest';
import { CckTabsImports } from '../../index';
import { CckTabHarness, CckTabsHarness } from '../index';

@Component({
  imports: [CckTabsImports],
  template: `
    <cck-tabs aria-label="Account" [selectedIndex]="1">
      <cck-tab label="Account">Account body</cck-tab>
      <cck-tab label="Password">
        <ng-template cckTabContent>Password body <b class="bold">strong</b></ng-template>
      </cck-tab>
      <cck-tab [label]="locked" aria-label="Locked tab" disabled>Locked body</cck-tab>
    </cck-tabs>
    <cck-tabs aria-label="Kept">
      <cck-tab label="First">First body</cck-tab>
      <cck-tab label="Second">Second body</cck-tab>
    </cck-tabs>
  `,
})
class Host {
  protected readonly locked = 'Locked';
}

async function setup() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const loader = TestbedHarnessEnvironment.loader(fixture);
  return { fixture, loader };
}

describe('CckTabsHarness', () => {
  it('uses the anatomy classes as its host selectors', () => {
    expect(CckTabsHarness.hostSelector).toBe(`.${tabsAnatomy.classes.root}`);
    expect(CckTabHarness.hostSelector).toBe(`.${tabsAnatomy.classes.trigger}`);
  });

  it('finds the tabs and filters by the selected tab label', async () => {
    const { loader } = await setup();
    expect(await loader.getAllHarnesses(CckTabsHarness)).toHaveLength(2);
    const account = await loader.getHarness(CckTabsHarness.with({ selectedTabLabel: 'Password' }));
    expect(await (await account.getSelectedTab()).getLabel()).toBe('Password');
    expect(await loader.getAllHarnesses(CckTabsHarness.with({ selectedTabLabel: /^First/ }))).toHaveLength(1);
    expect(await loader.getAllHarnesses(CckTabsHarness.with({ selectedTabLabel: 'Nope' }))).toEqual([]);
  });

  it('reads the tabs', async () => {
    const { loader } = await setup();
    const tabs = await loader.getHarness(CckTabsHarness.with({ selectedTabLabel: 'Password' }));
    const all = await tabs.getTabs();
    expect(all).toHaveLength(3);
    expect(await Promise.all(all.map((tab) => tab.getLabel()))).toEqual(['Account', 'Password', 'Locked']);
    expect(await Promise.all(all.map((tab) => tab.isSelected()))).toEqual([false, true, false]);
    expect(await Promise.all(all.map((tab) => tab.isDisabled()))).toEqual([false, false, true]);
    expect(await all[2]?.getAriaLabel()).toBe('Locked tab');
    expect(await all[1]?.getAriaLabelledby()).toBeNull();
    expect(await tabs.getTabs({ label: /^Pass/ })).toHaveLength(1);
    expect(await tabs.getTabs({ selected: true })).toHaveLength(1);
  });

  it('selects a tab and reads its panel', async () => {
    const { loader, fixture } = await setup();
    const tabs = await loader.getHarness(CckTabsHarness.with({ selectedTabLabel: 'Password' }));
    const password = await tabs.getSelectedTab();
    expect(await password.getTextContent()).toBe('Password body strong');
    expect(await password.getHarnessOrNull(CckTabHarness)).toBeNull();
    await tabs.selectTab({ label: 'Account' });
    await fixture.whenStable();
    expect(await (await tabs.getSelectedTab()).getLabel()).toBe('Account');
    expect(await (await tabs.getSelectedTab()).getTextContent()).toBe('Account body');
    await expect(tabs.selectTab({ label: 'Nope' })).rejects.toThrow(/Cannot find a tab/);
  });
});
