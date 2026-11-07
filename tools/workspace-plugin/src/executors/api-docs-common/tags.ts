import type { TagEntry } from './types';

/** The trimmed text of every tag with this name, in source order. */
export const tagsOf = (tags: readonly TagEntry[], name: string): string[] =>
  tags.filter((tag) => tag.name === name).map((tag) => tag.comment.trim());

const LINK = /\{@link(?:code|plain)?\s+([^}]*)\}/g;

/**
 * The text with each inline link as plain text: `{@link X}` becomes the code span `` `X` ``, and `{@link X | text}` (or
 * the JSDoc form `{@link X text}`) becomes `text`. The JSON is read by tables that cannot follow a link, so it holds no
 * link tag.
 */
export function withoutLinks(text: string): string {
  return text.replace(LINK, (_match, inner: string) => {
    const [target = '', label = ''] = inner.includes('|') ? inner.split('|', 2) : inner.trim().split(/\s+(.*)/s, 2);
    return label.trim() === '' ? `\`${target.trim()}\`` : label.trim();
  });
}

/** The TSDoc text with its links as plain text and its line breaks folded into spaces, paragraph by paragraph. */
export function paragraphsOf(description: string): string[] {
  return withoutLinks(description)
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/\s+/g, ' ').trim())
    .filter((paragraph) => paragraph !== '');
}

/** The `@defaultValue` text without the backticks that wrap it. */
export const defaultOf = (tags: readonly TagEntry[]): string | undefined => {
  const [text] = tagsOf(tags, 'defaultValue');
  return text === undefined || text === '' ? undefined : text.replace(/^`([^`]*)`$/, '$1');
};

/**
 * The canonical id of a member: its `@cckSemantic` tag when it has one, else `<component>.<name>`
 * (api-extraction.md, semantic ids). A tag that starts with `*.` (`*.readOnly`) stands for the component being
 * extracted, so a member inherited by several components gets each component's own id.
 */
export function semanticIdOf(componentName: string, name: string, tags: readonly TagEntry[]): string {
  const [semantic] = tagsOf(tags, 'cckSemantic');
  if (semantic === undefined || semantic === '') return `${componentName}.${name}`;
  return semantic.startsWith('*.') ? `${componentName}${semantic.slice(1)}` : semantic;
}

/**
 * The reason of a `@cckDefaultDiffers <reason>` tag: the default of the member differs from the other frameworks by
 * design. `undefined` without the tag, `''` for the tag without a reason (the caller reports it).
 */
export const defaultDiffersOf = (tags: readonly TagEntry[]): string | undefined => {
  const [text] = tagsOf(tags, 'cckDefaultDiffers');
  return text === undefined ? undefined : text.replace(/\s+/g, ' ');
};

/**
 * Checks the reason of an item tagged `@cckSemantic none`, which exists in one framework by design. It needs a
 * `@cckParity <reason>` (the reason is read here and never written to the JSON). An empty `@cckParity` is a problem
 * on any item. Returns whether the item is tagged `none`.
 */
export function checkParity(label: string, tags: readonly TagEntry[], problems: string[]): boolean {
  const parity = tagsOf(tags, 'cckParity');
  if (parity.some((text) => text === ''))
    problems.push(`${label}: "@cckParity" needs a reason ("@cckParity <reason>")`);
  const none = tagsOf(tags, 'cckSemantic').includes('none');
  if (none && !parity.some((text) => text !== ''))
    problems.push(`${label} is "@cckSemantic none" and needs a "@cckParity" reason`);
  return none;
}

/**
 * `{ frameworkOnly: true }` for a part class or component tagged `@cckSemantic none`: the part exists in some frameworks
 * only by design (the Tooltip Provider). The tag needs a `@cckParity` reason ({@link checkParity}).
 */
export function frameworkOnlyOf(
  name: string,
  tags: readonly TagEntry[],
  problems: string[],
): { frameworkOnly: true } | Record<string, never> {
  return checkParity(`${name}: the part`, tags, problems) ? { frameworkOnly: true } : {};
}

/**
 * Checks the TSDoc of a part and adds a problem for each missing piece: the `@cckPart` tag and the description.
 * Returns the anatomy part the tag names, or an empty string.
 */
export function checkPartDoc(name: string, tags: readonly TagEntry[], description: string, problems: string[]): string {
  const part = tagsOf(tags, 'cckPart')[0] ?? '';
  if (part === '') problems.push(`${name}: the TSDoc needs "@cckPart <part>" (the anatomy part it renders)`);
  if (paragraphsOf(description).length === 0) problems.push(`${name}: no TSDoc description`);
  return part;
}

/** The slot a `@cckSlot <name> [<selector>] - <description>` tag declares. */
export interface SlotTag {
  readonly name: string;
  /** The `ng-content select`; absent for the default slot. */
  readonly selector?: string;
  readonly description: string;
}

/**
 * Parses the text of one `@cckSlot` tag, or returns undefined when it does not have the shape above. The first
 * ` - ` ends the name and selector, so the description may contain ` - `. The default slot has no selector.
 */
export function parseSlotTag(text: string): SlotTag | undefined {
  const delimiter = /\s-\s/.exec(text.trim());
  if (delimiter === null) return undefined;
  const source = text.trim();
  const [name = '', ...selectorWords] = source.slice(0, delimiter.index).split(/\s+/);
  const selector = selectorWords.join(' ');
  const description = withoutLinks(source.slice(delimiter.index + delimiter[0].length))
    .replace(/\s+/g, ' ')
    .trim();
  if (name === '' || description === '' || (name === 'default' && selector !== '')) return undefined;
  return { name, ...(selector === '' ? {} : { selector }), description };
}

/** The anatomy parts a class names: the first is its own, the others are rendered inside it (`renders`). */
export function partsOf(tags: readonly TagEntry[]): string[] {
  return tagsOf(tags, 'cckPart').filter((part) => part !== '');
}

/** The `ng-template` selector a `@cckTemplate` tag names, or undefined. */
export function templateOf(tags: readonly TagEntry[]): string | undefined {
  const [selector] = tagsOf(tags, 'cckTemplate');
  return selector === undefined || selector === '' ? undefined : selector;
}

/** The `@cckSection <part> <slot> <input>` tag, or undefined when it is absent; a malformed one is `null`. */
export function sectionOf(
  tags: readonly TagEntry[],
): { partName: string; slotName: string; inputName: string } | null | undefined {
  const [text] = tagsOf(tags, 'cckSection');
  if (text === undefined) return undefined;
  const [part, slot, input, ...rest] = text.split(/\s+/);
  return part && slot && input && rest.length === 0 ? { partName: part, slotName: slot, inputName: input } : null;
}

/**
 * The selectors named by the `@cckTemplate` tags and by the `ng-template` selectors of the `@cckSlot` tags of a list of
 * classes. A class with one of those selectors is a portal or slot-template directive: it renders no anatomy part, so
 * it needs no `@cckPart` and is no part of the `ApiDoc`.
 */
export function portalSelectors(classes: readonly { readonly jsdocTags: readonly TagEntry[] }[]): Set<string> {
  return new Set(
    classes.flatMap((entry) => [
      ...[templateOf(entry.jsdocTags)].filter((selector) => selector !== undefined),
      ...tagsOf(entry.jsdocTags, 'cckSlot').flatMap((text) => {
        const selector = parseSlotTag(text)?.selector;
        return selector?.startsWith('ng-template') === true ? [selector] : [];
      }),
    ]),
  );
}
