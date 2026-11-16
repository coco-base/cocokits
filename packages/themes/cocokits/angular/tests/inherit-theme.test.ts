import { signal, type Signal, type WritableSignal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { render, screen } from '@testing-library/angular';
import { provideCckTheme } from '@cocokits/angular-core';
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
import { cocokitsThemeConfig, optionParents } from '@cocokits/theme-cocokits';
import { describe, expect, it } from 'vitest';
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
import { providers } from './helpers';

const imports = [
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

type Value = string | null | undefined;
interface Row {
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
const rows: Row[] = [
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

const attrOf: Record<string, string> = {
  size: 'data-size',
  color: 'data-cck-color',
  labelPosition: 'data-label-position',
};
/** Values that tell the parent's, the child's and the override apart (the default is `md`, `brand`, `after`). */
const values: Record<string, { parent: string; own: string; override: string; fallback: string }> = {
  size: { parent: 'sm', own: 'lg', override: 'lg', fallback: 'md' },
  color: { parent: 'success', own: 'info', override: 'danger', fallback: 'brand' },
  labelPosition: { parent: 'before', own: 'after', override: 'before', fallback: 'after' },
};

interface Signals {
  parent: WritableSignal<Value>;
  own: WritableSignal<Value>;
}

async function mount(row: Row, initial: Partial<Record<keyof Signals, Value>>, override?: string, foreign = false) {
  const wrap = (inner: string): string =>
    foreign ? `<button cckButton type="button" size="xl">${inner}</button>` : inner;
  const sig: Signals = { parent: signal<Value>(initial.parent), own: signal<Value>(initial.own) };
  const overrides = override ? { [row.child]: { [row.option]: override } } : {};
  const result = await render(row.template(wrap), {
    imports,
    providers: [...providers.slice(1), provideCckTheme(cocokitsThemeConfig, overrides as never)],
    componentProperties: sig as unknown as Record<string, Signal<Value>>,
  });
  const attr = (): string | null => screen.getByTestId('child').getAttribute(attrOf[row.option]);
  const set = async (name: keyof Signals, value: Value): Promise<void> => {
    sig[name].set(value);
    await result.fixture.whenStable();
  };
  return { attr, set };
}

const pairs = Object.entries(optionParents).flatMap(([child, options]) =>
  Object.entries(options).flatMap(([option, parents]) => parents.map((parent) => [child, option, parent] as const)),
);

describe('group inheritance in the Angular theme (D29, AC 12)', () => {
  it('has a row for every pair of optionParents, and only those', () => {
    expect(rows.map((row) => [row.child, row.option, row.parent])).toEqual(pairs.map((pair) => [...pair]));
  });

  describe.each(rows.map((row) => [`${row.child} ${row.option} from ${row.parent}`, row] as const))(
    '%s',
    (_name, row) => {
      const v = values[row.option];

      it('takes the value of the parent when it sets none of its own', async () => {
        const { attr } = await mount(row, { parent: v.parent });
        expect(attr()).toBe(v.parent);
      });

      it('keeps its own value over the parent', async () => {
        const { attr, set } = await mount(row, { parent: v.parent, own: v.own });
        expect(attr()).toBe(v.own);
        await set('parent', v.override);
        expect(attr()).toBe(v.own);
      });

      it('follows the parent when it changes', async () => {
        const { attr, set } = await mount(row, { parent: v.parent });
        await set('parent', v.override);
        expect(attr()).toBe(v.override);
      });

      it('takes the default when neither it nor the parent sets one', async () => {
        expect((await mount(row, {})).attr()).toBe(v.fallback);
      });

      it('takes the ThemeProvider override when neither it nor the parent sets one', async () => {
        expect((await mount(row, {}, v.override)).attr()).toBe(v.override);
      });

      it('lets the parent value win over the override', async () => {
        const { attr } = await mount(row, { parent: v.parent }, v.override);
        expect(attr()).toBe(v.parent);
      });

      it('removes the attribute with an own null, and takes the parent back with undefined', async () => {
        const { attr, set } = await mount(row, { parent: v.parent, own: null });
        expect(attr()).toBeNull();
        await set('own', undefined);
        expect(attr()).toBe(v.parent);
      });

      it('removes the attribute when the parent is null and the child sets none', async () => {
        const { attr, set } = await mount(row, { parent: null });
        expect(attr()).toBeNull();
        await set('parent', undefined);
        expect(attr()).toBe(v.fallback);
      });

      it('is not hidden by a foreign theme wrapper between them', async () => {
        const { attr } = await mount(row, { parent: v.parent }, undefined, true);
        expect(attr()).toBe(v.parent);
      });
    },
  );

  it('chains the Form field size through the Chip list: the list resolves its own, else the field size', async () => {
    const { fixture } = await render(
      `<cck-form-field size="lg"><cck-chip-list aria-label="Tags" /></cck-form-field>
       <cck-form-field size="lg"><cck-chip-list aria-label="Own" size="sm" /></cck-form-field>
       <cck-chip-list aria-label="Alone" />`,
      { imports, providers },
    );
    const lists = fixture.debugElement.queryAll(By.directive(CckChipListTheme));
    expect(lists.map((list) => list.injector.get(CckChipListTheme)._size())).toEqual(['lg', 'sm', undefined]);
  });

  it('takes the avatar size from the nearest listed parent: the label before the group', async () => {
    await render(
      `<cck-avatar-group size="sm"><cck-avatar-label name="Ada" size="xl">
         <cck-avatar data-testid="child"><cck-avatar-fallback>AL</cck-avatar-fallback></cck-avatar>
       </cck-avatar-label></cck-avatar-group>`,
      { imports, providers },
    );
    expect(screen.getByTestId('child').getAttribute('data-size')).toBe('xl');
  });

  it('inherits nothing into a child that has no theme directive: it shows the config default', async () => {
    await render(
      `<cck-form-field size="lg"><input cckInput data-testid="child" aria-label="Name" /></cck-form-field>`,
      { imports: [CckFormField, CckFormFieldTheme, CckInput], providers },
    );
    expect(screen.getByTestId('child').getAttribute('data-size')).toBe('md');
  });
});
