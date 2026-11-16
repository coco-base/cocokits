import { Component, signal, type Type } from '@angular/core';
import { CckAvatarImports } from '@cocokits/angular/avatar';
import { CckAvatarGroupImports } from '@cocokits/angular/avatar-group';
import { CckAvatarLabelImports } from '@cocokits/angular/avatar-label';
import { CckButton } from '@cocokits/angular/button';
import { CckChipListImports } from '@cocokits/angular/chip-list';
import { CckFormField } from '@cocokits/angular/form-field';
import { CckInput } from '@cocokits/angular/input';
import { CckRadioImports } from '@cocokits/angular/radio';
import { CckRadioGroupImports } from '@cocokits/angular/radio-group';
import { CckSelectImports } from '@cocokits/angular/select';
import { CckTextarea } from '@cocokits/angular/textarea';
import {
  CckAvatarGroupTheme,
  CckAvatarLabelTheme,
  CckAvatarTheme,
  CckButtonTheme,
  CckChipListTheme,
  CckFormFieldTheme,
  CckInputTheme,
  CckRadioGroupTheme,
  CckRadioTheme,
  CckSelectTheme,
  CckTextareaTheme,
} from '../src/index';

export const imports = [
  ...CckAvatarImports,
  ...CckAvatarGroupImports,
  ...CckAvatarLabelImports,
  ...CckChipListImports,
  ...CckRadioImports,
  ...CckRadioGroupImports,
  ...CckSelectImports,
  CckButton,
  CckButtonTheme,
  CckFormField,
  CckFormFieldTheme,
  CckInput,
  CckInputTheme,
  CckTextarea,
  CckTextareaTheme,
  CckAvatarTheme,
  CckAvatarGroupTheme,
  CckAvatarLabelTheme,
  CckChipListTheme,
  CckRadioTheme,
  CckRadioGroupTheme,
  CckSelectTheme,
];

export type Value = string | null | undefined;
export interface Row {
  readonly child: string;
  readonly option: string;
  readonly parent: string;
  /** The markup: `parent()` and `own()` are the signals of the parent's and the child's option; `[wrap]` is a wrapper. */
  readonly template: (wrap: (inner: string) => string) => string;
}

const fieldOf = (child: string, wrap: (inner: string) => string): string =>
  `<cck-form-field [size]="parent()">${wrap(child)}</cck-form-field>`;
const radioOf = (option: string) => (wrap: (inner: string) => string) =>
  `<cck-radio-group aria-label="Plan" [${option}]="parent()">${wrap(
    `<cck-radio data-testid="child" value="a" [${option}]="own()">A</cck-radio>`,
  )}</cck-radio-group>`;
const avatar =
  '<cck-avatar data-testid="child" [size]="own()"><cck-avatar-fallback>AL</cck-avatar-fallback></cck-avatar>';

/** One row per `optionParents` pair; the table below checks that no pair is missing. */
export const rows: Row[] = [
  {
    child: 'select',
    option: 'size',
    parent: 'form-field',
    template: (wrap) =>
      fieldOf(
        '<cck-select data-testid="child" aria-label="Dish" [size]="own()"><cck-select-option value="a">A</cck-select-option></cck-select>',
        wrap,
      ),
  },
  {
    child: 'input',
    option: 'size',
    parent: 'form-field',
    template: (wrap) => fieldOf('<input cckInput data-testid="child" aria-label="Name" [size]="own()" />', wrap),
  },
  {
    child: 'textarea',
    option: 'size',
    parent: 'form-field',
    template: (wrap) =>
      fieldOf('<textarea cckTextarea data-testid="child" aria-label="Notes" [size]="own()"></textarea>', wrap),
  },
  {
    child: 'chip-list',
    option: 'size',
    parent: 'form-field',
    template: (wrap) => fieldOf('<cck-chip-list data-testid="child" aria-label="Tags" [size]="own()" />', wrap),
  },
  {
    child: 'avatar',
    option: 'size',
    parent: 'avatar-label',
    template: (wrap) => `<cck-avatar-label name="Ada" [size]="parent()">${wrap(avatar)}</cck-avatar-label>`,
  },
  {
    child: 'avatar',
    option: 'size',
    parent: 'avatar-group',
    template: (wrap) => `<cck-avatar-group [size]="parent()">${wrap(avatar)}</cck-avatar-group>`,
  },
  { child: 'radio', option: 'size', parent: 'radio-group', template: radioOf('size') },
  { child: 'radio', option: 'color', parent: 'radio-group', template: radioOf('color') },
  { child: 'radio', option: 'labelPosition', parent: 'radio-group', template: radioOf('labelPosition') },
];

export const attrOf: Record<string, string> = {
  size: 'data-size',
  color: 'data-cck-color',
  labelPosition: 'data-label-position',
};
/** Values that tell the parent's, the child's and the override apart (the default is `md`, `brand`, `after`). */
export const values: Record<string, { parent: string; own: string; override: string; fallback: string }> = {
  size: { parent: 'sm', own: 'lg', override: 'lg', fallback: 'md' },
  color: { parent: 'success', own: 'info', override: 'danger', fallback: 'brand' },
  labelPosition: { parent: 'before', own: 'after', override: 'before', fallback: 'after' },
};

/** An `app-root` component that renders the row with the given option values of the parent and the child. */
export function rootOf(row: Row, parent: Value, own: Value): Type<unknown> {
  class Root {
    protected readonly parent = signal<Value>(parent);
    protected readonly own = signal<Value>(own);
  }
  Component({ selector: 'app-root', imports, template: row.template((inner) => inner) })(Root);
  return Root;
}

/** The value of the option's attribute on the child (`data-testid="child"`) in the markup; `null` when it is absent. */
export function attrIn(html: string, row: Row): string | null {
  const tag = /<[^>]*\sdata-testid="child"[^>]*>/.exec(html)?.[0];
  if (!tag) throw new Error('no child in the markup');
  return new RegExp(String.raw`\s${attrOf[row.option]}="([^"]*)"`).exec(tag)?.[1] ?? null;
}

/** Every `data-*` attribute in the markup, in order: the theme output, apart from what the base adds when it mounts. */
export const dataAttrsIn = (html: string): string[] => html.match(/\sdata-[\w-]+="[^"]*"/g) ?? [];
