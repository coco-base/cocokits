import { Component, signal } from '@angular/core';
import { render } from '@testing-library/angular';
import { provideCckTheme } from '@cocokits/angular-core';
import { CckCheckbox } from '@cocokits/angular/checkbox';
import { CckRadio } from '@cocokits/angular/radio';
import { CckSwitch } from '@cocokits/angular/switch';
import { defineAnatomy } from '@cocokits/shared';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { describe, expect, it } from 'vitest';
import {
  CckCheckboxTheme,
  CckRadioTheme,
  CckSwitchTheme,
  type CckCheckboxColor,
  type CckCheckboxLabelPosition,
  type CckCheckboxSize,
} from '../src/index';
import { providers } from './helpers';

@Component({
  imports: [CckCheckbox, CckCheckboxTheme, CckSwitch, CckSwitchTheme, CckRadio, CckRadioTheme],
  template: `
    <cck-checkbox id="checkbox" [size]="size()" [color]="color()" [labelPosition]="labelPosition()"
      >Accept</cck-checkbox
    >
    <cck-switch id="switch" [size]="size()" [color]="color()" [labelPosition]="labelPosition()">Alerts</cck-switch>
    <cck-radio id="radio" name="plan" [size]="size()" [color]="color()" [labelPosition]="labelPosition()">A</cck-radio>
  `,
})
class Host {
  readonly size = signal<CckCheckboxSize | null | undefined>(undefined);
  readonly color = signal<CckCheckboxColor | null | undefined>(undefined);
  readonly labelPosition = signal<CckCheckboxLabelPosition | null | undefined>(undefined);
}

@Component({
  imports: [CckCheckbox, CckCheckboxTheme, CckSwitch, CckSwitchTheme, CckRadio, CckRadioTheme],
  template: `
    <cck-checkbox size="sm" [checked]="on" [disabled]="on">Accept</cck-checkbox>
    <cck-switch size="sm" [checked]="on" [disabled]="on">Alerts</cck-switch>
    <cck-radio name="plan" size="sm" [checked]="on" [disabled]="on">A</cck-radio>
  `,
})
class Fixed {
  protected readonly on = true;
}

const themed = { providers };
const IDS = ['checkbox', 'switch', 'radio'] as const;
/** The classes come from an anatomy of the same block; a theme layer may not import a machine. */
const rootClass = (id: string): string =>
  defineAnatomy({ block: id, parts: { root: { name: 'Root', description: 'The root.' } } }).classes.root;
const root = (container: Element, id: string): Element => {
  const element = container.querySelector(`.${rootClass(id)}`);
  if (!element) throw new Error(`no .${rootClass(id)}`);
  return element;
};

describe.each(IDS)('theme directive on the %s', (id) => {
  const options = cocokitsThemeConfig.components[id];

  it('renders the config defaults on the host root', async () => {
    const { container } = await render(Host, themed);
    expect(root(container, id).classList.contains(`cck-${id}`)).toBe(true);
    expect(root(container, id).getAttribute('data-size')).toBe('md');
    expect(root(container, id).getAttribute('data-cck-color')).toBe('brand');
    expect(root(container, id).getAttribute('data-label-position')).toBe('after');
  });

  it.each([
    ['size', 'data-size'],
    ['color', 'data-cck-color'],
    ['labelPosition', 'data-label-position'],
  ] as const)('the %s input renders %s for every value', async (option, attrName) => {
    const { container, fixture } = await render(Host, themed);
    for (const value of options[option].values) {
      (fixture.componentInstance[option] as { set(v: string): void }).set(value);
      await fixture.whenStable();
      expect(root(container, id).getAttribute(attrName)).toBe(value);
    }
  });

  it('renders the options on the root only', async () => {
    const { container } = await render(Host, themed);
    expect(root(container, id).querySelector('[data-size]')).toBeNull();
  });

  it('removes an attribute with null and restores the default with undefined', async () => {
    const { container, fixture } = await render(Host, themed);
    fixture.componentInstance.labelPosition.set(null);
    await fixture.whenStable();
    expect(root(container, id).hasAttribute('data-label-position')).toBe(false);
    fixture.componentInstance.labelPosition.set(undefined);
    await fixture.whenStable();
    expect(root(container, id).getAttribute('data-label-position')).toBe('after');
  });

  it('lets a provider override win over the config default', async () => {
    const { container } = await render(Host, {
      providers: [provideCckTheme(cocokitsThemeConfig, { [id]: { size: 'lg', labelPosition: 'before' } })],
    });
    expect(root(container, id).getAttribute('data-size')).toBe('lg');
    expect(root(container, id).getAttribute('data-label-position')).toBe('before');
  });

  it('removes every attribute with null', async () => {
    const { container, fixture } = await render(Host, themed);
    fixture.componentInstance.size.set(null);
    fixture.componentInstance.color.set(null);
    fixture.componentInstance.labelPosition.set(null);
    await fixture.whenStable();
    for (const name of ['data-size', 'data-cck-color', 'data-label-position']) {
      expect(root(container, id).hasAttribute(name)).toBe(false);
    }
  });

  it('lets the own input win over a provider override', async () => {
    const { container } = await render(Fixed, {
      providers: [provideCckTheme(cocokitsThemeConfig, { [id]: { size: 'lg', labelPosition: 'before' } })],
    });
    expect(root(container, id).getAttribute('data-size')).toBe('sm');
    expect(root(container, id).getAttribute('data-label-position')).toBe('before');
  });

  it('keeps the base behaviour under the theme: facts, a disabled input and the label text', async () => {
    const { container } = await render(Fixed, themed);
    const element = root(container, id);
    expect(element.hasAttribute('data-checked')).toBe(true);
    expect(element.hasAttribute('data-disabled')).toBe(true);
    expect(element.querySelector(`.${rootClass(id)}__input`)?.hasAttribute('disabled')).toBe(true);
    expect(element.querySelector(`.${rootClass(id)}__label`)?.textContent.trim()).not.toBe('');
  });

  it('renders no theme data-* without a theme provider', async () => {
    const { container } = await render(Host);
    for (const name of ['data-size', 'data-cck-color', 'data-label-position']) {
      expect(root(container, id).hasAttribute(name)).toBe(false);
    }
  });
});
