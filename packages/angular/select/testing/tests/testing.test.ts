import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { selectAnatomy } from '@cocokits/machines/select';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckSelectImports } from '../../index';
import { stubOverlayApis } from '../../tests/overlay-stubs';
import { CckSelectHarness, CckSelectOptionGroupHarness, CckSelectOptionHarness } from '../index';

@Component({
  imports: [CckSelectImports],
  template: `
    <cck-select aria-label="Dish" placeholder="Choose a dish" [(value)]="dish" required>
      <cck-select-option value="Cake">Cake</cck-select-option>
      <cck-select-option value="Pizza" disabled>Pizza</cck-select-option>
      <cck-select-option value="Burger">Burger</cck-select-option>
    </cck-select>
    <cck-select aria-label="Toppings" [multiple]="true" [(value)]="toppings">
      <cck-select-option-group label="Veg">
        <cck-select-option value="Onion">Onion</cck-select-option>
        <cck-select-option value="Olive">Olive</cck-select-option>
      </cck-select-option-group>
      <cck-select-option-group label="Meat" disabled>
        <cck-select-option value="Ham">Ham</cck-select-option>
      </cck-select-option-group>
    </cck-select>
    <cck-select aria-label="Off" disabled>
      <cck-select-option value="x">X</cck-select-option>
    </cck-select>
  `,
})
class Host {
  readonly dish = signal<string | null>(null);
  readonly toppings = signal<readonly string[]>([]);
}

async function setup() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const loader = TestbedHarnessEnvironment.loader(fixture);
  const [dish, toppings, off] = await loader.getAllHarnesses(CckSelectHarness);
  return { fixture, loader, dish, toppings, off };
}

describe('CckSelectHarness', () => {
  beforeEach(stubOverlayApis);
  afterEach(() => {
    vi.restoreAllMocks();
    document.documentElement.removeAttribute('style');
  });

  it('uses the anatomy classes as its host selectors', () => {
    const { classes } = selectAnatomy;
    expect(CckSelectHarness.hostSelector).toBe(`.${classes.root}`);
    expect(CckSelectOptionHarness.hostSelector).toBe(`.${classes.option}`);
    expect(CckSelectOptionGroupHarness.hostSelector).toBe(`.${classes.optionGroup}`);
  });

  it('reads the state of the select', async () => {
    const { dish, toppings, off, loader } = await setup();
    expect(await dish.isDisabled()).toBe(false);
    expect(await off.isDisabled()).toBe(true);
    expect(await dish.isRequired()).toBe(true);
    expect(await toppings.isRequired()).toBe(false);
    expect(await dish.isValid()).toBe(true);
    expect(await dish.isEmpty()).toBe(true);
    expect(await dish.isMultiple()).toBe(false);
    expect(await toppings.isMultiple()).toBe(true);
    expect(await dish.getValueText()).toBe('Choose a dish');
    expect(await loader.getAllHarnesses(CckSelectHarness.with({ disabled: true }))).toHaveLength(1);
    expect(await loader.getAllHarnesses(CckSelectHarness.with({ disabled: false }))).toHaveLength(2);
  });

  it('focuses and blurs the trigger', async () => {
    const { dish } = await setup();
    await dish.focus();
    expect(await dish.isFocused()).toBe(true);
    await dish.blur();
    expect(await dish.isFocused()).toBe(false);
  });

  it('opens and closes the list', async () => {
    const { dish, fixture } = await setup();
    expect(await dish.getOptions()).toEqual([]);
    await dish.open();
    await fixture.whenStable();
    expect(await dish.isOpen()).toBe(true);
    await dish.close();
    await fixture.whenStable();
    expect(await dish.isOpen()).toBe(false);
  });

  it('finds options by text and reads their state', async () => {
    const { dish } = await setup();
    await dish.open();
    expect(await dish.getOptions()).toHaveLength(3);
    const [pizza] = await dish.getOptions({ text: /^Pi/ });
    expect(await pizza.getText()).toBe('Pizza');
    expect(await pizza.isDisabled()).toBe(true);
    expect(await pizza.isSelected()).toBe(false);
    expect(await pizza.isMultiple()).toBe(false);
    const active = await dish.getOptions({}).then((options) => Promise.all(options.map((option) => option.isActive())));
    expect(active.filter(Boolean)).toHaveLength(1);
  });

  it('clicks an option, which selects it and closes a single select', async () => {
    const { dish, fixture } = await setup();
    await dish.clickOptions({ text: 'Burger' });
    await fixture.whenStable();
    expect(fixture.componentInstance.dish()).toBe('Burger');
    expect(await dish.getValueText()).toBe('Burger');
    expect(await dish.isEmpty()).toBe(false);
    expect(await dish.isOpen()).toBe(false);
    await dish.open();
    expect(await dish.getOptions({ isSelected: true })).toHaveLength(1);
    await dish.close();
  });

  it('clicks several options of a multiple select and finds its groups', async () => {
    const { toppings, fixture } = await setup();
    await toppings.clickOptions({ text: /^O/ });
    await fixture.whenStable();
    expect(fixture.componentInstance.toppings()).toEqual(['Onion', 'Olive']);
    expect(await toppings.isOpen()).toBe(true);
    const groups = await toppings.getOptionGroups();
    expect(groups).toHaveLength(2);
    const veg = (await toppings.getOptionGroups({ labelText: 'Veg' }))[0];
    expect(await veg.getLabelText()).toBe('Veg');
    expect(await veg.isDisabled()).toBe(false);
    const options = await veg.getOptions();
    expect(options).toHaveLength(2);
    expect(await options[0].isMultiple()).toBe(true);
    expect(await options[0].isSelected()).toBe(true);
    const meat = (await toppings.getOptionGroups({ labelText: /Meat/ }))[0];
    expect(await meat.isDisabled()).toBe(true);
    await expect(toppings.clickOptions({ text: 'Nothing' })).rejects.toThrow(/no option/);
  });
});
