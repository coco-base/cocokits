import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { radioAnatomy } from '@cocokits/machines/radio';
import { describe, expect, it } from 'vitest';
import { CckRadioImports } from '../../index';
import { CckRadioHarness } from '../index';

@Component({
  imports: [CckRadioImports],
  template: `
    <div cckRadio name="plan" submitValue="free" [(checked)]="free" required>Free</div>
    <div cckRadio name="plan" submitValue="pro" [(checked)]="pro">Pro</div>
    <div cckRadio name="plan" submitValue="team" disabled>Team</div>
    <div cckRadio name="other" submitValue="x">Other</div>
  `,
})
class Host {
  readonly free = signal(true);
  readonly pro = signal(false);
}

async function setup() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  return { fixture, loader: TestbedHarnessEnvironment.loader(fixture) };
}

describe('CckRadioHarness', () => {
  it('uses the root class as its host selector', () => {
    expect(CckRadioHarness.hostSelector).toBe(`.${radioAnatomy.classes.root}`);
  });

  it('finds radios by label, name and checked state', async () => {
    const { loader } = await setup();
    expect(await loader.getAllHarnesses(CckRadioHarness)).toHaveLength(4);
    expect(await loader.getAllHarnesses(CckRadioHarness.with({ name: 'plan' }))).toHaveLength(3);
    expect(await loader.getAllHarnesses(CckRadioHarness.with({ label: /^P/ }))).toHaveLength(1);
    expect(await loader.getAllHarnesses(CckRadioHarness.with({ checked: true }))).toHaveLength(1);
    expect(await loader.getAllHarnesses(CckRadioHarness.with({ name: /^o/, checked: false }))).toHaveLength(1);
  });

  it('reads the state of a radio', async () => {
    const { loader } = await setup();
    const [free, pro, team] = await loader.getAllHarnesses(CckRadioHarness.with({ name: 'plan' }));
    expect(await free.getLabelText()).toBe('Free');
    expect(await free.getName()).toBe('plan');
    expect(await free.getValue()).toBe('free');
    expect(await free.getId()).toBeTruthy();
    expect(await free.isChecked()).toBe(true);
    expect(await free.isRequired()).toBe(true);
    expect(await pro.isRequired()).toBe(false);
    expect(await team.isDisabled()).toBe(true);
    expect(await pro.isDisabled()).toBe(false);
  });

  it('checks a radio, which unchecks its mate', async () => {
    const { loader, fixture } = await setup();
    const [free, pro] = await loader.getAllHarnesses(CckRadioHarness.with({ name: 'plan' }));
    await pro.check();
    await pro.check();
    await fixture.whenStable();
    expect(await pro.isChecked()).toBe(true);
    expect(await free.isChecked()).toBe(false);
    expect(fixture.componentInstance.pro()).toBe(true);
  });

  it('focuses and blurs a radio', async () => {
    const { loader } = await setup();
    const [free] = await loader.getAllHarnesses(CckRadioHarness);
    await free.focus();
    expect(await free.isFocused()).toBe(true);
    await free.blur();
    expect(await free.isFocused()).toBe(false);
  });
});
