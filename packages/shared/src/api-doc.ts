/** One documented member of a part: a prop, input, event, slot or method. The extractors write it from TSDoc. */
export interface ApiMember {
  /** The framework's own name, for example `modelValue`, `value` or `checkedChange`. */
  readonly name: string;
  /** The canonical id, for example `tabs.value`; the same in every framework. */
  readonly semanticId: string;
  /**
   * The read type as source text. An input with a transform such as `booleanAttribute` reports its read
   * type (`boolean`), not the wider type it accepts.
   */
  readonly type: string;
  /** The default value as source text, when the member has one. */
  readonly default?: string;
  /** Whether the member must be set. */
  readonly required: boolean;
  /**
   * The reason the default differs from the same member in another framework by design (`@cckDefaultDiffers <reason>`,
   * Angular `0` from a token, React and Vue `700` from the Provider). The parity check reports such a difference
   * instead of failing it. Absent otherwise.
   */
  readonly defaultDiffers?: string;
  /** The first TSDoc paragraph. */
  readonly description: string;
  /** Longer behaviour notes (`@remarks`). */
  readonly remarks?: string;
  /** The replacement or reason (`@deprecated`). */
  readonly deprecated?: string;
  /** Minimal usages (`@example`). */
  readonly examples?: readonly string[];
}

/** One slot of a part. How the extractors name and find slots: `docs/style-guides/docs/api-extraction.md`. */
export interface ApiSlot extends ApiMember {
  /** The `ng-content select` that projects into the slot. Angular only; absent for the default slot. */
  readonly selector?: string;
  /**
   * The fields the slot gives its content (a scoped slot: Angular `let-selected="selected"`, React a function prop,
   * Vue `#preview="{ selected }"`). Absent for a plain slot. How the extractors read it:
   * `docs/style-guides/docs/api-extraction.md`.
   */
  readonly scope?: readonly ApiSlotScopeField[];
}

/** One field of the scope a scoped slot gives its content: `selected` of the Select `preview` slot. */
export interface ApiSlotScopeField {
  /** The field name, the same in every framework: the story destructures it. */
  readonly name: string;
  /** The read type as source text. */
  readonly type: string;
  /** The first TSDoc paragraph of the field. */
  readonly description: string;
  /**
   * `'none'` for a field that exists in one framework by design (`@cckSemantic none` with a `@remarks` reason), as on
   * {@link ApiMember.semanticId}: the parity check skips it when it compares the scopes. Absent otherwise.
   */
  readonly semanticId?: 'none';
}

/** What an Angular part also stands for (`@cckSection <part> <slot> <input>`). */
export interface ApiPartSection {
  /** The anatomy part of the story part the section stands for (`trigger`). */
  readonly partName: string;
  /** The slot of this part that holds that part's content (`header`). */
  readonly slotName: string;
  /** The input of this part that takes that part's text (`header`). */
  readonly inputName: string;
}

/**
 * One public part of a component, in one framework: `CckTab` in Angular, `Tabs.Trigger` in React.
 * Several parts of one framework can share a `semanticId` (the Button's `button` and `a` hosts).
 */
export interface ApiPart {
  /** The exported name, for example `CckTab` or `Tabs.Trigger`. */
  readonly name: string;
  /** The component and anatomy part, for example `tabs.trigger`; the same in every framework. */
  readonly semanticId: string;
  /** The element selector. Angular only. */
  readonly selector?: string;
  /**
   * The anatomy part this part renders, for example `trigger`. Absent when the part renders no element (an Angular
   * root declared as `<ng-container cckPopover>`).
   */
  readonly anatomyPart?: string;
  /**
   * Angular only. The anatomy parts this part renders internally besides its own (`CckTabs`: `list`), written by
   * every `@cckPart` after the first. A story part with such an id has no Angular element of its own: its attributes
   * go to this part and its children become the content of this part.
   */
  readonly renders?: readonly string[];
  /**
   * Angular only. The story part this part also stands for, with the slot and the input of this part that take what
   * that part writes (`@cckSection <part> <slot> <input>`; `CckTab`: `trigger header header`). The join that prints it
   * is in the story compiler (`docs/style-guides/docs/story-language.md`).
   */
  readonly section?: ApiPartSection;
  /**
   * Angular only. The selector of the `ng-template` the part is declared inside (`@cckTemplate ng-template[cckPopoverPortal]`),
   * for example the portal directive of an overlay content part.
   */
  readonly templateSelector?: string;
  /**
   * `true` for a part that exists in some frameworks only by design (`@cckSemantic none` on the part, with a
   * `@remarks` reason: the Tooltip Provider). The parity check does not require it in the others.
   */
  readonly frameworkOnly?: true;
  /** The first TSDoc paragraph of the part. The extractors always write it. */
  readonly description?: string;
  /** Props, inputs and models. */
  readonly props: readonly ApiMember[];
  /** Outputs and events. */
  readonly events: readonly ApiMember[];
  /** Slots. */
  readonly slots: readonly ApiSlot[];
  /** Exposed methods. */
  readonly methods: readonly ApiMember[];
  /** How a model is bound in this framework, for example `v-model:value`, `[(value)]`. */
  readonly bindings?: readonly {
    readonly semanticId: string;
    readonly value: string;
    readonly syntax: string;
  }[];
}

/** The extracted API of one component in one framework. */
export interface ApiDoc {
  /** The component name, for example `tabs`. */
  readonly component: string;
  /** The framework the API was extracted from; `ts` for framework-free sources. */
  readonly framework: 'angular' | 'react' | 'vue' | 'ts';
  /** The public parts, in source order. */
  readonly parts: readonly ApiPart[];
}
