import {
  checkParity,
  defaultDiffersOf,
  defaultOf,
  groupOf,
  isShared,
  paramRemarksOf,
  paragraphsOf,
  semanticIdOf,
  tagsOf,
  valuesOf,
  withoutLinks,
} from './tags';
import type { ApiMemberJson, ApiValueJson, TagEntry } from './types';

/**
 * Whether a type text is a function type, also in parentheses: `(value: string) => void`, `(() => void)`. A type in
 * parentheses that starts with anything but a parameter list, such as `('a' | 'b')[]`, is none.
 */
const isFunctionType = (type: string): boolean =>
  /^\(*\s*(?:\)|\.\.\.|[\w$]+\??\s*[:,)])/.test(type.trim()) && type.includes('=>');

/** What an extractor read of a member, before it becomes an `ApiMember`. */
export interface RawMember {
  /** The name a consumer uses. */
  readonly name: string;
  /** The type a reader sees (api-extraction.md, "Read type"). */
  readonly type: string;
  readonly required: boolean;
  /** The TSDoc text without its tags. */
  readonly description: string;
  readonly tags: readonly TagEntry[];
  /** Used when the TSDoc has no `@defaultValue`; the tag wins over a default in the source. */
  readonly sourceDefault?: string | undefined;
  /** The `@cckValue` meanings of the alias the type names (`aliasValuesOf`); the member's own tags win. */
  readonly aliasValues?: readonly ApiValueJson[];
}

/**
 * The optional fields a member's tags add: `group` (`@cckGroup`), `shared` (`@cckShared`) and `values` (`@cckValue`,
 * else the meanings of the alias its type names). A malformed `@cckValue` adds a problem naming `label`.
 */
function tagFieldsOf(
  raw: RawMember,
  label: string,
  problems: string[],
): Pick<ApiMemberJson, 'group' | 'shared' | 'values'> {
  const { tags } = raw;
  const group = groupOf(tags);
  const own = valuesOf(tags, label, problems);
  const values = own.length > 0 ? own : [...(raw.aliasValues ?? [])];
  return {
    ...(group === undefined ? {} : { group }),
    ...(isShared(tags) ? { shared: true } : {}),
    ...(values.length > 0 ? { values } : {}),
  };
}

/**
 * `ApiMember` of one member, or undefined when the member has no TSDoc (the caller reports it). A `@cckDefaultDiffers`
 * tag without a reason, a `@cckSemantic none` without a `@cckParity` reason and an empty `@cckParity` add a problem
 * naming `owner`. Links in the text are written as plain text.
 */
export function memberOf(
  componentName: string,
  raw: RawMember,
  owner: string,
  problems: string[],
): ApiMemberJson | undefined {
  const [description, ...rest] = paragraphsOf(raw.description);
  if (description === undefined) return undefined;
  // A function member (a method or a callback) shows the text of its parameters after its remarks.
  const params = isFunctionType(raw.type) ? paramRemarksOf(raw.tags) : [];
  const remarks = [...rest, ...tagsOf(raw.tags, 'remarks').map(withoutLinks), ...params].filter((text) => text !== '');
  const [deprecatedText] = tagsOf(raw.tags, 'deprecated');
  const deprecated = deprecatedText === undefined ? undefined : withoutLinks(deprecatedText);
  checkParity(`${owner}.${raw.name}`, raw.tags, problems);
  const examples = tagsOf(raw.tags, 'example');
  const defaultDiffers = defaultDiffersOf(raw.tags);
  if (defaultDiffers === '') {
    problems.push(`${owner}.${raw.name}: "@cckDefaultDiffers" needs a reason ("@cckDefaultDiffers <reason>")`);
  }
  const fallback = defaultOf(raw.tags) ?? raw.sourceDefault;
  return {
    name: raw.name,
    semanticId: semanticIdOf(componentName, raw.name, raw.tags),
    type: raw.type,
    ...(fallback === undefined ? {} : { default: fallback }),
    required: raw.required,
    ...(defaultDiffers === undefined || defaultDiffers === '' ? {} : { defaultDiffers }),
    description,
    ...(remarks.length > 0 ? { remarks: remarks.join('\n\n') } : {}),
    ...(deprecated === undefined ? {} : { deprecated: deprecated === '' ? 'Deprecated.' : deprecated }),
    ...(examples.length > 0 ? { examples } : {}),
    ...tagFieldsOf(raw, `${owner}.${raw.name}`, problems),
  };
}

/**
 * The type text of an optional member without its closing `| undefined`: the read type, not what a writer may pass.
 * Only the last union member goes, so an `undefined` inside a function type stays.
 */
export function withoutUndefined(typeText: string, isRequired: boolean): string {
  if (isRequired) return typeText;
  const cleaned = typeText.replace(/\s*\|\s*undefined$/, '').trim();
  return cleaned === '' ? typeText : cleaned;
}
