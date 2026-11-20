// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { Input as BaseInput } from '@cocokits/react/input';
import { ThemeOptionsProvider, ThemeProvider } from '@cocokits/react-core';
import { cocokitsThemeConfig, optionParents } from '@cocokits/theme-cocokits';
import {
  Avatar,
  AvatarGroup,
  AvatarLabel,
  ChipList,
  FormField,
  Input,
  Radio,
  RadioGroup,
  Select,
  Textarea,
} from '../src/index';

afterEach(cleanup);

type Value = string | null | undefined;
type Wrap = (inner: ReactNode) => ReactElement;

interface Row {
  readonly child: string;
  readonly option: string;
  readonly parent: string;
  /** The CSS class of the root of the child. */
  readonly root: string;
  readonly ui: (parent: Value, own: Value, wrap: Wrap) => ReactElement;
}

// The props are typed per option; the tests set one value at a time and read the attribute it renders.
const loose = (value: Value): never => value as never;

const select = (own: Value): ReactElement => (
  <Select.Root size={loose(own)}>
    <Select.Trigger aria-label="Dish">
      <Select.Value placeholder="Pick" />
      <Select.Icon />
    </Select.Trigger>
    <Select.Content>
      <Select.Item value="a">
        <Select.ItemText>A</Select.ItemText>
      </Select.Item>
    </Select.Content>
  </Select.Root>
);
const avatar = (own: Value): ReactElement => (
  <Avatar.Root size={loose(own)}>
    <Avatar.Fallback>AL</Avatar.Fallback>
  </Avatar.Root>
);
const radio =
  (option: string): Row['ui'] =>
  (parent, own, wrap) => {
    const group = { [option]: loose(parent) };
    const child = { [option]: loose(own) };
    return (
      <RadioGroup aria-label="Plan" {...group}>
        {wrap(
          <Radio value="a" {...child}>
            A
          </Radio>,
        )}
      </RadioGroup>
    );
  };

/** One row per `optionParents` pair; the first test checks that no pair is missing. */
const rows: Row[] = [
  {
    child: 'select',
    option: 'size',
    parent: 'form-field',
    root: '.cck-select',
    ui: (parent, own, wrap) => <FormField size={loose(parent)}>{wrap(select(own))}</FormField>,
  },
  {
    child: 'input',
    option: 'size',
    parent: 'form-field',
    root: '.cck-input',
    ui: (parent, own, wrap) => (
      <FormField size={loose(parent)}>{wrap(<Input aria-label="Name" size={loose(own)} />)}</FormField>
    ),
  },
  {
    child: 'textarea',
    option: 'size',
    parent: 'form-field',
    root: '.cck-textarea',
    ui: (parent, own, wrap) => (
      <FormField size={loose(parent)}>{wrap(<Textarea aria-label="Notes" size={loose(own)} />)}</FormField>
    ),
  },
  {
    child: 'chip-list',
    option: 'size',
    parent: 'form-field',
    root: '.cck-chip-list',
    ui: (parent, own, wrap) => (
      <FormField size={loose(parent)}>{wrap(<ChipList aria-label="Tags" size={loose(own)} />)}</FormField>
    ),
  },
  {
    child: 'avatar',
    option: 'size',
    parent: 'avatar-label',
    root: '.cck-avatar',
    ui: (parent, own, wrap) => (
      <AvatarLabel name="Ada" size={loose(parent)}>
        {wrap(avatar(own))}
      </AvatarLabel>
    ),
  },
  {
    child: 'avatar',
    option: 'size',
    parent: 'avatar-group',
    root: '.cck-avatar',
    ui: (parent, own, wrap) => <AvatarGroup size={loose(parent)}>{wrap(avatar(own))}</AvatarGroup>,
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

const direct: Wrap = (inner) => <>{inner}</>;
/** A foreign theme wrapper between the parent and the child, as a Button theme would be. */
const foreign: Wrap = (inner) => (
  <ThemeOptionsProvider componentName="button" options={{ size: 'xl' }}>
    {inner}
  </ThemeOptionsProvider>
);

function attr(row: Row, parent: Value, own: Value, override?: string, wrap: Wrap = direct): string | null {
  const overrides = override ? { [row.child]: { [row.option]: override } } : {};
  const { container } = render(
    <ThemeProvider themeConfig={cocokitsThemeConfig} overrides={overrides}>
      {row.ui(parent, own, wrap)}
    </ThemeProvider>,
  );
  const element = container.querySelector(row.root);
  if (!element) throw new Error(`no ${row.root}`);
  const result = element.getAttribute(attrOf[row.option]);
  cleanup();
  return result;
}

const pairs = Object.entries(optionParents).flatMap(([child, options]) =>
  Object.entries(options).flatMap(([option, parents]) => parents.map((parent) => [child, option, parent] as const)),
);

describe('group inheritance in the React theme (D29, AC 12)', () => {
  it('has a row for every pair of optionParents, and only those', () => {
    expect(rows.map((row) => [row.child, row.option, row.parent])).toEqual(pairs.map((pair) => [...pair]));
  });

  describe.each(rows.map((row) => [`${row.child} ${row.option} from ${row.parent}`, row] as const))(
    '%s',
    (_name, row) => {
      const v = values[row.option];

      it('takes the value of the parent when it sets none of its own', () => {
        expect(attr(row, v.parent, undefined)).toBe(v.parent);
      });

      it('keeps its own value over the parent', () => {
        expect(attr(row, v.parent, v.own)).toBe(v.own);
      });

      it('follows the parent when it changes', () => {
        const ui = (parent: Value): ReactElement => (
          <ThemeProvider themeConfig={cocokitsThemeConfig}>{row.ui(parent, undefined, direct)}</ThemeProvider>
        );
        const { container, rerender } = render(ui(v.parent));
        expect(container.querySelector(row.root)?.getAttribute(attrOf[row.option])).toBe(v.parent);
        rerender(ui(v.override));
        expect(container.querySelector(row.root)?.getAttribute(attrOf[row.option])).toBe(v.override);
      });

      it('takes the default when neither it nor the parent sets one', () => {
        expect(attr(row, undefined, undefined)).toBe(v.fallback);
      });

      it('takes the ThemeProvider override when neither it nor the parent sets one', () => {
        expect(attr(row, undefined, undefined, v.override)).toBe(v.override);
      });

      it('lets the parent value win over the override', () => {
        expect(attr(row, v.parent, undefined, v.override)).toBe(v.parent);
      });

      it('removes the attribute with an own null, and takes the parent back with undefined', () => {
        expect(attr(row, v.parent, null)).toBeNull();
        expect(attr(row, v.parent, undefined)).toBe(v.parent);
      });

      it('removes the attribute when the parent is null and the child sets none', () => {
        expect(attr(row, null, undefined)).toBeNull();
        expect(attr(row, undefined, undefined)).toBe(v.fallback);
      });

      it('is not hidden by a foreign theme wrapper between them', () => {
        expect(attr(row, v.parent, undefined, undefined, foreign)).toBe(v.parent);
      });
    },
  );

  it('takes the avatar size from the nearest listed parent: the label before the group', () => {
    const { container } = render(
      <ThemeProvider themeConfig={cocokitsThemeConfig}>
        <AvatarGroup size="sm">
          <AvatarLabel name="Ada" size="xl">
            {avatar(undefined)}
          </AvatarLabel>
        </AvatarGroup>
      </ThemeProvider>,
    );
    expect(container.querySelector('.cck-avatar')?.getAttribute('data-size')).toBe('xl');
  });

  it('resolves the Form field size through the Chip list: its own, else the field size, else the default', () => {
    const { container } = render(
      <ThemeProvider themeConfig={cocokitsThemeConfig}>
        <FormField size="lg">
          <ChipList aria-label="Tags" />
        </FormField>
        <FormField size="lg">
          <ChipList aria-label="Own" size="sm" />
        </FormField>
        <ChipList aria-label="Alone" />
      </ThemeProvider>,
    );
    const sizes = [...container.querySelectorAll('.cck-chip-list')].map((list) => list.getAttribute('data-size'));
    expect(sizes).toEqual(['lg', 'sm', 'md']);
  });

  it.each(['sm', 'md', 'lg'])(
    'keeps the chips a populated Chip list renders at the default chip size, whatever the list size: %s (C14)',
    (size) => {
      const { container } = render(
        <ThemeProvider themeConfig={cocokitsThemeConfig}>
          <FormField size="lg">
            <ChipList aria-label="Tags" defaultValue={['a', 'b']} size={loose(size)} />
          </FormField>
        </ThemeProvider>,
      );
      expect(container.querySelector('.cck-chip-list')?.getAttribute('data-size')).toBe(size);
      const chips = [...container.querySelectorAll('.cck-chip')];
      expect(chips).toHaveLength(2);
      expect(chips.map((chip) => chip.getAttribute('data-size'))).toEqual(['md', 'md']);
    },
  );

  it('inherits nothing into a base child that has no themed wrapper: it shows the config default', () => {
    const { container } = render(
      <ThemeProvider themeConfig={cocokitsThemeConfig}>
        <FormField size="lg">
          <BaseInput aria-label="Name" />
        </FormField>
      </ThemeProvider>,
    );
    expect(container.querySelector('.cck-input')?.getAttribute('data-size')).toBe('md');
  });
});
