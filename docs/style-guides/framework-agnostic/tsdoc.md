# TSDoc and documentation prose

Purpose: the TSDoc rules on public API (what needs a block, summaries, tags, per framework) and how documentation prose is written. The API is written once, as TSDoc ([architecture §8](../../architecture.md#8-single-source-of-truth)); the extractors that read it and the tags they depend on are in [api-extraction.md](../workspace/api-extraction.md). The framework specifics are in the [Angular](../angular/tsdoc.md), [React](../react/tsdoc.md) and [Vue](../vue/tsdoc.md) guides.

## Prose style

- **Audience:** a developer who knows their framework but not CocoKits.
- **Short sentences, active voice, present tense.** "Focus moves with the arrow keys", not "Focus will be moved ...".
- **One idea per paragraph.** Use a list or table for three or more parallel items.
- **Name things exactly as in code:** part names, attributes (`data-selected`), props. Code in backticks.
- **Framework-neutral prose.** When behaviour differs per framework, say so once.
- **No marketing words** ("powerful", "seamless", "simply", "just").
- **Accessibility is part of every example:** examples have accessible names; the text never suggests removing focus outlines or roles.
- **Examples are illustrative.** Name a component only as an example of a rule; never describe a component's behaviour that is not implemented ([architecture.md](../../architecture.md)).
- **No versions** of frameworks or tools in prose. Why: [tooling](../../why/tooling.md).

## TSDoc rules (all frameworks)

- Document every public class, part, prop/input/model/output/event, slot and method. The first sentence is the summary.
- Booleans start with "Whether ...". Events, emits and callbacks say when they fire ("Emits when the user selects a tab; never when `value` changes from outside").
- `@defaultValue` on every optional prop whose default is not obvious from the type or initialiser.
- `@example` with one minimal real usage on each component class or root part, in that framework's authoring shape ([architecture §5](../../architecture.md#5-selectors-and-component-shape-angular-compound-components-all-frameworks)).
- `@deprecated <replacement>` on deprecated members; `@internal` hides registration APIs and adapter helpers, and marks symbols exported only for sibling packages; `@see` the APG link on the machine; `@remarks` for longer behaviour notes.
- Document machine `Props` once, in `packages/machines/<name>/<name>.types.ts`. Framework packages extend or re-export the type and never repeat the text. Those names are the semantic ids.
- Overlay content parts say in their summary that they render in the overlay container, not next to the trigger ([why/overlays.md](../../why/overlays.md)).
- Do not restate the type in prose ("A string that ..."); document behaviour ("Emits on blur so forms can mark the field touched").
- CSS variables a part sets are documented in that part's TSDoc. Keep comments in sync with the code in the same change; a comment that describes removed behaviour is a bug.
- Theme options come from each theme's `ThemeConfig`, not from TSDoc on the base component. Decide from the component code and the theme config which inputs or props come from the theme and which from the base component, and document only the base component's. A theme layer's own option has a one-sentence summary only, with no `@defaultValue` and no list of values: the default and the values live only in `ThemeConfig`, and consumers read them there.
- Do not document `data-*`, keyboard behaviour or expected roles here; they live in `<name>.meta.ts`.

```ts
// Incorrect
/** disabled */                          disabled?: boolean;   // no sentence, no behaviour
/** A string or undefined. */            value?: string;       // restates the type

// Correct
/**
 * Whether the trigger is disabled. Disabled triggers are skipped by arrow-key navigation.
 * @defaultValue false
 */
disabled?: boolean;
/** The value of the selected tab (controlled). `undefined` means uncontrolled. */
value?: string;
```

## Per framework

**Angular.** TSDoc on every exported class, input, `model()`, output and `exportAs` method. Class docs carry one `@example` (content projection for compound components), `@cckPart <part>` (the anatomy part the host renders) and `@cckDataAttr <attr> - <values | "present when ...">` per state attribute; the spec is the source, the tag is a pointer. Each section's inputs are documented on its own class; the DI registration API is `@internal`.

```ts
/**
 * Shows one panel of content at a time, selected by a row of tabs.
 * @example
 * <div cckTabs [(selectedIndex)]="tab" aria-label="Account settings">
 *   <div cckTab label="Account">Account settings</div>
 * </div>
 * @cckPart root
 * @cckDataAttr data-orientation - horizontal | vertical
 */
@Component({ selector: 'cck-tabs' })
export class CckTabs {
  /** The index of the selected tab, in the order of the tabs. Use `[(selectedIndex)]` for two-way binding. */
  readonly selectedIndex = model<number | null>(null);
  /** Emits when the user selects a tab; never when `selectedIndex` changes from outside. */
  readonly selectedTabChange = output<CckTabChangeEvent>();
}
```

**React.** Comments go on the exported `Props` interface of each part; machine props are picked or extended, not re-documented, and a `Pick` of a machine prop keeps the machine's text and `@defaultValue`. Each part's component names the rendered element ("Renders a `<button role="tab">`.") and carries `@cckPart <part>`, which gives the part its semantic id; the root has an `@example`. A callback prop named `on<Thing>` (`onValueChange`) is listed as an event and takes the event's semantic id with `@cckSemantic`. A prop that exists in React only (`render`, `nativeButton`) carries `@cckSemantic none` and a one-line `@remarks`. Every component sets `displayName = '<Component>.<Part>'`; every public `Props` type is exported by name. The extraction takes the exported components with a capitalised name (a hook is not a part, `@internal` hides one) and fails on a part without `@cckPart` or a description and on a listed prop without TSDoc.

**Vue.** Type-based `defineProps<...>()` with interfaces from `<component>.types.ts` (the comments there are what `vue-component-meta` reads); `defineEmits<...>()` in named-tuple form with a comment per event, declared as a `<Name>Emits` type in the same file (the checker drops a comment written inline); `defineSlots<{ ... }>()` with a comment per slot and slot prop. The exported `<Name>Props` type carries `@cckPart <part>` and the part's summary. A default is the `@defaultValue` tag, which wins over `withDefaults` (a `withDefaults` value is used only when the TSDoc has no tag, and `undefined` is no default). Global props (`key`, `ref`) are not listed. A prop that exists in Vue only (`as`, `asChild`) carries `@cckSemantic none` and a one-line `@remarks`.

```ts
export type TabsRootEmits = {
  /**
   * Emitted with the new value for `v-model`.
   * @cckSemantic tabs.valueChange
   */
  'update:modelValue': [value: string]
}
```

## What is not extracted

From `<name>.meta.ts`: `data-*` per part and values, CSS variables per part, keyboard table, expected roles and ARIA (test expectations), APG link. From the anatomy: parts and classes. From `ThemeConfig`: theme options. The examples above are illustrative; a component's real API comes from its implemented, tested contract.
