import { checkParity, defaultDiffersOf, defaultOf, paragraphsOf, semanticIdOf, tagsOf, withoutLinks } from './tags';
import type { ApiMemberJson, TagEntry } from './types';

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
  const remarks = [...rest, ...tagsOf(raw.tags, 'remarks').map(withoutLinks)].filter((text) => text !== '');
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
