import type { ComponentPropsWithRef, HTMLAttributes, ReactElement, ReactNode, RefCallback } from 'react';
import type { ChangeDetails, Direction } from '@cocokits/shared';
import type { AccordionChangeReason, AccordionOrientation, AccordionType } from '@cocokits/machines/accordion';

export type { AccordionChangeReason, AccordionOrientation, AccordionType };

/** What `onValueChange` receives besides the open value: the reason and the event behind it. */
export type AccordionChangeDetails = ChangeDetails<AccordionChangeReason>;

/** The public state of the Root, passed to the function form of `render`. */
export interface AccordionState {
  /** The orientation of the headers. */
  readonly orientation: AccordionOrientation;
}

/** The public state of one Item, Header, Trigger or Content, passed to the function form of `render`. */
export interface AccordionItemState extends AccordionState {
  /** Whether the item is open. */
  readonly open: boolean;
  /** Whether the item is disabled, by its own `disabled` or the Root's. */
  readonly disabled: boolean;
}

/**
 * The props the function form of `render` receives: the native props merged with the part's own. Spread all of
 * them, including `ref`, onto one element.
 */
export interface AccordionRenderProps extends Omit<HTMLAttributes<HTMLElement>, 'color'> {
  /** Any `data-*` attribute, such as `data-state` and the theme options. */
  readonly [attribute: `data-${string}`]: string | undefined;
  /** The merged ref: the part's `ref`, the rendered element's own `ref` and the part's internal one. */
  readonly ref: RefCallback<HTMLElement>;
}

/**
 * The `render` prop of a part: an element, or a function of the merged props and the part's state. The function
 * form does not work from a Server Component.
 */
type RenderProp<S> = ReactElement | ((props: AccordionRenderProps, state: S) => ReactElement);

/** Props both kinds of Root share. Native `div` props pass through. */
interface AccordionRootBaseProps extends Omit<ComponentPropsWithRef<'div'>, 'color' | 'defaultValue' | 'dir'> {
  /**
   * The items.
   *
   * @cckSemantic accordion.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * Whether every item is disabled: none is toggled by the user and the arrow keys skip them.
   *
   * @defaultValue false
   * @cckSemantic accordion.disabled
   * @remarks Root-wide disabling (Radix, Reka); Angular disables each item.
   */
  readonly disabled?: boolean | undefined;
  /**
   * Whether the headers are laid out in a column or a row; `horizontal` moves with Left and Right.
   *
   * @defaultValue 'vertical'
   * @cckSemantic accordion.orientation
   * @remarks Angular is always vertical.
   */
  readonly orientation?: AccordionOrientation | undefined;
  /**
   * The text direction of the accordion and everything inside it, like a `DirectionProvider`: the horizontal
   * arrow keys follow it. Without it the nearest `DirectionProvider` applies, then `'ltr'`. Only a `dir` you pass
   * is rendered on the element.
   *
   * @cckSemantic none
   * @remarks Angular reads `Directionality` (no input).
   */
  readonly dir?: Direction | undefined;
  /**
   * Replaces the rendered `<div>`: an element, or a function of the merged props and the {@link AccordionState}.
   * The function form must spread all the props it receives, including `ref`, onto one element.
   *
   * @cckSemantic none
   * @remarks React's element override (Base UI); Angular puts the directive on your element and Vue uses `as` or `asChild`.
   */
  readonly render?: RenderProp<AccordionState> | undefined;
}

/** Props of a {@link AccordionRoot} with `type="single"`: at most one item is open. */
export interface AccordionSingleRootProps extends AccordionRootBaseProps {
  /**
   * `single` keeps at most one item open; `multiple` lets every item toggle on its own.
   *
   * @cckSemantic accordion.type
   * @remarks Angular uses `multi` instead.
   */
  readonly type: 'single';
  /**
   * The value of the open item, `''` when none is open. It makes the accordion controlled: a parent that does not
   * update it after `onValueChange` keeps the old value. Without a value or `defaultValue` the accordion starts
   * with every item closed.
   *
   * @cckSemantic accordion.value
   * @remarks React's open value; Angular binds `expanded` on each item and Vue binds `modelValue`.
   */
  readonly value?: string | undefined;
  /**
   * The initial value of an uncontrolled accordion, read once. Pass it for an open item in the server output.
   *
   * @defaultValue ''
   * @cckSemantic none
   * @remarks React's uncontrolled mode; Angular binds `expanded` on each item and Vue binds `modelValue`.
   */
  readonly defaultValue?: string | undefined;
  /**
   * Called after every change the user makes, with the new value (`''` when the open item closed) and the reason.
   * Never when the parent sets `value`.
   *
   * @cckSemantic accordion.valueChange
   * @remarks Vue emits `update:modelValue`; Angular has no root value and emits `expandedChange` on each item.
   */
  readonly onValueChange?: ((value: string, details: AccordionChangeDetails) => void) | undefined;
  /**
   * Whether the open item can be closed by clicking it again. The open trigger then has no `aria-disabled`.
   *
   * @defaultValue false
   * @cckSemantic accordion.collapsible
   * @remarks Angular is always collapsible.
   */
  readonly collapsible?: boolean | undefined;
}

/** Props of a {@link AccordionRoot} with `type="multiple"`: every item toggles on its own. */
export interface AccordionMultipleRootProps extends AccordionRootBaseProps {
  /**
   * `single` keeps at most one item open; `multiple` lets every item toggle on its own.
   *
   * @cckSemantic accordion.type
   * @remarks Angular uses `multi` instead.
   */
  readonly type: 'multiple';
  /**
   * The values of the open items. It makes the accordion controlled: a parent that does not update it after
   * `onValueChange` keeps the old value.
   *
   * @cckSemantic accordion.value
   * @remarks React's open value; Angular binds `expanded` on each item and Vue binds `modelValue`.
   */
  readonly value?: readonly string[] | undefined;
  /**
   * The initial values of an uncontrolled accordion, read once. Pass it for open items in the server output.
   *
   * @defaultValue []
   * @cckSemantic none
   * @remarks React's uncontrolled mode; Angular binds `expanded` on each item and Vue binds `modelValue`.
   */
  readonly defaultValue?: readonly string[] | undefined;
  /**
   * Called after every change the user makes, with the new list of open values and the reason. Never when the
   * parent sets `value`.
   *
   * @cckSemantic accordion.valueChange
   * @remarks Vue emits `update:modelValue`; Angular has no root value and emits `expandedChange` on each item.
   */
  readonly onValueChange?: ((value: readonly string[], details: AccordionChangeDetails) => void) | undefined;
}

/** Props of the {@link AccordionRoot}: a single accordion or a multiple one, told apart by `type`. */
export type AccordionRootProps = AccordionSingleRootProps | AccordionMultipleRootProps;

/** Props of the {@link AccordionItem}. Native `div` props pass through. */
export interface AccordionItemProps extends Omit<ComponentPropsWithRef<'div'>, 'color'> {
  /**
   * The header and the content of the item.
   *
   * @cckSemantic accordion.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * The key of the item in the open value. Unique inside the Root.
   *
   * @cckSemantic accordion.item.value
   * @remarks Angular items have no value; the accordion uses a generated id.
   */
  readonly value: string;
  /**
   * Whether the item is disabled: the user cannot toggle it and the arrow keys skip it. A controlled `value` can
   * still open it.
   *
   * @defaultValue false
   * @cckSemantic accordion.item.disabled
   */
  readonly disabled?: boolean | undefined;
  /**
   * Replaces the rendered `<div>`: an element, or a function of the merged props and the
   * {@link AccordionItemState}. The function form must spread all the props it receives, including `ref`, onto
   * one element.
   *
   * @cckSemantic none
   * @remarks React's element override (Base UI); Angular renders the item and Vue uses `as` or `asChild`.
   */
  readonly render?: RenderProp<AccordionItemState> | undefined;
}

/** Props of the {@link AccordionHeader}. Native `h3` props pass through. */
export interface AccordionHeaderProps extends Omit<ComponentPropsWithRef<'h3'>, 'color'> {
  /**
   * The trigger.
   *
   * @cckSemantic accordion.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * Replaces the rendered `<h3>`: an element such as `<h2 />`, or a function of the merged props and the
   * {@link AccordionItemState}. Pick the level that fits the page outline. The function form must spread all the
   * props it receives, including `ref`, onto one element.
   *
   * @defaultValue 'h3'
   * @cckSemantic accordion.header.headingLevel
   * @remarks Angular uses the `headingLevel` input of the item; Vue uses `as`.
   */
  readonly render?: RenderProp<AccordionItemState> | undefined;
}

/** Props of the {@link AccordionTrigger}. Native button props pass through. */
export interface AccordionTriggerProps extends Omit<ComponentPropsWithRef<'button'>, 'color' | 'disabled' | 'value'> {
  /**
   * The trigger text, which is also its accessible name.
   *
   * @cckSemantic accordion.label
   * @remarks Angular takes the label as `label` or as a `cckAccordionLabel` template on the item.
   */
  readonly children?: ReactNode | undefined;
  /**
   * Whether the rendered element is a native `<button>`. Set `false` when `render` gives another element: it
   * then gets `role="button"`, `tabindex="0"` and Enter and Space activation, no `type`, and `aria-disabled="true"`
   * instead of `disabled`. In development a tag that does not match logs a `CocoKits:` error.
   *
   * @defaultValue true
   * @cckSemantic none
   * @remarks React's element kind for `render` (Base UI); Vue decides it with `as`.
   */
  readonly nativeButton?: boolean | undefined;
  /**
   * Replaces the rendered `<button>`: an element, or a function of the merged props and the
   * {@link AccordionItemState}. The function form must spread all the props it receives, including `ref`, onto
   * one element. An element that is not a `<button>` also needs `nativeButton={false}`.
   *
   * @cckSemantic none
   * @remarks React's element override (Base UI); Angular renders the trigger and Vue uses `as` or `asChild`.
   */
  readonly render?: RenderProp<AccordionItemState> | undefined;
}

/** Props of the {@link AccordionContent}. Native `div` props pass through. */
export interface AccordionContentProps extends Omit<ComponentPropsWithRef<'div'>, 'color'> {
  /**
   * The section body.
   *
   * @cckSemantic accordion.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * Keeps the element and its children rendered while the item is closed. The element then has the native
   * `hidden` attribute, so a form control inside still takes part in the form.
   *
   * @defaultValue false
   * @cckSemantic accordion.content.forceMount
   * @remarks Angular always keeps the content rendered.
   */
  readonly forceMount?: boolean | undefined;
  /**
   * Replaces the rendered `<div>`: an element, or a function of the merged props and the
   * {@link AccordionItemState}. The function form must spread all the props it receives, including `ref`, onto
   * one element.
   *
   * @cckSemantic none
   * @remarks React's element override (Base UI); Angular renders the content and Vue uses `as` or `asChild`.
   */
  readonly render?: RenderProp<AccordionItemState> | undefined;
}

/** An Accordion part: a function component with its `displayName`. The Content renders nothing while closed. */
export interface AccordionPart<P> {
  (props: P): ReactElement | null;
  displayName: string;
}
