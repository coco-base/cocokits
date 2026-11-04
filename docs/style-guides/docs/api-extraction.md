# API reference from source code

Purpose: how the API tables are produced and the TSDoc rules the extractors depend on. The API is written once, as TSDoc ([architecture §8](../../architecture.md#8-single-source-of-truth)); the site never holds a hand-written props list.

Each framework's extraction is the `api-docs` target of its package in [targets.md](../workspace/targets.md) (`angular:api-docs`, `react:api-docs`, `vue:api-docs`); a framework whose package has no `api-docs` target reports its extraction `not available`.

## Pipeline

| Source | Extractor | Output |
|---|---|---|
| `@cocokits/angular/<component>` | The Angular compiler's docs extractor (`NgtscProgram.getApiDocumentation`) through the executor `@cocokits/workspace:api-docs-angular` (target `angular:api-docs`): inputs, `model()`s, outputs, selectors | `packages/angular/src/generated/api-docs/<component>.json` |
| `@cocokits/vue/<component>` | `vue-component-meta` through the executor `@cocokits/workspace:api-docs-vue` (target `vue:api-docs`): props, emits, slots, exposed methods; a `v-model` prop gets a binding | `packages/vue/src/generated/api-docs/<component>.json` |
| `@cocokits/react/<component>` | The TypeScript checker through the executor `@cocokits/workspace:api-docs-react` (target `react:api-docs`): the props of each exported component that a CocoKits file declares (native button props, `ref` and DOM types are not listed) | `packages/react/src/generated/api-docs/<component>.json` |
| machines, cdk, utils, shared | The TypeScript compiler through API Extractor's doc model | `packages/<project>/src/generated/api-docs/<entry>.json` |

Each project writes only into its own `src/generated/api-docs/` folder (git-ignored, the Nx output of its `api-docs` target); nothing generated lives in a `dist/` folder. Theme directives are not extracted: their options come from the theme's `ThemeConfig`. The extraction fails on missing TSDoc. A parity check compares the Angular, React and Vue files per component by semantic id and fails on a part, or a `props`, `events`, `slots` or `methods` member, that exists in one framework only, and on a `required` or `default` difference (a React controlled `value` prop is compared without its default, because React has `defaultValue` for the start value, [why](../../why/tooling.md#react-api-through-the-typescript-checker)). Type differences are reported only, because the spellings of types differ across frameworks. A React props type that is a union of interfaces (`type: 'single'` or `type: 'multiple'`) is read branch by branch and merged: the types of a member are joined with `|`, and a member of some branches only is optional. A React or Vue part is present in Angular when an Angular part has its semantic id, lists it in `renders` (where React and Vue have the part too) or names it in `section`; members are compared with the Angular members whose semantic id names that part, and the field names of a slot's `scope` must agree, except for a scope field tagged `@cckSemantic none` (see Scoped slots). An Angular `model()` is also an output `<name>Change` that emits the new value, so for the parity check a part with a `bindings` entry whose id has no event `<id>Change` of its own has that event through the model output: React `onOpenChange`, Vue `update:open` and the Angular `open` model share the id `dialog.openChange`. A model tagged `@cckSemantic none` (the Accordion item `expanded`) has no such event. A semantic id can name a part other than the one that declares the member, when the Angular directive renders that part: the heading level is `accordion.header.headingLevel` on the Angular item (it renders the header) and on the React and Vue Header, and its default is compared as a level (`3` and `'h3'` agree). A member that a framework lacks by design is listed in `LACKING_BY_DESIGN` of `api-parity/compare.ts`, with the frameworks that lack it (the Accordion `type`, `value`, `valueChange`, `collapsible`, `disabled`, `orientation`, item `value` and content `forceMount`: the Angular Accordion keeps its open state on each item, so React and Vue carry them and Angular does not; the Tabs trigger and panel `value` and the panel `forceMount`, which Angular replaces by the index and `preserveContent`; the Tab nav `tabPanel`, which Angular takes as the panel directive; and in React and Vue the `tabs.content` slot of the Angular `ng-template[cckTabContent]` and the default slot Angular copies onto the indicator it renders), and the `required` flag and default of the Accordion `type` are not compared, because Radix requires it and Reka infers it (`NOT_COMPARED`). A member whose semantic id names another part (`tooltip.content.aria-label`) belongs to that part when the Angular doc has it as a part of its own, even if its class is a different one: the `message` input of the root `CckTooltip` is the label of `CckTooltipContent`. Differences by design are in the next section. A semantic id whose last segment is a native `aria-*` attribute (`tabs.list.aria-label`) is not required in Vue, which takes `aria-label`, `aria-labelledby` and `aria-describedby` as fall-through attributes and declares no prop for them; Angular and React still need it. The check is the `api-parity` target of the `docs` project, and `docs:sync` depends on it.

**Differences by design.** Three tags say that a difference between the frameworks is wanted; the check then reports it instead of failing:

| Tag | On | Effect |
|---|---|---|
| `@cckSemantic none` + `@remarks <reason>` | a member, a slot-scope field, or a part class or component (the Tooltip Provider) | A member or field is left out of the comparison. On a part the extractor writes `frameworkOnly: true`: the other frameworks need not have it, and its members are compared among the frameworks that do. The tag without a `@remarks` fails the extraction |
| `@cckDefaultDiffers <reason>` | a member (Tooltip `tooltip.delay`: Angular `0` from a token, React and Vue `700` from the Provider) | The extractor writes `defaultDiffers: <reason>` on the member. A `default` difference is reported with the reason when every member with that semantic id carries the tag, and fails when one lacks it; `required` is never excused. The tag without a reason fails the extraction |
| `LACKING_BY_DESIGN` (in `api-parity/compare.ts`) | semantic ids Angular lacks, for a reason that no Angular member can carry | Only for a canonical id that React and Vue keep for the controls and the story compiler (the Accordion root members, the Tooltip `open` and `openChange`, which Angular lacks because it follows Material), so `none` would drop it. Prefer the tags above |

All extractors write `ApiDoc`, `ApiPart`, `ApiSlot` and `ApiMember` as typed and documented in [`packages/shared/src/api-doc.ts`](../../../packages/shared/src/api-doc.ts).

**Read type.** `ApiMember.type` is the type a reader sees, not the type a writer may pass. An input with a transform such as `booleanAttribute` reports `boolean`, because the story compiler classifies the type text to choose a control and a story. A type name that is an alias of string literals (`BadgeContainerPosition`) is written as its union (`'top-left' | 'top-right' | …`, in declaration order) by all three extractors, so the API tab shows the real values and the compiler can build a select control and a story per value. Only a name that is a whole member of the top-level union is replaced; other aliases, arrays, `keyof`, generic types, member accesses and property keys stay as written.

**Inheritance (Angular).** A public directive lists the public inputs and outputs it inherits through `extends`, from any base class, exported or not, with the TSDoc of the declaring class; a member the subclass redeclares wins. The type of an inherited member that names a type parameter of its base (`ValueChangeDetails<string, R>`) is printed with the subclass's type argument (`ValueChangeDetails<string, InputChangeReason>`). An unexported base gets no part, and so does an exported abstract class (a base shared by directives of several entries, such as `CckTextControlBase`): the extractor skips abstract directive and component classes, and its members appear on each class that extends it. Protected, private, static and abstract members and lifecycle hooks are never listed, and host bindings are not extracted (`ApiDoc` has no field for them). The TSDoc check covers inherited members and names the declaring class. The class TSDoc names its anatomy part with `@cckPart`, which gives the part its semantic id; the extraction fails without it.

**Compound parts (Angular).** A component with several parts has one Angular class per part, and the story compiler reads the Angular `ApiDoc` for the list of parts a story can write. Four more class tags describe what Angular does differently from React and Vue (the `ApiPart` fields in [`api-doc.ts`](../../../packages/shared/src/api-doc.ts)):

| Tag | Field | Meaning |
|---|---|---|
| a second and later `@cckPart <part>` | `renders` | The parts this directive renders internally, outermost first (`CckTabs`: `list`). A story part with such an id has no Angular element: its attributes go to this directive and its children become its content. The input that takes an attribute of a rendered part carries `@cckSemantic <component>.<part>.<name>` (`tabs.list.aria-label`) Name only the parts a story can write: a part that is internal in every framework gets no tag, because React and Vue have no part for it and the compiler requires every story part in each framework. The Angular Select renders the parts that React and Vue write (`trigger`, `value`, `dropdownIcon`, `content`, and `optionIndicator`, `optionContent` of an option), so they carry the tags; the React and Vue `Value` has both `@cckPart value` and `@cckPart placeholder` (one part renders both spans), and only the first names the part |
| `@cckSection <part> <slot> <input>` | `section` (`partName`, `slotName`, `inputName`) | The directive also stands for the story part `<part>`, which feeds its `<slot>` and its `<input>` (`CckTab`: `trigger header header`) |
| `@cckTemplate <selector>` | `templateSelector` | The part is declared inside that `ng-template` (`CckPopoverContent`: `ng-template[cckPopoverPortal]`). The class with that selector (a portal directive) renders no part: it needs no `@cckPart` and is not an `ApiPart`. The same holds for the class of an `ng-template` selector named by a `@cckSlot` |
| `@cckNoElement` | no `anatomyPart` | The root renders no element (`<ng-container cckPopover>`) |

The members of a part other than the root get `<component>.<part>.<name>` as their default semantic id (`tabs.trigger.value`) in all three extractors; the root keeps `<component>.<name>`. A component counts as compound only when its Angular `ApiDoc` has more than one part, by distinct semantic id or section: the second `@cckPart` of a Badge or a Radio (its own markup) is not a part of the API.

**Parity of rendered and section parts.** `api-parity` compares the members of a part Angular does not write with the Angular directive that stands for it. A member goes to the part its semantic id names (`tabs.list.aria-label` on `CckTabs` is a member of the list). Three members reach more than the part they sit on: the slot a section feeds (`@cckSection trigger label label`: the `label` slot of `CckTab`) belongs to the trigger, so React's and Vue's trigger label carries `@cckSemantic tabs.label`; the `value` input of a section, when it has one, is the key of both halves, so it is also `tabs.trigger.value` (the Angular Tabs select by index, so `CckTab` has none); and the default slot of a part that renders others (`CckTabs` renders the list) is also the default slot of each rendered part. Write the `@cckPart` of a part the section stands for only on the section directive, not on the part that renders the others.

**Scoped slots.** `ApiSlot.scope` lists the fields a slot gives its content, each with its read type and TSDoc (the extraction fails on a field without it). Angular: the slot's `@cckSlot <name> ng-template[<selector>] - …` tag names the selector, and the scope is the type after `ctx is` in the `static ngTemplateContextGuard` of the directive with that selector. React: a prop typed `(scope: S) => ReactNode` is a slot whose scope is the members of `S`. Vue: the props object of a slot in `defineSlots` (a field is a property of the object, with a comment). A scope field that exists in one framework by design (the Vue root slot props such as `open` and `close`, as in Reka UI) carries `@cckSemantic none` and a one-line `@remarks`, in any framework; the extractor writes `semanticId: 'none'` on it, as on a member (and fails on the tag without a `@remarks`), and the parity check leaves it out of the scope comparison. A scope field without the tag that is missing in another framework still fails.

**Generic components.** A member typed by a type parameter is written with the default of the parameter (`T = string` gives `string`) in all three extractors, so the stories, controls and catalog types read the Select as string-valued. A function prop of a generic (`itemToString`, `isItemEqual`) stays a function.

**Slots.** A slot's semantic id is `<component>.<slot name>`, and `default` is the content of the part. Angular declares each slot with a class tag, `@cckSlot <name> [<selector>] - <description>` (`@cckSlot default - The button label.`, `@cckSlot label [cckLabel] - The label.`; the default slot has no selector); a part that takes content declares `@cckSlot default`. React: a prop whose declared type is `ReactNode` (or `React.ReactNode`, with or without `undefined` or `null`) is a slot, and `children?: ReactNode` with TSDoc is the slot `default`. Vue: `defineSlots` (see Vue below). A slot that exists in one framework by design, such as the Vue `asChild` host slot, takes the exemption under Semantic ids.

**Semantic ids.** The machine's `Props` and `Events` types define the canonical ids (`<component>.<propName>`). The extractor assigns them when the framework member has the same name. When a framework intentionally uses another name (Vue `modelValue` for `value`, an Angular `valueChangeDetails` output and a React `onValueChange` callback for the event `input.valueChange`), the TSDoc tag `@cckSemantic <id>` on the framework member sets the id. On a member inherited by components of several entries, `@cckSemantic *.<prop>` (`*.readOnly`) stands for the component being extracted: it resolves to `input.readOnly` on `CckInput` and `textarea.readOnly` on `CckTextarea`. The parity check fails on a member with no semantic id. A member that exists in one framework by design carries `@cckSemantic none` and a one-line reason in `@remarks`. Playground controls and the story compiler match members by semantic id ([playground-and-snippets.md](./playground-and-snippets.md), [stories-and-scenarios.md](./stories-and-scenarios.md)). An event of a part that is not the change of a model (`menu.item.activate`, an Angular output `activate`, a React `onActivate`, a Vue emit `activate`) becomes the story attribute `on<Event>` on that part, with the neutral name after the part's prefix; the name must not be the name of a native DOM event (`select`, `toggle`: React would read `onSelect` as the DOM event), which the compiler refuses as `name-collision` at the `ApiDoc` ([story-language.md](./story-language.md)).

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
- Theme options come from each theme's `ThemeConfig`, not from TSDoc on the base component. Decide from the component code and the theme config which inputs or props come from the theme and which from the base component, and document only the base component's. A theme layer's own option has a one-sentence summary only, with no `@defaultValue` and no list of values: the default and the values live only in `ThemeConfig`, and the docs read them there.
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

From `<name>.meta.ts`: `data-*` per part and values, CSS variables per part, keyboard table, expected roles and ARIA (test expectations), APG link. From the anatomy: parts and classes. From `ThemeConfig`: theme options. The examples above are illustrative; a component's real API comes from its approved spec.
