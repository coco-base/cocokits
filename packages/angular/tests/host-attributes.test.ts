import { render } from '@testing-library/angular';
import { CckBadgeImports } from '@cocokits/angular/badge';
import { CckBadgeContainerImports } from '@cocokits/angular/badge-container';
import { CckButtonImports } from '@cocokits/angular/button';
import { CckCheckboxImports } from '@cocokits/angular/checkbox';
import { CckChipImports } from '@cocokits/angular/chip';
import { CckChipListImports } from '@cocokits/angular/chip-list';
import { CckDividerImports } from '@cocokits/angular/divider';
import { CckFieldErrorImports } from '@cocokits/angular/field-error';
import { CckFormFieldImports } from '@cocokits/angular/form-field';
import { CckRadioImports } from '@cocokits/angular/radio';
import { CckRadioGroupImports } from '@cocokits/angular/radio-group';
import { CckSelectImports } from '@cocokits/angular/select';
import { CckSvgIconImports } from '@cocokits/angular/svg-icon';
import { CckSwitchImports } from '@cocokits/angular/switch';
import { CckTabsImports } from '@cocokits/angular/tabs';
import { CckTagImports } from '@cocokits/angular/tag';
import { CckTextareaImports } from '@cocokits/angular/textarea';
import { describe, expect, it, vi } from 'vitest';

/**
 * No Angular host keeps an input of the component as an attribute: a static attribute on a tag makes an input and
 * is also written to the element, unless the host nulls it. Each row is one host with the attributes the author
 * writes on it that are not native attributes of that element.
 */
const rows = [
  {
    host: 'cck-badge',
    imports: CckBadgeImports,
    markup: '<cck-badge content="3" max="9" hide></cck-badge>',
    check: ['content', 'max', 'hide'],
  },
  {
    host: 'cck-badge-container',
    imports: CckBadgeContainerImports,
    markup: '<cck-badge-container position="top-end">x</cck-badge-container>',
    check: ['position'],
  },
  {
    host: 'a',
    imports: CckButtonImports,
    markup: '<a cckButton href="#go" disabled>Go</a>',
    check: ['disabled'],
  },
  {
    host: 'cck-checkbox',
    imports: CckCheckboxImports,
    markup:
      '<cck-checkbox aria-label="x" checked submitValue="a" indeterminate disabled readonly required invalid pending touched dirty submitted></cck-checkbox>',
    check: [
      'checked',
      'submitvalue',
      'indeterminate',
      'disabled',
      'readonly',
      'required',
      'invalid',
      'pending',
      'touched',
      'dirty',
      'submitted',
    ],
  },
  {
    host: 'cck-switch',
    imports: CckSwitchImports,
    markup:
      '<cck-switch aria-label="x" checked submitValue="a" disabled readonly required invalid pending touched dirty submitted></cck-switch>',
    check: [
      'checked',
      'submitvalue',
      'disabled',
      'readonly',
      'required',
      'invalid',
      'pending',
      'touched',
      'dirty',
      'submitted',
    ],
  },
  {
    host: 'cck-radio',
    imports: CckRadioImports,
    markup: '<cck-radio aria-label="x" checked submitValue="a" disabled required></cck-radio>',
    check: ['checked', 'submitvalue', 'disabled', 'required'],
  },
  {
    host: 'cck-radio-group',
    imports: [...CckRadioGroupImports, ...CckRadioImports],
    markup:
      '<cck-radio-group aria-label="x" value="a" disabled required touched orientation="vertical" loop name="n" form="f"><cck-radio submitValue="a">a</cck-radio></cck-radio-group>',
    check: ['value', 'disabled', 'required', 'touched', 'orientation', 'loop', 'name', 'form'],
  },
  {
    host: 'cck-chip',
    imports: CckChipImports,
    markup: '<cck-chip removable disabled selected removeLabel="x">x</cck-chip>',
    check: ['removable', 'disabled', 'selected', 'removelabel'],
  },
  {
    host: 'cck-chip-list',
    imports: CckChipListImports,
    markup:
      '<cck-chip-list aria-label="x" name="n" form="f" disabled readonly required addOnBlur placeholder="p" invalid />',
    check: ['name', 'form', 'disabled', 'readonly', 'required', 'addonblur', 'placeholder', 'invalid'],
  },
  {
    host: 'hr',
    imports: CckDividerImports,
    markup: '<hr cckDivider orientation="vertical" decorative />',
    check: ['orientation', 'decorative'],
  },
  {
    host: 'cck-field-error',
    imports: CckFieldErrorImports,
    markup: '<cck-field-error force>x</cck-field-error>',
    check: ['force'],
  },
  {
    host: 'cck-form-field',
    imports: CckFormFieldImports,
    markup: '<cck-form-field disabled readonly required invalid hideRequiredMarker></cck-form-field>',
    check: ['disabled', 'readonly', 'required', 'invalid', 'hiderequiredmarker'],
  },
  {
    host: 'cck-svg-icon',
    imports: CckSvgIconImports,
    markup: '<cck-svg-icon iconName="x" label="x" />',
    check: ['iconname', 'label'],
  },
  {
    host: 'cck-tabs',
    imports: CckTabsImports,
    markup:
      '<cck-tabs aria-label="x" selectedIndex="0" orientation="horizontal" activationMode="manual" preserveContent><cck-tab label="a" disabled>a</cck-tab></cck-tabs>',
    check: ['selectedindex', 'orientation', 'activationmode', 'preservecontent'],
  },
  {
    host: 'cck-tab',
    imports: CckTabsImports,
    markup: '<cck-tabs aria-label="x"><cck-tab label="a" disabled>a</cck-tab></cck-tabs>',
    check: ['label', 'disabled'],
  },
  {
    host: 'cck-tag',
    imports: CckTagImports,
    markup: '<cck-tag role="status">Saved</cck-tag>',
    check: [],
  },
  {
    host: 'textarea',
    imports: CckTextareaImports,
    markup: '<textarea cckTextarea aria-label="x" value="v"></textarea>',
    check: ['value'],
  },
  {
    host: 'cck-select',
    imports: CckSelectImports,
    markup:
      '<cck-select aria-label="x" value="a" multiple placeholder="p" filter side="bottom" align="start" disabled readonly required name="n" form="f"></cck-select>',
    check: [
      'value',
      'multiple',
      'placeholder',
      'filter',
      'side',
      'align',
      'disabled',
      'readonly',
      'required',
      'name',
      'form',
    ],
  },
];

describe('Angular host attributes', () => {
  it.each(rows)('$host keeps no input as an attribute', async ({ host, imports, markup, check }) => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await render(markup, { imports: [...imports] });
    const element = document.querySelector(host);
    expect(element, host).not.toBeNull();
    expect(
      check.filter((name) => element?.hasAttribute(name) === true),
      host,
    ).toEqual([]);
  });
});
