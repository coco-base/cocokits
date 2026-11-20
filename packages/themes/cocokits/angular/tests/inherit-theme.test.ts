import { signal, type Signal, type WritableSignal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { render, screen } from '@testing-library/angular';
import { provideCckTheme } from '@cocokits/angular-core';
import { CckFormField } from '@cocokits/angular/form-field';
import { CckInput } from '@cocokits/angular/input';
import { cocokitsThemeConfig, optionParents } from '@cocokits/theme-cocokits';
import { describe, expect, it } from 'vitest';
import { CckChipListTheme, CckFormFieldTheme } from '../src/index';
import { attrOf, imports, rows, values, type Row, type Value } from './inherit-cases';
import { providers } from './helpers';

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

  it.each(['sm', 'md', 'lg'])(
    'keeps the chips a populated Chip list renders at the default chip size, whatever the list size: %s (C14)',
    async (size) => {
      const { container } = await render(
        `<cck-form-field size="lg"><cck-chip-list aria-label="Tags" [value]="['a', 'b']" size="${size}" /></cck-form-field>`,
        { imports, providers },
      );
      expect(container.querySelector('.cck-chip-list')?.getAttribute('data-size')).toBe(size);
      const chips = [...container.querySelectorAll('.cck-chip')];
      expect(chips).toHaveLength(2);
      expect(chips.map((chip) => chip.getAttribute('data-size'))).toEqual(['md', 'md']);
    },
  );

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
