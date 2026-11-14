import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { accordionAnatomy } from '@cocokits/machines/accordion';
import { describe, expect, it } from 'vitest';
import { CckAccordionImports } from '../../index';
import { CckAccordionHarness, CckAccordionItemHarness } from '../index';

@Component({
  imports: [CckAccordionImports],
  template: `
    <cck-accordion>
      <cck-accordion-item label="Shipping">Ships in two days</cck-accordion-item>
      <cck-accordion-item label="Returns" [expanded]="true">Return within 30 days</cck-accordion-item>
      <cck-accordion-item [label]="locked" disabled>Locked body</cck-accordion-item>
    </cck-accordion>
    <cck-accordion multi>
      <cck-accordion-item label="One">First</cck-accordion-item>
      <cck-accordion-item label="Two">Second</cck-accordion-item>
    </cck-accordion>
  `,
})
class Host {
  protected readonly locked = 'Locked';
}

async function setup() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const loader = TestbedHarnessEnvironment.loader(fixture);
  const [single, multi] = await loader.getAllHarnesses(CckAccordionHarness);
  return { single, multi };
}

describe('CckAccordionHarness', () => {
  it('uses the anatomy classes as its host selectors', () => {
    expect(CckAccordionHarness.hostSelector).toBe(`.${accordionAnatomy.classes.root}`);
    expect(CckAccordionItemHarness.hostSelector).toBe(`.${accordionAnatomy.classes.item}`);
  });

  it('reads whether several items can be open', async () => {
    const { single, multi } = await setup();
    expect(await single.isMulti()).toBe(false);
    expect(await multi.isMulti()).toBe(true);
  });

  it('reads the items', async () => {
    const { single } = await setup();
    const items = await single.getItems();
    expect(await Promise.all(items.map((item) => item.getLabel()))).toEqual(['Shipping', 'Returns', 'Locked']);
    expect(await Promise.all(items.map((item) => item.isExpanded()))).toEqual([false, true, false]);
    expect(await Promise.all(items.map((item) => item.isDisabled()))).toEqual([false, false, true]);
    expect(await items[0]?.getTextContent()).toBe('Ships in two days');
    expect(await items[1]?.getTextContent()).toBe('Return within 30 days');
  });

  it('filters the items', async () => {
    const { single } = await setup();
    expect(await single.getItems({ label: /^Ret/ })).toHaveLength(1);
    expect(await single.getItems({ content: 'Return within 30 days' })).toHaveLength(1);
    expect(await single.getItems({ expanded: true })).toHaveLength(1);
    expect(await single.getItems({ disabled: true })).toHaveLength(1);
    expect(await single.getItems({ expanded: false, disabled: false })).toHaveLength(1);
  });

  it('expands and collapses an item, one open at a time without multi', async () => {
    const { single } = await setup();
    const [shipping, returns] = await single.getItems();
    await shipping.expand();
    await shipping.expand();
    expect(await shipping.isExpanded()).toBe(true);
    expect(await shipping.getTextContent()).toBe('Ships in two days');
    expect(await returns.isExpanded()).toBe(false);
    await shipping.toggle();
    expect(await shipping.isExpanded()).toBe(false);
  });

  it('keeps several items open with multi, and collapses them', async () => {
    const { multi } = await setup();
    const [one, two] = await multi.getItems();
    await one.expand();
    await two.expand();
    expect(await one.isExpanded()).toBe(true);
    expect(await two.isExpanded()).toBe(true);
    await one.collapse();
    await one.collapse();
    expect(await one.isExpanded()).toBe(false);
    expect(await two.isExpanded()).toBe(true);
  });

  it('focuses and blurs the trigger of an item', async () => {
    const { single } = await setup();
    const [shipping] = await single.getItems();
    await shipping.focus();
    expect(await shipping.isFocused()).toBe(true);
    await shipping.blur();
    expect(await shipping.isFocused()).toBe(false);
  });
});
