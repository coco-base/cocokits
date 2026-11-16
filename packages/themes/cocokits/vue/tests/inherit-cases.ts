import { h, type VNode } from 'vue';
import {
  AvatarFallback,
  AvatarGroup,
  AvatarLabel,
  AvatarRoot,
  ChipList,
  FormField,
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

type Value = string | null | undefined;

/** One themed parent-child pair: what the child renders when it sets a value, when it sets none, and when it sets `null`. */
export interface InheritCase {
  readonly name: string;
  /** The CSS class of the root of the child. */
  readonly root: string;
  readonly attr: string;
  readonly parent: string;
  readonly own: string;
  readonly ui: (parent: Value, own: Value) => VNode;
}

const avatar = (own: Value): VNode => h(AvatarRoot, { size: own } as never, () => h(AvatarFallback, null, () => 'AL'));
const radio = (option: string, parent: Value, own: Value): VNode =>
  h(RadioGroup, { 'aria-label': 'Plan', [option]: parent } as never, () =>
    h(Radio, { value: 'a', [option]: own } as never, () => 'A'),
  );
const field = (parent: Value, child: VNode): VNode => h(FormField, { size: parent } as never, () => child);

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
    ui: (p, o) => h(AvatarGroup, { size: p } as never, () => avatar(o)),
  },
  {
    name: 'avatar from avatar label',
    root: 'cck-avatar',
    attr: 'data-size',
    parent: 'sm',
    own: 'lg',
    ui: (p, o) => h(AvatarLabel, { name: 'Ada', size: p } as never, () => avatar(o)),
  },
  {
    name: 'select from form field',
    root: 'cck-select',
    attr: 'data-size',
    parent: 'sm',
    own: 'lg',
    ui: (p, o) =>
      field(
        p,
        h(SelectRoot, { size: o } as never, () => [
          h(SelectTrigger, { 'aria-label': 'Dish' }, () => h(SelectValue, { placeholder: 'Pick' })),
          h(SelectContent, null, () => h(SelectItem, { value: 'a' }, () => h(SelectItemText, null, () => 'A'))),
        ]),
      ),
  },
  {
    name: 'textarea from form field',
    root: 'cck-textarea',
    attr: 'data-size',
    parent: 'sm',
    own: 'lg',
    ui: (p, o) => field(p, h(Textarea, { 'aria-label': 'Notes', size: o } as never)),
  },
  {
    name: 'chip list from form field',
    root: 'cck-chip-list',
    attr: 'data-size',
    parent: 'sm',
    own: 'lg',
    ui: (p, o) => field(p, h(ChipList, { 'aria-label': 'Tags', size: o } as never)),
  },
];

/** The value of `attr` on the first element that has the class `root` in the markup; `null` when it is absent. */
export function attrIn(html: string, root: string, attr: string): string | null {
  const tag = new RegExp(String.raw`<[^>]*\sclass="(?:[^"]*\s)?${root}(?:\s[^"]*)?"[^>]*>`).exec(html)?.[0];
  if (!tag) throw new Error(`no .${root} in the markup`);
  return new RegExp(String.raw`\s${attr}="([^"]*)"`).exec(tag)?.[1] ?? null;
}

/** Every `data-*` attribute in the markup, in order: the theme output, apart from what the base adds when it mounts. */
export const dataAttrsIn = (html: string): string[] => html.match(/\sdata-[\w-]+="[^"]*"/g) ?? [];
