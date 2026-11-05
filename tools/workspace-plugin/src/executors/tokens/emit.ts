import type { Collection, ModeCollection, Token, TokenFile, TokenFormat } from './types';

/** The two collections whose mode attribute is not the slug of their name. */
const ATTRIBUTES: Record<string, string> = { 'Theme / Color': 'color-mode', 'Theme / Active Color': 'color' };
/** Applies only where its marker is set, so it gets no `:root` fallback. */
const NO_ROOT = 'Theme / Active Color';
/**
 * The class prefix of a component root (`cck-button`). It restates `CCK_PREFIX`, which
 * `packages/shared/src/prefix.ts` owns: the workspace plugin depends on nothing internal
 * (the `workspace` project imports no other project), so it cannot import it.
 */
const CLASS_PREFIX = 'cck';
const UNITS = ['px', 'rem', 'em', '%', 'unitless'];
const ALIAS = /^\{([^#}]+)#([^}]+)\}$/;
/** The fields of a collection. Anything else fails the build, so no consumer's data hides in the token JSON. */
const COLLECTION_FIELDS = ['name', 'tier', 'prefix', 'defaultMode', 'modes', 'tokens', 'alsoFor'];

interface Entry {
  collection: Collection;
  token: Token;
  variable: string;
}

const BLOCK_SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const slug = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[/\s]+/g, '-')
    .replace(/-+/g, '-');

const where = (entry: Entry): string => `${entry.collection.name}: ${entry.token.name}`;

/** The mode attribute of a collection: the slug of its name after `/`, unless the table names it. */
function attributeOf(collection: Collection): string {
  return ATTRIBUTES[collection.name] ?? slug((collection.name.split('/').pop() ?? collection.name).trim());
}

function indexTokens(file: TokenFile): Map<string, Entry> {
  const entries = new Map<string, Entry>();
  const names = new Map<string, Entry>();
  for (const collection of file.collections) {
    for (const token of collection.tokens) {
      const own = collection.prefix ? `${collection.prefix}-` : '';
      const variable = `--${file.$meta.globalPrefix}-${own}${slug(token.name)}`;
      const entry = { collection, token, variable };
      const clash = names.get(variable);
      if (clash) throw new Error(`${where(entry)}: variable ${variable} is also made by ${where(clash)}`);
      names.set(variable, entry);
      entries.set(`${collection.name}#${token.name}`, entry);
    }
  }
  return entries;
}

function checkFields(collection: Collection): void {
  const unknown = Object.keys(collection).filter((key) => !COLLECTION_FIELDS.includes(key));
  if (unknown.length > 0) {
    const fields = unknown.map((key) => `"${key}"`).join(', ');
    throw new Error(
      `${collection.name}: unknown collection field ${fields} (allowed: ${COLLECTION_FIELDS.join(', ')})`,
    );
  }
  for (const block of collection.alsoFor ?? []) {
    if (!BLOCK_SLUG.test(block)) {
      throw new Error(`${collection.name}: alsoFor "${block}" is not a block slug (lowercase letters, digits, "-")`);
    }
  }
}

function checkShape(entry: Entry): void {
  const { token, collection } = entry;
  if (token.type === 'number' && !UNITS.includes(token.unit ?? '')) {
    throw new Error(`${where(entry)}: number token needs a unit (${UNITS.join(', ')}), got "${token.unit ?? ''}"`);
  }
  const keys = Object.keys(token.valuesByMode).sort().join(', ');
  if (keys !== [...collection.modes].sort().join(', ')) {
    throw new Error(
      `${where(entry)}: values are [${keys}] but the collection modes are [${collection.modes.join(', ')}]`,
    );
  }
}

/** The component of a Tier 3 collection (`Button / Size` is `button`) and its part (`size`). */
const componentOf = (collection: Collection): string => slug(collection.name.split('/')[0]?.trim() ?? '');
const partOf = (collection: Collection): string => slug(collection.name.split('/').slice(1).join('/').trim());

/** Whether the mode's block is emitted at `:root`, where an alias to a multi-mode token would freeze. */
function atRoot(collection: Collection, mode: string): boolean {
  if (collection.tier === 1) return true;
  if (collection.tier === 3) return false;
  return collection.name !== NO_ROOT && mode === collection.defaultMode;
}

function checkAlias(entry: Entry, mode: string, target: Entry | undefined, ref: string): void {
  if (!target) throw new Error(`${where(entry)}: alias ${ref} does not exist`);
  if (atRoot(entry.collection, mode) && target.collection !== entry.collection && target.collection.modes.length > 1) {
    throw new Error(
      `${where(entry)}: alias ${ref} at :root points into the multi-mode collection ${target.collection.name}`,
    );
  }
}

function valueOf(entry: Entry, mode: string, entries: Map<string, Entry>): string {
  const value = entry.token.valuesByMode[mode];
  if (typeof value === 'string' && ALIAS.test(value)) {
    const target = entries.get(value.slice(1, -1));
    checkAlias(entry, mode, target, value);
    return `var(${target?.variable ?? ''})`;
  }
  if (entry.token.type !== 'number') return String(value);
  const unit = entry.token.unit === 'unitless' ? '' : (entry.token.unit ?? '');
  return `${String(value)}${unit}`;
}

/**
 * The attribute that selects a mode of a collection, without `data-`: `<prefix>-<axis>` for a Theme collection, the
 * part for a Component collection, and none for Core and Structure (they have one block and no marker). The
 * selectors and the modes index both read it here, so the scheme exists once.
 */
function attrNameOf(collection: Collection, prefix: string): string | undefined {
  if (collection.tier === 2) return `${prefix}-${attributeOf(collection)}`;
  if (collection.tier === 3 && partOf(collection) !== 'structure') return partOf(collection);
  return undefined;
}

/** The value of a mode in its marker: the lowercase slug of the mode name. */
const markerValue = (mode: string): string => slug(mode);

/**
 * Tier 3: `.cck-<block>` for Structure, `.cck-<block>[data-<part>="<mode>"]` for the rest (default mode also bare).
 * A collection with `alsoFor` is emitted for those blocks too (same variables, so a second block shares the tokens).
 */
function componentSelectorsOf(collection: Collection, mode: string, prefix: string): string {
  const attrName = attrNameOf(collection, prefix);
  const blocks = [componentOf(collection), ...(collection.alsoFor ?? [])];
  return blocks
    .map((block) => {
      const root = `.${CLASS_PREFIX}-${block}`;
      if (attrName === undefined) return root;
      const marker = `${root}[data-${attrName}="${markerValue(mode)}"]`;
      return mode === collection.defaultMode ? `${root}, ${marker}` : marker;
    })
    .join(', ');
}

function selectorsOf(collection: Collection, mode: string, prefix: string): string {
  if (collection.tier === 1) return ':root';
  if (collection.tier === 3) return componentSelectorsOf(collection, mode, prefix);
  const marker = `[data-${attrNameOf(collection, prefix) ?? ''}="${markerValue(mode)}"]`;
  return mode === collection.defaultMode && collection.name !== NO_ROOT ? `:root, ${marker}` : marker;
}

function blockOf(collection: Collection, mode: string, entries: Map<string, Entry>, prefix: string): string[] {
  const lines: string[] = [];
  for (const entry of entries.values()) {
    if (entry.collection === collection) lines.push(`    ${entry.variable}: ${valueOf(entry, mode, entries)};`);
  }
  return [`  ${selectorsOf(collection, mode, prefix)} {`, ...lines, '  }'];
}

/** Merges several token files into one before indexing, so aliases can cross files. */
export function mergeTokenFiles(files: TokenFile[], sources: string[] = []): TokenFile {
  const [first] = files;
  if (!first) throw new Error('no token file given');
  files.forEach((file, index) => {
    if (file.$meta.globalPrefix !== first.$meta.globalPrefix) {
      throw new Error(
        `${sources[index] ?? `file ${String(index + 1)}`}: globalPrefix "${file.$meta.globalPrefix}" differs from "${first.$meta.globalPrefix}"`,
      );
    }
  });
  return { $meta: first.$meta, collections: files.flatMap((file) => file.collections) };
}

/**
 * Turns the token file into CSS inside `@layer cocokits`. The `scss` format puts the CSS in `@mixin tokens`
 * and adds a `$name` alias for every token. Throws an error naming the collection and token when a build check fails,
 * and naming the field when a collection has a field that is not one of `COLLECTION_FIELDS`.
 */
export function emitTokens(file: TokenFile, format: TokenFormat): string {
  const prefix = file.$meta.globalPrefix;
  for (const collection of file.collections) checkFields(collection);
  const entries = indexTokens(file);
  for (const entry of entries.values()) checkShape(entry);
  const blocks: string[] = [];
  for (const collection of file.collections) {
    // Tier 1 has one `:root` block: the default mode.
    const modes = collection.tier === 1 ? [collection.defaultMode] : collection.modes;
    for (const mode of modes) blocks.push(...blockOf(collection, mode, entries, prefix));
  }
  const css = ['@layer cocokits {', ...blocks, '}'];
  const note = `Generated by @cocokits/workspace:tokens. Do not edit.`;
  if (format === 'css') return `/* ${note} */\n${css.join('\n')}\n`;
  const lines = [`// ${note}`];
  for (const entry of entries.values()) {
    lines.push(`$${entry.variable.slice(2)}: var(${entry.variable});`);
  }
  lines.push('@mixin tokens {', ...css.map((line) => `  ${line}`), '}');
  return `${lines.join('\n')}\n`;
}

/** Throws unless the collection's `defaultMode` is one of its `modes`. */
export function checkDefaultMode(collection: Collection): void {
  if (collection.modes.includes(collection.defaultMode)) return;
  const modes = collection.modes.join(', ');
  throw new Error(`${collection.name}: defaultMode "${collection.defaultMode}" is not in the modes [${modes}]`);
}

/**
 * The modes index of a token file: one entry per collection that has a mode attribute, in file order, with the
 * attribute and the mode values the selectors use, a Component collection's `componentName` and the default mode
 * name. Throws when a default mode is not one of the modes, or when two collections of one scope (the page, or one
 * component) make the same attribute.
 */
export function modeCollectionsOf(file: TokenFile): ModeCollection[] {
  const prefix = file.$meta.globalPrefix;
  const collections: ModeCollection[] = [];
  const seen = new Map<string, string>();
  for (const collection of file.collections) {
    const attrName = attrNameOf(collection, prefix);
    if (attrName === undefined) continue;
    checkDefaultMode(collection);
    // A Component attribute selects within one component, so two components may share a name (`size`).
    const scope = collection.tier === 3 ? `${componentOf(collection)}/${attrName}` : attrName;
    const clash = seen.get(scope);
    if (clash !== undefined)
      throw new Error(`${collection.name}: the mode attribute ${attrName} is also made by ${clash}`);
    seen.set(scope, collection.name);
    collections.push({
      name: collection.name,
      attrName,
      ...(collection.tier === 3 ? { componentName: componentOf(collection) } : {}),
      modes: collection.modes.map((name) => ({ name, value: markerValue(name) })),
      defaultMode: collection.defaultMode,
    });
  }
  return collections;
}
