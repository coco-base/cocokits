// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/vue';
import { defineComponent, h, type PropType, type VNode } from 'vue';
import { afterEach, describe, expect, it } from 'vitest';
import { provideThemeOptions, ThemeProvider } from '@cocokits/vue-core';
import { cocokitsThemeConfig, optionParents } from '@cocokits/theme-cocokits';
import {
  AvatarFallback,
  AvatarGroup,
  AvatarLabel,
  AvatarRoot,
  ChipList,
  FormField,
  Input,
  Radio,
  RadioGroup,
  SelectContent,
  SelectItem,
  SelectItemText,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '../src/index';

afterEach(cleanup);

type Value = string | null | undefined;
type Wrap = (inner: VNode) => VNode;

interface Row {
  readonly child: string;
  readonly option: string;
  readonly parent: string;
  /** The CSS class of the root of the child. */
  readonly root: string;
  readonly ui: (parent: Value, own: Value, wrap: Wrap) => VNode;
}

const select = (own: Value): VNode =>
  h(SelectRoot, { size: own } as never, () => [
    h(SelectTrigger, { 'aria-label': 'Dish' }, () => h(SelectValue, { placeholder: 'Pick' })),
    h(SelectContent, null, () => h(SelectItem, { value: 'a' }, () => h(SelectItemText, null, () => 'A'))),
  ]);
const avatar = (own: Value): VNode => h(AvatarRoot, { size: own } as never, () => h(AvatarFallback, null, () => 'AL'));
const radio =
  (option: string): Row['ui'] =>
  (parent, own, wrap) =>
    h(RadioGroup, { 'aria-label': 'Plan', [option]: parent } as never, () =>
      wrap(h(Radio, { value: 'a', [option]: own } as never, () => 'A')),
    );
const field = (parent: Value, child: VNode): VNode => h(FormField, { size: parent } as never, () => child);

/** One row per `optionParents` pair; the first test checks that no pair is missing. */
const rows: Row[] = [
  {
    child: 'select',
    option: 'size',
    parent: 'form-field',
    root: '.cck-select',
    ui: (parent, own, wrap) => field(parent, wrap(select(own))),
  },
  {
    child: 'input',
    option: 'size',
    parent: 'form-field',
    root: '.cck-input',
    ui: (parent, own, wrap) => field(parent, wrap(h(Input, { 'aria-label': 'Name', size: own } as never))),
  },
  {
    child: 'textarea',
    option: 'size',
    parent: 'form-field',
    root: '.cck-textarea',
    ui: (parent, own, wrap) => field(parent, wrap(h(Textarea, { 'aria-label': 'Notes', size: own } as never))),
  },
  {
    child: 'chip-list',
    option: 'size',
    parent: 'form-field',
    root: '.cck-chip-list',
    ui: (parent, own, wrap) => field(parent, wrap(h(ChipList, { 'aria-label': 'Tags', size: own } as never))),
  },
  {
    child: 'avatar',
    option: 'size',
    parent: 'avatar-label',
    root: '.cck-avatar',
    ui: (parent, own, wrap) => h(AvatarLabel, { name: 'Ada', size: parent } as never, () => wrap(avatar(own))),
  },
  {
    child: 'avatar',
    option: 'size',
    parent: 'avatar-group',
    root: '.cck-avatar',
    ui: (parent, own, wrap) => h(AvatarGroup, { size: parent } as never, () => wrap(avatar(own))),
  },
  { child: 'radio', option: 'size', parent: 'radio-group', root: '.cck-radio', ui: radio('size') },
  { child: 'radio', option: 'color', parent: 'radio-group', root: '.cck-radio', ui: radio('color') },
  { child: 'radio', option: 'labelPosition', parent: 'radio-group', root: '.cck-radio', ui: radio('labelPosition') },
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

const direct: Wrap = (inner) => inner;
/** A foreign theme wrapper between the parent and the child, as a Button theme would be. */
const Foreign = defineComponent({
  setup: (_props, { slots }) => {
    provideThemeOptions('button', () => ({ size: 'xl' }));
    return () => slots.default?.();
  },
});
const foreign: Wrap = (inner) => h(Foreign, null, () => inner);

/** A host with the parent's and the child's value as props, so a test can change them. */
const hostOf = (row: Row, wrap: Wrap, override?: string) =>
  defineComponent({
    props: {
      parent: { type: String as PropType<Value>, default: undefined },
      own: { type: String as PropType<Value>, default: undefined },
    },
    setup: (props) => () =>
      h(
        ThemeProvider,
        {
          themeConfig: cocokitsThemeConfig,
          overrides: override ? { [row.child]: { [row.option]: override } } : undefined,
        },
        () => row.ui(props.parent, props.own, wrap),
      ),
  });

function mount(row: Row, parent: Value, own: Value, override?: string, wrap: Wrap = direct) {
  const result = render(hostOf(row, wrap, override), { props: { parent, own } });
  const element = (): Element => {
    const found = result.container.querySelector(row.root);
    if (!found) throw new Error(`no ${row.root}`);
    return found;
  };
  return {
    attr: (): string | null => element().getAttribute(attrOf[row.option]),
    set: (props: { parent?: Value; own?: Value }) => result.rerender(props),
  };
}

const pairs = Object.entries(optionParents).flatMap(([child, options]) =>
  Object.entries(options).flatMap(([option, parents]) => parents.map((parent) => [child, option, parent] as const)),
);

describe('group inheritance in the Vue theme (D29, AC 12)', () => {
  it('has a row for every pair of optionParents, and only those', () => {
    expect(rows.map((row) => [row.child, row.option, row.parent])).toEqual(pairs.map((pair) => [...pair]));
  });

  describe.each(rows.map((row) => [`${row.child} ${row.option} from ${row.parent}`, row] as const))(
    '%s',
    (_name, row) => {
      const v = values[row.option];

      it('takes the value of the parent when it sets none of its own', () => {
        expect(mount(row, v.parent, undefined).attr()).toBe(v.parent);
      });

      it('keeps its own value over the parent', async () => {
        const view = mount(row, v.parent, v.own);
        expect(view.attr()).toBe(v.own);
        await view.set({ parent: v.override });
        expect(view.attr()).toBe(v.own);
      });

      it('follows the parent when it changes', async () => {
        const view = mount(row, v.parent, undefined);
        await view.set({ parent: v.override });
        expect(view.attr()).toBe(v.override);
      });

      it('takes the default when neither it nor the parent sets one', () => {
        expect(mount(row, undefined, undefined).attr()).toBe(v.fallback);
      });

      it('takes the ThemeProvider override when neither it nor the parent sets one', () => {
        expect(mount(row, undefined, undefined, v.override).attr()).toBe(v.override);
      });

      it('lets the parent value win over the override', () => {
        expect(mount(row, v.parent, undefined, v.override).attr()).toBe(v.parent);
      });

      it('removes the attribute with an own null, and takes the parent back with undefined', async () => {
        const view = mount(row, v.parent, null);
        expect(view.attr()).toBeNull();
        await view.set({ own: undefined });
        expect(view.attr()).toBe(v.parent);
      });

      it('removes the attribute when the parent is null and the child sets none', async () => {
        const view = mount(row, null, undefined);
        expect(view.attr()).toBeNull();
        await view.set({ parent: undefined });
        expect(view.attr()).toBe(v.fallback);
      });

      it('is not hidden by a foreign theme wrapper between them', () => {
        expect(mount(row, v.parent, undefined, undefined, foreign).attr()).toBe(v.parent);
      });
    },
  );

  it('takes the avatar size from the nearest listed parent: the label before the group', () => {
    const { container } = render({
      render: () =>
        h(ThemeProvider, { themeConfig: cocokitsThemeConfig }, () =>
          h(AvatarGroup, { size: 'sm' }, () => h(AvatarLabel, { name: 'Ada', size: 'xl' }, () => avatar(undefined))),
        ),
    });
    expect(container.querySelector('.cck-avatar')?.getAttribute('data-size')).toBe('xl');
  });

  it.each(['sm', 'md', 'lg'])(
    'keeps the chips a populated Chip list renders at the default chip size, whatever the list size: %s (C14)',
    (size) => {
      const { container } = render({
        render: () =>
          h(ThemeProvider, { themeConfig: cocokitsThemeConfig }, () =>
            field('lg', h(ChipList, { 'aria-label': 'Tags', defaultValue: ['a', 'b'], size } as never)),
          ),
      });
      expect(container.querySelector('.cck-chip-list')?.getAttribute('data-size')).toBe(size);
      const chips = [...container.querySelectorAll('.cck-chip')];
      expect(chips).toHaveLength(2);
      expect(chips.map((chip) => chip.getAttribute('data-size'))).toEqual(['md', 'md']);
    },
  );

  it('resolves the Form field size through the Chip list: its own, else the field size, else the default', () => {
    const { container } = render({
      render: () =>
        h(ThemeProvider, { themeConfig: cocokitsThemeConfig }, () => [
          field('lg', h(ChipList, { 'aria-label': 'Tags' })),
          field('lg', h(ChipList, { 'aria-label': 'Own', size: 'sm' })),
          h(ChipList, { 'aria-label': 'Alone' }),
        ]),
    });
    const sizes = [...container.querySelectorAll('.cck-chip-list')].map((list) => list.getAttribute('data-size'));
    expect(sizes).toEqual(['lg', 'sm', 'md']);
  });
});
