import type { Component } from 'vue';
import type { AsTag, Direction } from '@cocokits/vue-core';
import type { AccordionChangeReason, AccordionOrientation, AccordionType } from '@cocokits/machines/accordion';

export type { AccordionChangeReason, AccordionOrientation, AccordionType };

/**
 * The root of the accordion: it renders the `div` around the items and holds the open items. Bind them with
 * `v-model`: a string in `single` mode, a list of strings in `multiple` mode. An accordion inside the content of
 * an item belongs to itself: its items and keys never reach this one.
 *
 * @example
 * <AccordionRoot v-model="open" collapsible>
 *   <AccordionItem value="shipping">
 *     <AccordionHeader><AccordionTrigger>Shipping</AccordionTrigger></AccordionHeader>
 *     <AccordionContent>Orders leave in two days.</AccordionContent>
 *   </AccordionItem>
 * </AccordionRoot>
 *
 * @cckPart root
 */
export interface AccordionRootProps {
  /**
   * The value of the open items, bound with `v-model`: the `value` of the open item in `single` mode (`undefined`
   * when none is open), a list of values in `multiple` mode. Bound with a listener it is controlled: a parent that
   * does not accept a change keeps the old value. Unbound, the accordion keeps its own value, which starts from
   * `defaultValue`.
   *
   * @cckSemantic accordion.value
   * @cckParity Angular has no root value; each item binds `expanded`.
   */
  readonly modelValue?: string | string[] | undefined;
  /**
   * The modifiers of `v-model`, as in `v-model.trim`; the component only declares them so they do not reach the DOM.
   *
   * @cckSemantic none
   * @cckParity Vue-only: Vue fills it from `v-model.trim` and the like.
   */
  readonly modelModifiers?: Record<string, true> | undefined;
  /**
   * The open items of an accordion whose `v-model` is not bound, read once when it is created. Binding
   * `modelValue` ignores it. The items it names are open in the server output.
   *
   * @cckSemantic none
   * @cckParity Vue's uncontrolled start value, as React's `defaultValue`; Angular binds `expanded` on each item.
   */
  readonly defaultValue?: string | string[] | undefined;
  /**
   * `single` keeps one item open, `multiple` lets every item toggle on its own. Without it the type follows the
   * value: a list is `multiple`, anything else `single`.
   *
   * @cckSemantic accordion.type
   * @cckParity Angular uses the `multi` input on the root.
   * @defaultValue 'single'
   */
  readonly type?: AccordionType | undefined;
  /**
   * Whether the open item can be closed again in `single` mode. Without it a click on the open item does nothing
   * and its trigger gets `aria-disabled="true"`. `multiple` mode always closes.
   *
   * @cckSemantic accordion.collapsible
   * @cckParity Angular items are always collapsible (Material/CDK).
   * @defaultValue false
   */
  readonly collapsible?: boolean | undefined;
  /**
   * Whether every item is disabled: no click, no Enter or Space, and the arrow keys skip every trigger. A bound
   * value can still open an item.
   *
   * @cckSemantic accordion.disabled
   * @cckParity Angular disables each item; it has no root-wide `disabled`.
   * @defaultValue false
   */
  readonly disabled?: boolean | undefined;
  /**
   * Whether the headers are laid out in a column or a row; `horizontal` moves with Left and Right.
   *
   * @cckSemantic accordion.orientation
   * @cckParity Angular is vertical only.
   * @defaultValue 'vertical'
   */
  readonly orientation?: AccordionOrientation | undefined;
  /**
   * The text direction of the accordion: the horizontal arrow keys and the nested components follow it, and the root
   * renders the `dir` attribute only when you pass one. Without it the nearest `provideDirection` applies, else
   * `'ltr'`.
   *
   * @cckSemantic none
   * @cckParity Angular reads `Directionality` (no input).
   */
  readonly dir?: Direction | undefined;
  /**
   * Whether the content of a closed item is removed from the DOM. `false` keeps the children rendered and the
   * content `hidden`. An item can override it.
   *
   * @cckSemantic none
   * @cckParity Vue-only, as in Reka UI; Angular always keeps the children.
   * @defaultValue true
   */
  readonly unmountOnHide?: boolean | undefined;
  /**
   * The tag or component to render, in place of the `div`. The part keeps its state and handlers. Ignored with
   * `asChild`.
   *
   * @cckSemantic none
   * @cckParity Vue's element override (Reka).
   * @defaultValue 'div'
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the root merges onto its first element or component child instead of rendering a `div`.
   *
   * @cckSemantic none
   * @cckParity Vue's merge onto one child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/** The events of the AccordionRoot. */
export interface AccordionRootEmits {
  /**
   * Emits with the new value for `v-model`, after every change the accordion makes: a click that opens or closes
   * an item. The value is a string (or `undefined` when the last item closes) in `single` mode, a list in
   * `multiple` mode. A value written by the parent emits nothing.
   *
   * @cckSemantic accordion.valueChange
   * @remarks Carries the new value only, no reason.
   * @cckParity Vue's change event is the `v-model` update event, as in Reka UI; it carries no reason. React calls `onValueChange`.
   */
  'update:modelValue': [value: string | string[] | undefined];
}

/**
 * One section: its header and its content. It renders a `div` with no role, and its `value` is the key stored in
 * the open value. The default slot receives `open`.
 *
 * @example
 * <AccordionItem value="shipping">
 *   <AccordionHeader><AccordionTrigger>Shipping</AccordionTrigger></AccordionHeader>
 *   <AccordionContent>Orders leave in two days.</AccordionContent>
 * </AccordionItem>
 *
 * @cckPart item
 */
export interface AccordionItemProps {
  /**
   * The key of the item in the open value. Unique inside the accordion.
   *
   * @cckSemantic accordion.item.value
   * @cckParity Angular items have no value; they use a generated id.
   */
  readonly value: string;
  /**
   * Whether the item is disabled: its trigger is natively disabled, a click does nothing and the arrow keys skip
   * it. A bound value can still open it.
   *
   * @cckSemantic accordion.item.disabled
   * @defaultValue false
   */
  readonly disabled?: boolean | undefined;
  /**
   * Whether the content of this item is removed from the DOM while it is closed. Without it the root decides.
   *
   * @cckSemantic none
   * @cckParity Vue-only, as in Reka UI; Angular always keeps the children.
   * @defaultValue the value of the root
   */
  readonly unmountOnHide?: boolean | undefined;
  /**
   * The tag or component to render, in place of the `div`. The part keeps its state. Ignored with `asChild`.
   *
   * @cckSemantic none
   * @cckParity Vue's element override (Reka).
   * @defaultValue 'div'
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the item merges onto its first element or component child instead of rendering a `div`.
   *
   * @cckSemantic none
   * @cckParity Vue's merge onto one child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/**
 * The heading that wraps the trigger, an `h3` by default. Pick the level that fits the outline of the page with
 * `as`.
 *
 * @example
 * <AccordionHeader as="h2"><AccordionTrigger>Shipping</AccordionTrigger></AccordionHeader>
 *
 * @cckPart header
 */
export interface AccordionHeaderProps {
  /**
   * The heading element, `h1` to `h6`, or another tag or component. The part keeps its state. Ignored with
   * `asChild`.
   *
   * @cckSemantic accordion.header.headingLevel
   * @cckParity Angular takes the `headingLevel` input of the item.
   * @defaultValue 'h3'
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the header merges onto its first element or component child instead of rendering an `h3`.
   *
   * @cckSemantic none
   * @cckParity Vue's merge onto one child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/**
 * The `button` that opens and closes its item. It carries `aria-expanded` and `aria-controls`; every enabled
 * trigger is a Tab stop, and the arrow keys, Home and End move between the triggers of the accordion. The visible
 * text is its accessible name.
 *
 * @example
 * <AccordionTrigger>Shipping</AccordionTrigger>
 *
 * @cckPart trigger
 */
export interface AccordionTriggerProps {
  /**
   * The tag or component to render, in place of the `button`. A tag or component other than `button` gets the
   * button role and a tab stop, no `type`, toggles on Enter and Space, and when disabled gets `aria-disabled="true"`
   * in place of `disabled`. Ignored with `asChild`.
   *
   * @cckSemantic none
   * @cckParity Vue's element override (Reka). Reka renders a `div` by default; this renders a native `button`.
   * @defaultValue 'button'
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the trigger merges onto its first element or component child (a `Button`) instead of rendering a
   * `button`. The child must render a `button`; its own props win except the ARIA, id and state markers.
   *
   * @cckSemantic none
   * @cckParity Vue's merge onto one child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/**
 * The section body: a `div` with `role="region"`, named by its trigger. While its item is closed it carries the
 * native `hidden` attribute and, with `unmountOnHide`, no children.
 *
 * @example
 * <AccordionContent>Orders leave in two days.</AccordionContent>
 *
 * @cckPart content
 */
export interface AccordionContentProps {
  /**
   * Whether the children stay rendered while the item is closed; the content is `hidden` then. Use it to keep a
   * form control or a component state in the DOM.
   *
   * @cckSemantic accordion.content.forceMount
   * @cckParity Vue and React only; Angular always keeps the children rendered.
   * @defaultValue false
   */
  readonly forceMount?: boolean | undefined;
  /**
   * The tag or component to render, in place of the `div`. The part keeps its role, ids and state. Ignored with
   * `asChild`.
   *
   * @cckSemantic none
   * @cckParity Vue's element override (Reka).
   * @defaultValue 'div'
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the content merges onto its first element or component child instead of rendering a `div`.
   *
   * @cckSemantic none
   * @cckParity Vue's merge onto one child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}
