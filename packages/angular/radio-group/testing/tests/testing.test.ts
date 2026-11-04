import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { CckRadioImports } from '@cocokits/angular/radio';
import { CckRadioHarness } from '@cocokits/angular/radio/testing';
import { radioGroupAnatomy } from '@cocokits/machines/radio-group';
import { describe, expect, it } from 'vitest';
import { CckRadioGroupImports } from '../../index';
import { CckRadioGroupHarness } from '../index';

@Component({
  imports: [CckRadioGroupImports, CckRadioImports],
  template: `
    <div cckRadioGroup aria-label="Plan" [(value)]="plan">
      <div cckRadio submitValue="free">Free</div>
      <div cckRadio submitValue="pro">Pro</div>
      <div cckRadio submitValue="team">Team</div>
    </div>
    <div cckRadioGroup aria-label="Empty" id="empty-group"></div>
  `,
})
class Host {
  readonly plan = signal<string | null>('pro');
}

async function setup() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const loader = TestbedHarnessEnvironment.loader(fixture);
  const [plan, empty] = await loader.getAllHarnesses(CckRadioGroupHarness);
  return { fixture, loader, plan, empty };
}

describe('CckRadioGroupHarness', () => {
  it('uses the root class as its host selector', () => {
    expect(CckRadioGroupHarness.hostSelector).toBe(`.${radioGroupAnatomy.classes.root}`);
  });

  it('reads the group', async () => {
    const { plan, empty, loader } = await setup();
    expect(await plan.getName()).toBeTruthy();
    expect(await empty.getName()).toBeNull();
    expect(await empty.getId()).toBe('empty-group');
    expect(await plan.getRadios()).toHaveLength(3);
    expect(await plan.getRadios({ label: 'Team' })).toHaveLength(1);
    expect(await plan.getCheckedValue()).toBe('pro');
    expect(await (await plan.getCheckedRadio())?.getLabelText()).toBe('Pro');
    expect(await empty.getCheckedRadio()).toBeNull();
    expect(await empty.getCheckedValue()).toBeNull();
    const name = await plan.getName();
    expect(await loader.getAllHarnesses(CckRadioGroupHarness.with({ name: name ?? '' }))).toHaveLength(1);
    expect(await loader.getAllHarnesses(CckRadioGroupHarness.with({ name: 'nope' }))).toEqual([]);
  });

  it('checks a radio of the group', async () => {
    const { plan, fixture } = await setup();
    await plan.checkRadio({ label: 'Team' });
    await fixture.whenStable();
    expect(fixture.componentInstance.plan()).toBe('team');
    expect(await plan.getCheckedValue()).toBe('team');
    const radios = await plan.getRadios({ checked: false });
    expect(radios).toHaveLength(2);
    expect(radios[0]).toBeInstanceOf(CckRadioHarness);
    await expect(plan.checkRadio({ label: 'Nope' })).rejects.toThrow(/Cannot find a radio/);
  });
});
