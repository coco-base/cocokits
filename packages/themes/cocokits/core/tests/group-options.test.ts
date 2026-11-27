import { describe, expect, it } from 'vitest';
import { cocokitsThemeConfig, optionParents } from '../src/index';
import { read } from './css-test-helpers';

interface OptionLike {
  readonly values: readonly (string | boolean)[];
}
const components: Readonly<Record<string, Readonly<Record<string, unknown>> | undefined>> =
  cocokitsThemeConfig.components;
const optionOf = (component: string, name: string): OptionLike | undefined =>
  components[component]?.[name] as OptionLike | undefined;
const hasOptions = (block: string): boolean => Object.keys(components[block] ?? {}).some((key) => key !== 'icons');

const pairs = Object.entries(optionParents).flatMap(([child, options]) =>
  Object.entries(options).flatMap(([option, parents]) => parents.map((parent) => [child, option, parent] as const)),
);

describe('optionParents', () => {
  it('lists the active pairs of the spec, nearest parent first', () => {
    expect(pairs.map((pair) => pair.join(' '))).toEqual([
      'select size form-field',
      'input size form-field',
      'textarea size form-field',
      'chip-list size form-field',
      'avatar size avatar-label',
      'avatar size avatar-group',
      'radio size radio-group',
      'radio color radio-group',
      'radio labelPosition radio-group',
    ]);
  });

  it.each(pairs)(
    '%s %s from %s: both have the option and every parent value is a child value',
    (child, option, parent) => {
      const own = optionOf(child, option);
      const inherited = optionOf(parent, option);
      expect(own, `${child}.${option}`).toBeDefined();
      expect(inherited, `${parent}.${option}`).toBeDefined();
      for (const value of inherited?.values ?? []) expect(own?.values).toContain(value);
    },
  );
});

/** The sheet without its forced-colors media blocks, which only restore system colours. */
function withoutForcedColors(sheet: string): string {
  const marker = '@media (forced-colors: active)';
  let out = sheet;
  for (let start = out.indexOf(marker); start !== -1; start = out.indexOf(marker)) {
    let depth = 0;
    let end = out.indexOf('{', start);
    for (; end < out.length; end++) {
      if (out[end] === '{') depth++;
      if (out[end] === '}' && --depth === 0) break;
    }
    out = out.slice(0, start) + out.slice(end + 1);
  }
  return out;
}

/** The selector without the arguments of its `:has()`, `:is()`, `:not()` and `:where()`. */
function withoutArguments(selector: string): string {
  let out = selector;
  for (let match = /:[a-z-]+\(/.exec(out); match; match = /:[a-z-]+\(/.exec(out)) {
    let depth = 0;
    let end = match.index + match[0].length - 1;
    for (; end < out.length; end++) {
      if (out[end] === '(') depth++;
      if (out[end] === ')' && --depth === 0) break;
    }
    out = out.slice(0, match.index) + out.slice(end + 1);
  }
  return out;
}

const blockOf = (className: string): string => className.slice('.cck-'.length).split('__')[0];

/** The slot layout: what a box owns about a child in it, and what it hands over to the box. */
const SLOT_LAYOUT =
  /^(flex|min-inline-size|min-block-size|padding|padding-block|padding-inline|border(-[a-z-]+)?|background-color|box-shadow|outline(-[a-z]+)?)$/;

/**
 * Rules that place or space a child without setting an option of it, with the properties they may set. They read a
 * variable of their parent block: the group's overlap and ring, the badge position, the divider spacing in a menu.
 */
const PLACEMENT: Readonly<Record<string, readonly string[] | undefined>> = {
  'avatar-group avatar': ['box-shadow', 'margin-inline-start'],
  'badge-container badge': [
    'position',
    'inset-block-start',
    'inset-block-end',
    'inset-inline-start',
    'inset-inline-end',
    'translate',
  ],
  // A Label spaces an icon before its text and a Badge or Tag after it with its own gap.
  'label svg-icon': ['margin-inline-end'],
  'label badge': ['margin-inline-start'],
  'label tag': ['margin-inline-start'],
  // The Divider in a Menu runs from edge to edge of the list: its inline margin undoes the padding of the list.
  'menu divider': ['margin-block', 'margin-inline'],
  // A parent that renders its children passes its size to them through CSS, from its own size tokens.
  'chip-list chip': [
    'block-size',
    'gap',
    'padding-inline',
    'padding-inline-start',
    'font-family',
    'font-size',
    'line-height',
    'letter-spacing',
    'margin-inline-end',
    // A faded (disabled) list fades as a whole: its chips reset their own fade and take the cursor of the list.
    'opacity',
    'cursor',
  ],
};

/**
 * Resets and placement a box may set on a child besides the slot layout, per pair. The pairs have no `PLACEMENT`
 * entry, so the other checks of this file still run on them: an entry here only widens the slot layout.
 */
const RESETS: Readonly<Record<string, readonly string[] | undefined>> = {
  // A faded field box fades as a whole: the control in it resets its own fade, so nothing fades twice.
  'form-field input': ['opacity', 'align-self'],
  'form-field textarea': ['opacity', 'contain', 'max-block-size', 'padding-inline-end'],
  'form-field chip-list': ['opacity'],
  // A Select trigger in a faded zone, or in the box it shares with a Prefix or Suffix, resets its own fade. A
  // Select in a zone drops the fixed width of a standalone Select (`inline-size: auto`), so the zone is as wide as
  // the value.
  'form-field select': ['opacity', 'inline-size'],
  // A Button in a Leading or Trailing zone stretches to the height of the box.
  'form-field button': ['align-self'],
  // The ring that cuts the badge from the host it overlaps belongs to the container that places the badge.
  'badge-container badge': ['box-shadow'],
  // Read-only is a state of the list, like the faded list above: its chips take the read-only fill.
  'chip-list chip': ['background-color'],
  // The Menu draws a bare Divider in its own separator colour (Menu content and sub-content).
  'menu divider': ['border-color'],
};

interface CrossRule {
  readonly item: string;
  readonly first: string;
  readonly last: string;
  readonly properties: string[];
  readonly body: string;
}

const sheet = withoutForcedColors(read('dist', 'styles.css'));
const crossRules: CrossRule[] = [...sheet.matchAll(/(?<=^|[{}])\s*([^{}@]+?)\s*\{([^{}]*)\}/g)].flatMap(
  ([, selector, body]) =>
    selector
      .split(/,(?![^(]*\))/)
      .map((item) => item.trim())
      .flatMap((item) => {
        const blocks = [...withoutArguments(item).matchAll(/\.cck-[a-z0-9-]+(?:__[a-z0-9-]+)?/g)].map((m) =>
          blockOf(m[0]),
        );
        const first = blocks[0];
        const last = blocks[blocks.length - 1];
        if (blocks.length === 0 || first === last) return [];
        const properties = body
          .split(';')
          .map((line) => line.trim().split(':')[0])
          .filter(Boolean);
        return [{ item, first, last, properties, body }];
      }),
);

describe('no theme CSS rule sets an option of a child from a parent selector', () => {
  it('finds the cross-block rules of the whole sheet', () => {
    expect(crossRules.length).toBeGreaterThan(30);
    expect(crossRules.some((rule) => rule.last === 'chip-list')).toBe(true);
  });

  it('lets a rule that names two blocks set only the slot layout when the last block has an option', () => {
    const bad = crossRules.flatMap((rule) => {
      if (!hasOptions(rule.last)) return [];
      if (rule.last === 'svg-icon') {
        const wanted = (property: string): boolean =>
          property === 'flex' ||
          PLACEMENT[`${rule.first} svg-icon`]?.includes(property) === true ||
          (property === 'font-size' && rule.item.includes('.cck-svg-icon:not([data-size])')) ||
          (property === 'color' && rule.item.includes('.cck-svg-icon:not([data-cck-color])'));
        return rule.properties
          .filter((property) => !wanted(property))
          .map((property) => `${rule.item} { ${property} }`);
      }
      const placement = PLACEMENT[`${rule.first} ${rule.last}`];
      const resets = RESETS[`${rule.first} ${rule.last}`] ?? [];
      return rule.properties
        .filter(
          (property) =>
            !resets.includes(property) && !(placement ? placement.includes(property) : SLOT_LAYOUT.test(property)),
        )
        .map((property) => `${rule.item} { ${property} }`);
    });
    expect(bad).toEqual([]);
  });

  it('lets it read a variable of the first block only for a placement or when the last block has no option', () => {
    const bad = crossRules.flatMap((rule) => {
      // An SvgIcon without its own `size` or `color` takes them from its parent: the guarded rule is the exception.
      const guarded = rule.last === 'svg-icon' && /:not\(\[data-(size|cck-color)\]\)/.test(rule.item);
      if (!hasOptions(rule.last) || guarded || PLACEMENT[`${rule.first} ${rule.last}`]) return [];
      return [...rule.body.matchAll(/var\((--cck-[a-z0-9-]+)/g)]
        .map((match) => match[1])
        .filter((name) => name.startsWith(`--cck-${rule.first}-`) && !name.startsWith(`--cck-${rule.last}-`))
        .map((name) => `${rule.item} reads ${name}`);
    });
    expect(bad).toEqual([]);
  });

  it('sets no size or text of a Select, Input, Textarea, Chip list, Avatar or Chip from its parent, only a listed reset to auto', () => {
    const sized = ['select', 'input', 'textarea', 'chip-list', 'avatar', 'chip'];
    const bad = crossRules.filter(
      (rule) =>
        sized.includes(rule.last) &&
        !PLACEMENT[`${rule.first} ${rule.last}`] &&
        rule.properties.some(
          (property) =>
            /^(block-size|inline-size|font|font-[a-z]+|line-height|letter-spacing)$/.test(property) &&
            !(RESETS[`${rule.first} ${rule.last}`]?.includes(property) && rule.body.includes(`${property}: auto`)),
        ),
    );
    expect(bad.map((rule) => rule.item)).toEqual([]);
  });
});
