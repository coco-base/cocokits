import { memberOf } from '../api-docs-common/member';
import { readType } from '../api-docs-common/read-type';
import {
  checkPartDoc,
  frameworkOnlyOf,
  paragraphsOf,
  parseSlotTag,
  partsOf,
  sectionOf,
  tagsOf,
  templateOf,
} from '../api-docs-common/tags';
import type { ApiMemberJson, ApiPartJson, ApiSlotJson, TagEntry } from '../api-docs-common/types';
import type { MemberInfo } from './members';

/** The fields of a member entry of `getApiDocumentation` that the conversion reads. */
export interface DocMember {
  readonly name: string;
  readonly type?: string;
  readonly description: string;
  readonly jsdocTags: readonly TagEntry[];
  readonly signatures?: readonly {
    readonly params: readonly { readonly name: string; readonly type: string; readonly isOptional: boolean }[];
    readonly returnType: string;
  }[];
}

/** The fields of a directive or component entry of `getApiDocumentation` that the conversion reads. */
export interface DocDirective {
  readonly name: string;
  readonly selector: string;
  readonly description: string;
  readonly jsdocTags: readonly TagEntry[];
  readonly members: readonly DocMember[];
}

function typeOf(info: MemberInfo, doc: DocMember, expand: (type: string) => string): string {
  const [signature] = doc.signatures ?? [];
  if (info.kind === 'method' && signature) {
    const params = signature.params.map((param) => `${param.name}${param.isOptional ? '?' : ''}: ${param.type}`);
    return `(${params.join(', ')}) => ${signature.returnType}`;
  }
  return expand(readType(doc.type ?? 'unknown'));
}

/** `ApiMember` of one member, or undefined when the member has no TSDoc (the caller reports it). */
function angularMemberOf(
  componentName: string,
  info: MemberInfo,
  doc: DocMember,
  expand: (type: string) => string,
  owner: string,
  problems: string[],
): ApiMemberJson | undefined {
  return memberOf(
    componentName,
    {
      name: info.publicName,
      type: typeOf(info, doc, expand),
      required: info.required,
      description: doc.description,
      tags: doc.jsdocTags,
    },
    owner,
    problems,
  );
}

/** The slots of a class, from its `@cckSlot` tags. A malformed tag is added to `problems`. */
function slotsOf(componentName: string, entry: DocDirective, problems: string[]): ApiSlotJson[] {
  const slots: ApiSlotJson[] = [];
  for (const text of tagsOf(entry.jsdocTags, 'cckSlot')) {
    const slot = parseSlotTag(text);
    if (slot === undefined) {
      problems.push(
        `${entry.name}: "@cckSlot ${text}" needs the shape "@cckSlot <name> [<selector>] - <description>", and the default slot has no selector`,
      );
      continue;
    }
    slots.push({
      name: slot.name,
      semanticId: `${componentName}.${slot.name}`,
      type: 'content',
      required: false,
      description: slot.description,
      ...(slot.selector === undefined ? {} : { selector: slot.selector }),
    });
  }
  return slots;
}

/** The ApiMember list a kind goes to. A model is a prop (its output side is `bindings`). */
export function listOf(kind: MemberInfo['kind']): 'props' | 'events' | 'methods' {
  if (kind === 'input' || kind === 'model') return 'props';
  return kind === 'output' ? 'events' : 'methods';
}

/**
 * `ApiPart` of a public directive or component. `members` are the public members of the class and of every class it
 * extends. Every problem is added to `problems` (a missing `@cckPart`, a missing TSDoc), so one run reports all.
 */
export function partOf(
  componentName: string,
  entry: DocDirective,
  members: readonly MemberInfo[],
  problems: string[],
  expand: (type: string) => string = (type) => type,
): ApiPartJson {
  const part = checkPartDoc(entry.name, entry.jsdocTags, entry.description, problems);
  const [, ...renders] = partsOf(entry.jsdocTags);
  const noElement = tagsOf(entry.jsdocTags, 'cckNoElement').length > 0;
  const section = sectionOf(entry.jsdocTags);
  if (section === null) {
    problems.push(`${entry.name}: "@cckSection" needs the shape "@cckSection <part> <slot> <input>"`);
  }
  const template = templateOf(entry.jsdocTags);
  // The members of a part other than the root carry the part in their semantic id (`tabs.trigger.disabled`).
  const idScope = part === 'root' || part === '' ? componentName : `${componentName}.${part}`;
  const result: ApiPartJson = {
    name: entry.name,
    semanticId: `${componentName}.${part}`,
    selector: entry.selector,
    ...(noElement ? {} : { anatomyPart: part }),
    ...(renders.length > 0 ? { renders } : {}),
    ...(section ? { section } : {}),
    ...(template === undefined ? {} : { templateSelector: template }),
    ...frameworkOnlyOf(entry.name, entry.jsdocTags, problems),
    description: paragraphsOf(entry.description)[0] ?? '',
    props: [],
    events: [],
    slots: slotsOf(componentName, entry, problems),
    methods: [],
  };
  const bindings: NonNullable<ApiPartJson['bindings']> = [];
  for (const info of members) {
    const doc = entry.members.find((candidate) => candidate.name === info.name);
    const member = doc ? angularMemberOf(idScope, info, doc, expand, entry.name, problems) : undefined;
    if (member === undefined) {
      problems.push(`${entry.name}.${info.publicName}: no TSDoc description (declared in ${info.declaredIn})`);
      continue;
    }
    result[listOf(info.kind)].push(member);
    if (info.kind === 'model') {
      bindings.push({ semanticId: member.semanticId, value: member.name, syntax: `[(${member.name})]` });
    }
  }
  if (bindings.length > 0) result.bindings = bindings;
  return result;
}
