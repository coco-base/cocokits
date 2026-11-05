import type { ApiDocJson, ApiMemberJson, ApiPartJson, ApiSlotJson } from '../api-docs-common/types';

/** What a parity run found: `failures` fail the target, `reports` are printed only. */
export interface ParityResult {
  failures: string[];
  reports: string[];
}

type Kind = 'props' | 'events' | 'slots' | 'methods';
const KINDS: readonly Kind[] = ['props', 'events', 'slots', 'methods'];
/** The semantic id of a member that exists in one framework by design (`@cckSemantic none`). */
const BY_DESIGN = 'none';

type ByFramework<T> = Map<string, T>;

/**
 * Semantic ids a framework lacks by design, for a reason that is no single member. The Angular Accordion keeps its open
 * state on each item (the `expanded` model, tagged `none`) and is always vertical, collapsible and mounted, so React and
 * Vue have the root members and the item key that Angular has no input for. The Angular Tooltip follows Material and has no
 * open model and no change output, which the playground controls still need for React and Vue (`tooltip.open`,
 * `tooltip.openChange`), so `none` would drop them. Angular selects a tab by its index, so the Angular tab and its section
 * have no value, and no `forceMount` (the root keeps every panel with `preserveContent`); the Angular nav takes the panel
 * directive itself, not its id. The Angular `ng-template[cckTabContent]` slot has no counterpart in React and Vue (the
 * content is the children), and neither has the default slot Angular copies onto the indicator it renders: the React and
 * Vue indicators take no content. The Angular Select takes the labels from the
 * text of its options and matches the text of the option itself, and it has no `open` model (Material's methods are
 * tagged `none`), so React and Vue have `items`, `itemToStringLabel`, `open` and the item `textValue` that Angular has
 * no input for; its `ng-template[cckSelectTrigger]` is the `Select.Value` children of React and the default slot of the Vue
 * `SelectValue`. Material's Dialog is always modal and keeps nothing mounted, and Angular gets no keep-mounted option, so the
 * `modal` switch of the Dialog and the Popover and the `forceMount` of the Dialog, Popover, Tooltip and Select contents are
 * React and Vue only.
 */
const LACKING_BY_DESIGN: ReadonlyMap<string, ReadonlySet<string>> = new Map([
  ...[
    'accordion.type',
    'accordion.value',
    'accordion.valueChange',
    'accordion.collapsible',
    'accordion.disabled',
    'accordion.orientation',
    'accordion.item.value',
    'accordion.content.forceMount',
    'dialog.modal',
    'dialog.content.forceMount',
    'popover.modal',
    'popover.content.forceMount',
    'tooltip.content.forceMount',
    'select.content.forceMount',
    'tooltip.open',
    'tooltip.openChange',
    'tabs.trigger.value',
    'tabs.panel.value',
    'tabs.panel.forceMount',
    'tab-nav.tabPanel',
    'select.items',
    'select.itemToStringLabel',
    'select.open',
    'select.option.textValue',
  ].map((id): [string, ReadonlySet<string>] => [id, new Set(['angular'])]),
  ...['tabs.content', 'tabs.default', 'tab-nav.default', 'select.trigger'].map((id): [string, ReadonlySet<string>] => [
    id,
    new Set(['react', 'vue']),
  ]),
]);

/**
 * Semantic ids whose `required` and `default` are not compared: Radix requires the Accordion `type` and Reka infers it
 * from the value (default `single`), so React and Vue differ by design.
 */
const NOT_COMPARED: ReadonlySet<string> = new Set(['accordion.type']);

/**
 * Whether the last segment of a semantic id is a native `aria-*` attribute (`tabs.list.aria-label`). Vue takes such an
 * attribute as a fall-through attribute and declares no member for it, so it does not need one.
 */
const isAriaId = (id: string): boolean => /(^|\.)aria-[a-z]+$/.test(id);

const list = (frameworks: Iterable<string>): string => [...frameworks].sort().join(', ');

function push<K, V>(map: Map<K, V[]>, key: K, value: V): void {
  const items = map.get(key);
  if (items) items.push(value);
  else map.set(key, [value]);
}

/**
 * Whether a member is the controlled `value` prop of React: without it the component is uncontrolled and `defaultValue`
 * carries the start value, so it has no default to compare.
 */
const isReactControlledValue = (framework: string, member: ApiMemberJson): boolean =>
  framework === 'react' && member.name === 'value';

/**
 * The default of a member as compared. A heading level is a number in Angular (`headingLevel` of the item, `3`) and an
 * element in React and Vue (`'h3'`): `'h3'` and `3` are the same default for the id `*.headingLevel`.
 */
const defaultOf = (id: string, member: ApiMemberJson): string | undefined =>
  id.endsWith('.headingLevel') ? member.default?.replace(/^'h([1-6])'$/, '$1') : member.default;

/** A member with the name of the part that declares it. */
interface PartMember {
  member: ApiMemberJson;
  part: string;
}

/** The members of one kind by semantic id, over all parts of one id in one framework. */
function membersById(parts: readonly ApiPartJson[], kind: Kind): Map<string, PartMember[]> {
  const result = new Map<string, PartMember[]>();
  for (const part of parts) {
    for (const member of part[kind]) {
      if (member.semanticId !== BY_DESIGN) push(result, member.semanticId, { member, part: part.name });
    }
  }
  return result;
}

/**
 * The names of the scope fields of the slot in each framework must be the same; the types are only reported. A field
 * tagged `@cckSemantic none` (`semanticId: 'none'`) exists in one framework by design and is left out.
 */
function compareScopes(
  label: string,
  entries: readonly { framework: string; member: ApiMemberJson }[],
  result: ParityResult,
): void {
  const names = entries.map((entry) => [
    entry.framework,
    ((entry.member as ApiSlotJson).scope ?? [])
      .filter((field) => field.semanticId !== BY_DESIGN)
      .map((field) => field.name)
      .sort()
      .join(', ') || 'none',
  ]);
  if (new Set(names.map(([, fields]) => fields)).size > 1) {
    result.failures.push(
      `${label} scope differs: ${names.map(([framework, fields]) => `${String(framework)} ${String(fields)}`).join('; ')}`,
    );
  }
}

const FIELDS = ['required', 'default'] as const;

interface Entry {
  framework: string;
  member: ApiMemberJson;
  part: string;
}

/**
 * Compares `required` or `default` of the members with one semantic id. A default that differs by design is tagged
 * `@cckDefaultDiffers <reason>` on every member that has one: it is reported, not failed.
 */
function compareField(
  label: string,
  id: string,
  field: (typeof FIELDS)[number],
  entries: readonly Entry[],
  result: ParityResult,
): void {
  const compared =
    field === 'default' ? entries.filter((entry) => !isReactControlledValue(entry.framework, entry.member)) : entries;
  const reference = compared[0];
  if (!reference) return;
  const valueOf = (entry: Entry): string | boolean | undefined =>
    field === 'default' ? defaultOf(id, entry.member) : entry.member[field];
  const other = compared.find((entry) => valueOf(entry) !== valueOf(reference));
  if (!other) return;
  const show = (entry: Entry): string => `${entry.framework} ${entry.part} ${String(entry.member[field])}`;
  const message = `${label} ${field} differs: ${show(reference)}, ${show(other)}`;
  const byDesign = field === 'default' && compared.every((entry) => entry.member.defaultDiffers !== undefined);
  if (byDesign) result.reports.push(`${message} (by design: ${reference.member.defaultDiffers ?? ''})`);
  else result.failures.push(message);
}

function compareMembers(
  where: string,
  kind: Kind,
  perFramework: ByFramework<Map<string, PartMember[]>>,
  result: ParityResult,
): void {
  const ids = new Set([...perFramework.values()].flatMap((byId) => [...byId.keys()]));
  for (const id of [...ids].sort()) {
    const has = [...perFramework].filter(([, byId]) => byId.has(id));
    const label = `${where} ${kind} "${id}"`;
    if (id === '') result.failures.push(`${where} ${kind}: a member has no semantic id`);
    if (has.length < perFramework.size) {
      const lacking = [...perFramework.keys()].filter(
        (framework) =>
          !has.some(([name]) => name === framework) &&
          !(framework === 'vue' && isAriaId(id)) &&
          !LACKING_BY_DESIGN.get(id)?.has(framework),
      );
      if (lacking.length > 0) {
        result.failures.push(`${label} exists in ${list(has.map(([name]) => name))} only, not in ${list(lacking)}`);
      }
    }
    const entries = has.flatMap(([framework, byId]) =>
      (byId.get(id) ?? []).map(({ member, part }) => ({ framework, member, part })),
    );
    const first = entries[0];
    if (!first) continue;
    if (!NOT_COMPARED.has(id)) for (const field of FIELDS) compareField(label, id, field, entries, result);
    if (kind === 'slots') compareScopes(label, entries, result);
    const types = new Map<string, string>();
    for (const entry of entries) if (!types.has(entry.framework)) types.set(entry.framework, entry.member.type);
    if (new Set(types.values()).size > 1) {
      result.reports.push(`${label} type differs: ${[...types].map(([name, type]) => `${name} ${type}`).join('; ')}`);
    }
  }
}

/** The anatomy part a member belongs to: the part id in its semantic id (`tabs.trigger.disabled`), else the part it sits on. */
function ownerOf(component: string, member: ApiMemberJson, own: string, known: ReadonlySet<string>): string {
  const [head, name] = member.semanticId.slice(component.length + 1).split('.', 2);
  return member.semanticId.startsWith(`${component}.`) && name !== undefined && head !== undefined && known.has(head)
    ? `${component}.${head}`
    : own;
}

/**
 * The parts an Angular part stands for, one per semantic id: its own, the parts it renders (`renders`) and the part its
 * section stands for (`section`). A member goes to the part its semantic id names (`tabs.list.aria-label` on `CckTabs`
 * belongs to the list; `tabs.trigger.disabled` on `CckTab` belongs to the trigger), so the React and Vue parts are
 * compared with the Angular members that reach them. Three members reach more than the part they sit on:
 *
 * - the slot a section feeds (`CckTab`: `header`) belongs to the part the section stands for, the trigger;
 * - the `value` of a section is the key of both of its halves, so the trigger has it as well (`tabs.trigger.value`);
 * - the default slot of a part that renders others is also the default slot of each of them (`tabs.default` of
 *   `CckTabs` is the content of the list).
 */
function angularViews(
  component: string,
  doc: ApiDocJson,
  known: ReadonlySet<string>,
  others: ReadonlySet<string>,
): [string, ApiPartJson][] {
  const partIds = (part: ApiPartJson): string[] => {
    const rendered = (part.renders ?? []).filter((id) => others.has(id)).map((id) => `${component}.${id}`);
    const sectionId = part.section === undefined ? undefined : `${component}.${part.section.partName}`;
    return [...new Set([part.semanticId, ...rendered, ...(sectionId === undefined ? [] : [sectionId])])];
  };
  const views = doc.parts.flatMap((part) => {
    // A part an Angular directive renders is a part of the component only where React and Vue have it too: the anatomy
    // parts a Radio lists for its own markup are no parts of the API.
    const rendered = (part.renders ?? []).filter((id) => others.has(id)).map((id) => `${component}.${id}`);
    const sectionId = part.section === undefined ? undefined : `${component}.${part.section.partName}`;
    const ids = [part.semanticId, ...rendered];
    if (sectionId !== undefined) ids.push(sectionId);
    return [...new Set(ids)].map((id): [string, ApiPartJson] => {
      const pick = (members: ApiMemberJson[]): ApiMemberJson[] =>
        members.filter((member) => ownerOf(component, member, part.semanticId, known) === id);
      const pickSlots = (slots: ApiSlotJson[]): ApiSlotJson[] =>
        slots.filter((slot) => {
          if (slot.name === part.section?.slotName) return id === sectionId;
          return (
            ownerOf(component, slot, part.semanticId, known) === id ||
            (slot.name === 'default' && rendered.includes(id))
          );
        });
      const keyOfSection = (): ApiMemberJson[] =>
        id === sectionId && id !== part.semanticId
          ? part.props.filter((prop) => prop.name === 'value').map((prop) => ({ ...prop, semanticId: `${id}.value` }))
          : [];
      return [
        id,
        {
          ...part,
          semanticId: id,
          props: [...pick(part.props), ...keyOfSection()],
          events: pick(part.events),
          slots: pickSlots(part.slots),
          methods: pick(part.methods),
        },
      ];
    });
  });
  return [...views, ...membersOfOtherParts(component, doc, known, new Set(views.map(([id]) => id)), partIds)];
}

/**
 * A member whose semantic id names a part other than the ones its class stands for, and that the Angular doc has as a
 * part of its own, belongs to that part: the `message` input of the root `CckTooltip` is `tooltip.content.aria-label`,
 * the label of the content part `CckTooltipContent`. One view per such part carries the members that reach it.
 */
function membersOfOtherParts(
  component: string,
  doc: ApiDocJson,
  known: ReadonlySet<string>,
  viewIds: ReadonlySet<string>,
  partIds: (part: ApiPartJson) => string[],
): [string, ApiPartJson][] {
  const extra = new Map<string, ApiPartJson>();
  for (const part of doc.parts) {
    const own = partIds(part);
    for (const kind of ['props', 'events', 'methods'] as const) {
      for (const member of part[kind]) {
        const owner = ownerOf(component, member, part.semanticId, known);
        if (own.includes(owner) || !viewIds.has(owner)) continue;
        const view = extra.get(owner) ?? { ...part, semanticId: owner, props: [], events: [], slots: [], methods: [] };
        view[kind].push(member);
        extra.set(owner, view);
      }
    }
  }
  return [...extra];
}

/**
 * An Angular `model()` is also an output, `<name>Change`, which emits the new value. It is the change event of the model
 * (React `onOpenChange`, Vue `update:open`), so a part whose binding has no event with the id `<model>Change` has it
 * through the model output (a model tagged `@cckSemantic none` has none). A part that lists its own event for the id (`valueChangeDetails`) keeps that one.
 */
function withModelOutputs(doc: ApiDocJson): ApiDocJson {
  return {
    ...doc,
    parts: doc.parts.map((part) => {
      const outputs = (part.bindings ?? []).flatMap((binding): ApiMemberJson[] => {
        // A model that exists in one framework by design (`@cckSemantic none`) has no event to share.
        if (binding.semanticId === BY_DESIGN) return [];
        const semanticId = `${binding.semanticId}Change`;
        const model = part.props.find((prop) => prop.semanticId === binding.semanticId);
        const listed = part.events.some((event) => event.semanticId === semanticId);
        return listed || model === undefined
          ? []
          : [
              {
                name: `${binding.value}Change`,
                semanticId,
                type: model.type,
                required: false,
                description: model.description,
              },
            ];
      });
      return outputs.length === 0 ? part : { ...part, events: [...part.events, ...outputs] };
    }),
  };
}

function compareComponent(component: string, docs: readonly ApiDocJson[], result: ParityResult): void {
  const frameworks = new Set(docs.map((doc) => doc.framework));
  if (frameworks.size < 2) {
    result.reports.push(`${component}: only ${list(frameworks)} has an ApiDoc, nothing to compare`);
    return;
  }
  const known = new Set(docs.flatMap((doc) => doc.parts.map((part) => part.semanticId.slice(component.length + 1))));
  const otherParts = new Set(
    docs
      .filter((doc) => doc.framework !== 'angular')
      .flatMap((doc) => doc.parts.map((part) => part.semanticId.slice(component.length + 1))),
  );
  const partsOf: ByFramework<Map<string, ApiPartJson[]>> = new Map();
  for (const doc of docs) {
    const byId = partsOf.get(doc.framework) ?? new Map<string, ApiPartJson[]>();
    const views: [string, ApiPartJson][] =
      doc.framework === 'angular'
        ? angularViews(component, withModelOutputs(doc), known, otherParts)
        : doc.parts.map((part) => [part.semanticId, part]);
    for (const [id, part] of views) push(byId, id, part);
    partsOf.set(doc.framework, byId);
  }
  const partIds = new Set([...partsOf.values()].flatMap((byId) => [...byId.keys()]));
  for (const id of [...partIds].sort()) {
    const where = id;
    const has = [...partsOf].filter(([, byId]) => byId.has(id)).map(([framework]) => framework);
    // A part tagged `@cckSemantic none` exists in some frameworks only by design; its members are compared among those.
    const frameworkOnly = [...partsOf.values()].every((byId) => (byId.get(id) ?? []).every((p) => p.frameworkOnly));
    if (has.length < frameworks.size && !frameworkOnly) {
      result.failures.push(`${where}: the part exists in ${list(has)} only`);
      continue;
    }
    const parts: ByFramework<ApiPartJson[]> = new Map(
      [...partsOf].filter(([, byId]) => byId.has(id)).map(([f, byId]) => [f, byId.get(id) ?? []]),
    );
    for (const kind of KINDS) {
      compareMembers(where, kind, new Map([...parts].map(([f, p]) => [f, membersById(p, kind)])), result);
    }
  }
}

/**
 * Compares the `ApiDoc` files of one or more components across frameworks, by semantic id. A part or a member that exists
 * in one framework only, and a `required` or `default` difference, fail; a type difference is only reported.
 */
export function compareApiDocs(docs: readonly ApiDocJson[]): ParityResult {
  const result: ParityResult = { failures: [], reports: [] };
  const byComponent = new Map<string, ApiDocJson[]>();
  for (const doc of docs) push(byComponent, doc.component, doc);
  for (const component of [...byComponent.keys()].sort()) {
    compareComponent(component, byComponent.get(component) ?? [], result);
  }
  return result;
}
