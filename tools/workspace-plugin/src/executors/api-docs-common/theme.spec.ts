import { describe, expect, it } from 'vitest';
import type { ApiMemberJson, ApiPartJson } from './types';
import { placeAt, placeOf } from './places';
import { type BasePart, baseComponentOf, ownersOfSelector, withPropsOnly } from './theme';

const part = (component: string, name: string, selector: string): BasePart => ({
  component,
  semanticId: `${component}.${name}`,
  part: name,
  selector,
});

/** The base parts of the components the real theme layers own: Button (two classes), Dialog, Menu. */
const BASE: BasePart[] = [
  part('button', 'root', 'button[cckButton]'),
  part('button', 'root', 'a[cckButton]'),
  part('dialog', 'root', '[cckDialog]'),
  part('dialog', 'title', '[cckDialogTitle]'),
  part('dialog', 'content', 'dialog[cckDialogContent]'),
  part('menu', 'content', 'cck-menu-content'),
  part('menu', 'subContent', 'cck-menu-sub-content'),
  part('menu', 'item', 'cck-menu-item'),
  part('menu', 'checkboxItem', 'cck-menu-checkbox-item'),
  part('menu', 'radioItem', 'cck-menu-radio-item'),
  part('menu', 'subTrigger', 'cck-menu-sub-trigger'),
];

const owners = (selector: string): { semanticIds: string[]; problems: string[] } => {
  const problems: string[] = [];
  return { semanticIds: ownersOfSelector(selector, BASE, 'Theme', problems).map((p) => p.semanticId), problems };
};

describe('ownersOfSelector (Decision 2)', () => {
  it.each([
    ['the selector of a base part', '[cckDialog]', ['dialog.root']],
    ['the selector of a base part with an element name', 'h2[cckDialogTitle]', ['dialog.title']],
    ['two classes of one neutral part count once', 'button[cckButton], a[cckButton]', ['button.root']],
    [
      'a list owns content and subContent',
      'cck-menu-content, cck-menu-sub-content',
      ['menu.content', 'menu.subContent'],
    ],
    [
      'a list owns four item parts',
      'cck-menu-item, cck-menu-checkbox-item, cck-menu-radio-item, cck-menu-sub-trigger',
      ['menu.item', 'menu.checkboxItem', 'menu.radioItem', 'menu.subTrigger'],
    ],
  ])('%s', (_name, selector, expected) => {
    expect(owners(selector)).toEqual({ semanticIds: expected, problems: [] });
  });

  it('reports an alternative that names no base part, with its name', () => {
    expect(owners('[cckDialog], [cckNothing]').problems).toEqual([
      'Theme: the selector "[cckNothing]" names no base part',
    ]);
  });

  it('reports a selector that names parts of two base components and owns none', () => {
    const { semanticIds, problems } = owners('[cckDialog], button[cckButton]');
    expect(semanticIds).toEqual([]);
    expect(problems).toEqual([
      'Theme: the selector "[cckDialog], button[cckButton]" names parts of two base components (dialog, button)',
    ]);
  });
});

describe('baseComponentOf', () => {
  it.each([
    ['react', '@cocokits/react/dialog', 'dialog'],
    ['vue', '@cocokits/vue/icon-button', 'icon-button'],
    ['react', '@cocokits/vue/dialog', undefined],
    ['react', '@cocokits/react-core', undefined],
    ['react', '@cocokits/theme-cocokits', undefined],
  ] as const)('%s %s', (framework, specifier, expected) => {
    expect(baseComponentOf(framework, specifier)).toBe(expected);
  });
});

describe('withPropsOnly', () => {
  const member = (): ApiMemberJson =>
    ({ name: 'size', type: '"sm" | "lg" | undefined', required: false }) as ApiMemberJson;

  it('leaves its input part and members unchanged and keeps the place of a member', () => {
    const node = {} as never;
    const prop = placeAt(member(), node);
    const part = {
      name: 'Dialog.Root',
      props: [prop],
      events: [{ name: 'e' }],
      slots: [],
      methods: [],
    } as never as ApiPartJson;
    const before = structuredClone(part);
    const result = withPropsOnly(part);
    expect(part).toEqual(before);
    expect(part.props[0]).toBe(prop);
    expect(prop.type).toBe('"sm" | "lg" | undefined');
    expect(result.props[0]?.type).toBe("'sm' | 'lg'");
    expect(result.events).toEqual([]);
    expect(placeOf(result.props.find((item) => item.name === 'size') ?? {})).toBe(node);
  });
});
