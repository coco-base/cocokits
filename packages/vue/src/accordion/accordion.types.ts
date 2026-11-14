import type { Component } from 'vue';
import type { AsTag, Direction } from '@cocokits/vue-core';
import type { AccordionChangeReason, AccordionOrientation, AccordionType } from '@cocokits/machines/accordion';

export type { AccordionChangeReason, AccordionOrientation, AccordionType };

/**
 * Holds the open items of the accordion. It renders a `<div>` around the items.
 *
 * Bind the open items with `v-model`. The value is a string in `single` mode and a list of strings in `multiple`
 * mode. An accordion inside the content of an item is separate: its items and keys never reach this one.
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
   * The open items, bound with `v-model`. In `single` mode it is the `value` of the open item, or `undefined` when
   * none is open. In `multiple` mode it is a list of values.
   *
   * When not set, the accordion keeps its own value, which starts as `defaultValue`.
   *
   * If you listen for changes and do not accept one, the old value stays.
   *
   * @cckSemantic accordion.value
   * @cckParity Bound with `v-model`.
   */
  readonly modelValue?: string | string[] | undefined;
  /**
   * The modifiers of `v-model`, as in `v-model.trim`. The framework fills it. The component declares it so the
   * modifiers do not reach the DOM.
   *
   * @internal
   * @cckSemantic none
   * @cckParity Only this framework has this member.
   */
  readonly modelModifiers?: Record<string, true> | undefined;
  /**
   * The start open items of an accordion whose `v-model` is not bound. It is read once, when the accordion is
   * created. The items it names are open in the server output.
   *
   * When not set, every item starts closed. A bound `modelValue` ignores it.
   *
   * @cckSemantic none
   * @cckParity The value the component starts with.
   */
  readonly defaultValue?: string | string[] | undefined;
  /**
   * How many items can be open at the same time. When not set, the type follows the value: a list means
   * `multiple`, and anything else means `single`.
   *
   * @cckSemantic accordion.type
   * @cckParity Not available in every framework.
   * @defaultValue 'single'
   */
  readonly type?: AccordionType | undefined;
  /**
   * Whether the open item can be closed again in `single` mode. When not set, a click on the open item does
   * nothing, and its trigger gets `aria-disabled="true"`. In `multiple` mode an item always closes.
   *
   * @cckSemantic accordion.collapsible
   * @cckParity Not available in every framework.
   * @defaultValue false
   */
  readonly collapsible?: boolean | undefined;
  /**
   * Whether every item is disabled. Clicks, Enter and Space do nothing, and the arrow keys skip every trigger. A
   * bound value can still open an item.
   *
   * @cckSemantic accordion.disabled
   * @cckParity Not available in every framework.
   * @defaultValue false
   */
  readonly disabled?: boolean | undefined;
  /**
   * Whether the headers sit in a column or in a row. It decides which arrow keys move the focus.
   *
   * @cckSemantic accordion.orientation
   * @cckParity Not available in every framework.
   * @defaultValue 'vertical'
   */
  readonly orientation?: AccordionOrientation | undefined;
  /**
   * The text direction of the accordion. The horizontal arrow keys and the nested components follow it. When not
   * set, the nearest direction provider applies, and then `'ltr'`.
   *
   * Only a `dir` you pass is written on the root element.
   *
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly dir?: Direction | undefined;
  /**
   * Whether the content of a closed item is removed from the DOM. With `false`, the children stay rendered and
   * the content is `hidden`. An item can override it.
   *
   * @cckSemantic none
   * @cckParity Only this framework has this member.
   * @defaultValue true
   */
  readonly unmountOnHide?: boolean | undefined;
  /**
   * The tag or component to render in place of the element of the part. The part keeps its role, state, ids and
   * handlers. It is ignored with `asChild`.
   *
   * When not set, the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the part merges onto its first child element or component, instead of rendering its own element. The
   * child keeps its own props and gets the role, the classes and the `data-*` attributes of the part. When not set,
   * the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/** The events of the AccordionRoot. */
export interface AccordionRootEmits {
  /**
   * Emits the new value for `v-model` when the user opens or closes an item. A value written by the parent emits
   * nothing.
   *
   * In `single` mode the value is a string, or `undefined` when the last item closes. In `multiple` mode it is a
   * list. The event carries no reason.
   *
   * @cckSemantic accordion.valueChange
   * @cckParity The `update:modelValue` event is the only change event; it carries no reason.
   */
  'update:modelValue': [value: string | string[] | undefined];
}

/**
 * One section of the accordion: its header and its content. It renders a `<div>` with no role. Its `value` is the
 * key that the open value stores.
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
   * The key of the item in the open value. It must be unique inside the accordion.
   *
   * @cckSemantic accordion.item.value
   * @cckParity Not available in every framework.
   */
  readonly value: string;
  /**
   * Whether the item is disabled. Its trigger is natively disabled, a click does nothing and the arrow keys skip
   * it. A bound value can still open it.
   *
   * @cckSemantic accordion.item.disabled
   * @defaultValue false
   */
  readonly disabled?: boolean | undefined;
  /**
   * Whether the content of this item is removed from the DOM while it is closed. When not set, the `unmountOnHide`
   * of the root decides.
   *
   * @cckSemantic none
   * @cckParity Only this framework has this member.
   * @defaultValue the value of the root
   */
  readonly unmountOnHide?: boolean | undefined;
  /**
   * The tag or component to render in place of the element of the part. The part keeps its role, state, ids and
   * handlers. It is ignored with `asChild`.
   *
   * When not set, the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the part merges onto its first child element or component, instead of rendering its own element. The
   * child keeps its own props and gets the role, the classes and the `data-*` attributes of the part. When not set,
   * the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/**
 * The heading that holds the trigger. It renders an `<h3>`. Pick the level that fits the outline of the page with
 * `as`.
 *
 * @example
 * <AccordionHeader as="h2"><AccordionTrigger>Shipping</AccordionTrigger></AccordionHeader>
 *
 * @cckPart header
 */
export interface AccordionHeaderProps {
  /**
   * The heading element, `h1` to `h6`, or another tag or component. The part keeps its state. It is ignored with
   * `asChild`.
   *
   * @cckSemantic accordion.header.headingLevel
   * @cckParity Sets the heading level by replacing the rendered element.
   * @defaultValue 'h3'
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the part merges onto its first child element or component, instead of rendering its own element. The
   * child keeps its own props and gets the role, the classes and the `data-*` attributes of the part. When not set,
   * the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/**
 * The `<button>` that opens and closes its item. It carries `aria-expanded` and `aria-controls`. Its visible text is
 * its accessible name.
 *
 * Every enabled trigger is a Tab stop. The arrow keys, Home and End move between the triggers of the accordion.
 *
 * With `as`, a tag or component other than `button` gets the button role, a Tab stop and no `type`. It toggles on
 * Enter and Space. When disabled, it gets `aria-disabled="true"` in place of `disabled`. With `asChild`, the child
 * must render a `<button>`. Its own props win, except the ARIA, the id and the state markers.
 *
 * @example
 * <AccordionTrigger>Shipping</AccordionTrigger>
 *
 * @cckPart trigger
 */
export interface AccordionTriggerProps {
  /**
   * The tag or component to render in place of the element of the part. The part keeps its role, state, ids and
   * handlers. It is ignored with `asChild`.
   *
   * When not set, the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the part merges onto its first child element or component, instead of rendering its own element. The
   * child keeps its own props and gets the role, the classes and the `data-*` attributes of the part. When not set,
   * the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/**
 * The body of the section. It renders a `<div>` with `role="region"`, named by its trigger. While its item is
 * closed, it carries the native `hidden` attribute, and with `unmountOnHide` it has no children.
 *
 * @example
 * <AccordionContent>Orders leave in two days.</AccordionContent>
 *
 * @cckPart content
 */
export interface AccordionContentProps {
  /**
   * Whether the children stay rendered while the item is closed. The content is `hidden` then. Use it to keep a
   * form control or the state of a component in the DOM.
   *
   * @cckSemantic accordion.content.forceMount
   * @cckParity Not available in every framework.
   * @defaultValue false
   */
  readonly forceMount?: boolean | undefined;
  /**
   * The tag or component to render in place of the element of the part. The part keeps its role, state, ids and
   * handlers. It is ignored with `asChild`.
   *
   * When not set, the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the part merges onto its first child element or component, instead of rendering its own element. The
   * child keeps its own props and gets the role, the classes and the `data-*` attributes of the part. When not set,
   * the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}
