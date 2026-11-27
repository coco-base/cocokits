import type { ReactElement } from 'react';
import {
  Avatar,
  AvatarGroup,
  AvatarLabel,
  ChipList,
  FormField,
  Radio,
  RadioGroup,
  Select,
  Textarea,
} from '../src/index';

type Value = string | null | undefined;
// The props are typed per option; the tests set one value at a time and read the attribute it renders.
const loose = (value: Value): never => value as never;

/** One themed parent-child pair: what the child renders when it sets a value, when it sets none, and when it sets `null`. */
export interface InheritCase {
  readonly name: string;
  /** The CSS class of the root of the child. */
  readonly root: string;
  readonly attr: string;
  readonly parent: string;
  readonly own: string;
  readonly ui: (parent: Value, own: Value) => ReactElement;
}

const avatar = (own: Value): ReactElement => (
  <Avatar.Root size={loose(own)}>
    <Avatar.Fallback>AL</Avatar.Fallback>
  </Avatar.Root>
);
const radio = (option: string, parent: Value, own: Value): ReactElement => (
  <RadioGroup aria-label="Plan" {...{ [option]: loose(parent) }}>
    <Radio value="a" {...{ [option]: loose(own) }}>
      A
    </Radio>
  </RadioGroup>
);

export const inheritCases: InheritCase[] = [
  {
    name: 'radio size',
    root: 'cck-radio',
    attr: 'data-size',
    parent: 'sm',
    own: 'lg',
    ui: (p, o) => radio('size', p, o),
  },
  {
    name: 'radio color',
    root: 'cck-radio',
    attr: 'data-cck-color',
    parent: 'success',
    own: 'info',
    ui: (p, o) => radio('color', p, o),
  },
  {
    name: 'radio labelPosition',
    root: 'cck-radio',
    attr: 'data-label-position',
    parent: 'before',
    own: 'after',
    ui: (p, o) => radio('labelPosition', p, o),
  },
  {
    name: 'avatar from avatar group',
    root: 'cck-avatar',
    attr: 'data-size',
    parent: 'sm',
    own: 'lg',
    ui: (p, o) => <AvatarGroup size={loose(p)}>{avatar(o)}</AvatarGroup>,
  },
  {
    name: 'avatar from avatar label',
    root: 'cck-avatar',
    attr: 'data-size',
    parent: 'sm',
    own: 'lg',
    ui: (p, o) => (
      <AvatarLabel name="Ada" size={loose(p)}>
        {avatar(o)}
      </AvatarLabel>
    ),
  },
  {
    name: 'select from form field',
    root: 'cck-select',
    attr: 'data-size',
    parent: 'sm',
    own: 'lg',
    ui: (p, o) => (
      <FormField size={loose(p)}>
        <Select.Root size={loose(o)}>
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
      </FormField>
    ),
  },
  {
    name: 'textarea from form field',
    root: 'cck-textarea',
    attr: 'data-size',
    parent: 'sm',
    own: 'lg',
    ui: (p, o) => (
      <FormField size={loose(p)}>
        <Textarea aria-label="Notes" size={loose(o)} />
      </FormField>
    ),
  },
  {
    name: 'chip list from form field',
    root: 'cck-chip-list',
    attr: 'data-size',
    parent: 'sm',
    own: 'lg',
    ui: (p, o) => (
      <FormField size={loose(p)}>
        <ChipList aria-label="Tags" size={loose(o)} />
      </FormField>
    ),
  },
];

/** The value of `attr` on the first element that has the class `root` in the markup; `null` when it is absent. */
export function attrIn(html: string, root: string, attr: string): string | null {
  const tag = new RegExp(String.raw`<[^>]*\sclass="(?:[^"]*\s)?${root}(?:\s[^"]*)?"[^>]*>`).exec(html)?.[0];
  if (!tag) throw new Error(`no .${root} in the markup`);
  return new RegExp(String.raw`\s${attr}="([^"]*)"`).exec(tag)?.[1] ?? null;
}

/** Every `data-*` attribute in the markup, in order: the theme's output, apart from what the base adds when it mounts. */
export const dataAttrsIn = (html: string): string[] => html.match(/\sdata-[\w-]+="[^"]*"/g) ?? [];
