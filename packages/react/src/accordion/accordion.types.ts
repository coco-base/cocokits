import type { ComponentPropsWithRef, HTMLAttributes, ReactElement, ReactNode, RefCallback } from 'react';
import type { ChangeDetails, Direction } from '@cocokits/shared';
import type { AccordionChangeReason, AccordionOrientation, AccordionType } from '@cocokits/machines/accordion';
import type { RenderProp } from '../internal/render-element';

export type { AccordionChangeReason, AccordionOrientation, AccordionType };

/** What `onValueChange` receives besides the open value: the `reason` and the `event` behind the change. */
export type AccordionChangeDetails = ChangeDetails<AccordionChangeReason>;

/** The state of the Root that the function form of `render` receives. */
export interface AccordionState {
  /** The direction in which the headers are laid out. */
  readonly orientation: AccordionOrientation;
}

/** The state of one Item, Header, Trigger or Content that the function form of `render` receives. */
export interface AccordionItemState extends AccordionState {
  /** Whether the item is open. */
  readonly open: boolean;
  /** Whether the item is disabled, by its own `disabled` or by the `disabled` of the Root. */
  readonly disabled: boolean;
}

/**
 * The props that the function form of `render` receives: the native props merged with the props of the part. Pass
 * all of them, `ref` included, to one element.
 */
export interface AccordionRenderProps extends Omit<HTMLAttributes<HTMLElement>, 'color'> {
  /** Any `data-*` attribute, such as `data-state` and the theme options. */
  readonly [attribute: `data-${string}`]: string | undefined;
  /** The merged ref: the `ref` of the part, the `ref` of the rendered element and the `ref` of the part itself. */
  readonly ref: RefCallback<HTMLElement>;
}

/** Props that both kinds of Root share. Native `div` props pass through. */
interface AccordionRootBaseProps extends Omit<ComponentPropsWithRef<'div'>, 'color' | 'defaultValue' | 'dir'> {
  /**
   * The sections of the accordion: one `Accordion.Item` for each section. When not set, the accordion is empty.
   *
   * @example
   * <Accordion.Root type="single">
   *   <Accordion.Item value="shipping">...</Accordion.Item>
   *   <Accordion.Item value="returns">...</Accordion.Item>
   * </Accordion.Root>
   * @cckSemantic accordion.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * Whether every item is disabled. The user cannot open or close an item, and the arrow keys skip the triggers.
   *
   * @defaultValue false
   * @cckSemantic accordion.disabled
   * @cckParity Not available in every framework.
   */
  readonly disabled?: boolean | undefined;
  /**
   * The direction in which the headers are laid out. It also sets the arrow keys that move between the triggers.
   *
   * @defaultValue 'vertical'
   * @cckSemantic accordion.orientation
   * @cckParity Not available in every framework.
   */
  readonly orientation?: AccordionOrientation | undefined;
  /**
   * The text direction of the accordion and everything inside it. The Left and Right arrow keys follow it. When
   * not set, the nearest `DirectionProvider` applies, and then `'ltr'`.
   *
   * Only a `dir` you pass is written on the element.
   *
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly dir?: Direction | undefined;
  /**
   * Replaces the element that the part renders. Pass an element, or a function of the merged props and the state
   * of the part. The function must pass all props on, `ref` included, to one element.
   *
   * When not set, the part renders its own element.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   * @cckShared
   */
  readonly render?: RenderProp<AccordionRenderProps, AccordionState> | undefined;
}

/** Props of an {@link AccordionRoot} with `type="single"`: at most one item is open. */
export interface AccordionSingleRootProps extends AccordionRootBaseProps {
  /**
   * How many items can be open at the same time.
   *
   * @cckValue single - At most one item is open. Opening an item closes the open one.
   * @cckValue multiple - Each item opens and closes on its own.
   * @cckSemantic accordion.type
   * @cckParity Not available in every framework.
   */
  readonly type: 'single';
  /**
   * The value of the open item, or `''` when no item is open. Setting it makes the accordion controlled. If you do
   * not update it after `onValueChange`, the old value stays.
   *
   * When not set, the accordion keeps its own value, which starts as `defaultValue`.
   *
   * @cckSemantic accordion.value
   * @cckParity The controlled value.
   */
  readonly value?: string | undefined;
  /**
   * The start value of an accordion that you do not control with `value`. Pass it to render an open item on the
   * server.
   *
   * @defaultValue ''
   * @cckSemantic none
   * @cckParity The uncontrolled start value.
   */
  readonly defaultValue?: string | undefined;
  /**
   * Called after the user opens or closes an item. It receives the new value and a details object with the
   * `reason` and the `event`. The value is `''` when the open item closed.
   *
   * It is never called when you change `value` yourself.
   *
   * @example
   * const [open, setOpen] = useState('shipping');
   * <Accordion.Root type="single" collapsible value={open} onValueChange={(value) => setOpen(value)}>
   *   ...
   * </Accordion.Root>
   * @cckSemantic accordion.valueChange
   * @cckParity Not available in every framework.
   */
  readonly onValueChange?: ((value: string, details: AccordionChangeDetails) => void) | undefined;
  /**
   * Whether the user can close the open item by pressing its trigger again. Without it, the open trigger has
   * `aria-disabled="true"`.
   *
   * @defaultValue false
   * @cckSemantic accordion.collapsible
   * @cckParity Not available in every framework.
   */
  readonly collapsible?: boolean | undefined;
}

/** Props of an {@link AccordionRoot} with `type="multiple"`: each item opens and closes on its own. */
export interface AccordionMultipleRootProps extends AccordionRootBaseProps {
  /**
   * How many items can be open at the same time. `multiple` lets each item open and close on its own.
   *
   * @cckSemantic accordion.type
   * @cckParity Not available in every framework.
   */
  readonly type: 'multiple';
  /**
   * The values of the open items. Setting it makes the accordion controlled. If you do not update it after
   * `onValueChange`, the old value stays.
   *
   * When not set, the accordion keeps its own value, which starts as `defaultValue`.
   *
   * @cckSemantic accordion.value
   * @cckParity The controlled value.
   */
  readonly value?: readonly string[] | undefined;
  /**
   * The start values of an accordion that you do not control with `value`. Pass it to render open items on the
   * server.
   *
   * @defaultValue []
   * @cckSemantic none
   * @cckParity The uncontrolled start value.
   */
  readonly defaultValue?: readonly string[] | undefined;
  /**
   * Called after the user opens or closes an item. It receives the new list of open values and a details object
   * with the `reason` and the `event`.
   *
   * It is never called when you change `value` yourself.
   *
   * @cckSemantic accordion.valueChange
   * @cckParity Not available in every framework.
   */
  readonly onValueChange?: ((value: readonly string[], details: AccordionChangeDetails) => void) | undefined;
}

/** Props of the {@link AccordionRoot}: a single accordion or a multiple one, told apart by `type`. */
export type AccordionRootProps = AccordionSingleRootProps | AccordionMultipleRootProps;

/** Props of the {@link AccordionItem}. Native `div` props pass through. */
export interface AccordionItemProps extends Omit<ComponentPropsWithRef<'div'>, 'color'> {
  /**
   * The header and the content of the item: an `Accordion.Header` and an `Accordion.Content`. When not set, the
   * item is empty.
   *
   * @example
   * <Accordion.Item value="shipping">
   *   <Accordion.Header>
   *     <Accordion.Trigger>Shipping</Accordion.Trigger>
   *   </Accordion.Header>
   *   <Accordion.Content>Orders leave in two days.</Accordion.Content>
   * </Accordion.Item>
   * @cckSemantic accordion.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * The key of the item in the open value. It must be unique inside the Root.
   *
   * @cckSemantic accordion.item.value
   * @cckParity Not available in every framework.
   */
  readonly value: string;
  /**
   * Whether the item is disabled. The user cannot open or close it, and the arrow keys skip its trigger. A
   * controlled `value` can still open it.
   *
   * @defaultValue false
   * @cckSemantic accordion.item.disabled
   */
  readonly disabled?: boolean | undefined;
  /**
   * Replaces the element that the part renders. Pass an element, or a function of the merged props and the state
   * of the part. The function must pass all props on, `ref` included, to one element.
   *
   * When not set, the part renders its own element.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   * @cckShared
   */
  readonly render?: RenderProp<AccordionRenderProps, AccordionItemState> | undefined;
}

/** Props of the {@link AccordionHeader}. Native `h3` props pass through. */
export interface AccordionHeaderProps extends Omit<ComponentPropsWithRef<'h3'>, 'color'> {
  /**
   * The trigger of the item: an `Accordion.Trigger`. When not set, the heading is empty.
   *
   * @example
   * <Accordion.Header>
   *   <Accordion.Trigger>Shipping</Accordion.Trigger>
   * </Accordion.Header>
   * @cckSemantic accordion.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * Replaces the `<h3>` of the header. Pass a heading such as `<h2 />` for the level that fits the page. You can
   * also pass a function of the merged props and the state of the item.
   *
   * The function must pass all props on, `ref` included, to one element.
   *
   * @defaultValue 'h3'
   * @cckSemantic accordion.header.headingLevel
   * @cckParity Sets the heading level by replacing the rendered element.
   */
  readonly render?: RenderProp<AccordionRenderProps, AccordionItemState> | undefined;
}

/** Props of the {@link AccordionTrigger}. Native button props pass through. */
export interface AccordionTriggerProps extends Omit<ComponentPropsWithRef<'button'>, 'color' | 'disabled' | 'value'> {
  /**
   * The text of the trigger, which is also its accessible name. When not set, the trigger has no name, so you
   * must give it an `aria-label`.
   *
   * @example
   * <Accordion.Trigger>Shipping</Accordion.Trigger>
   * @cckSemantic accordion.label
   * @cckParity The label is the content of the trigger part.
   */
  readonly children?: ReactNode | undefined;
  /**
   * Whether the rendered element is a native `<button>`. Set it to `false` when `render` gives another element.
   *
   * That element then gets `role="button"`, `tabindex="0"` and activation by Enter and Space. It gets no `type`,
   * and `aria-disabled="true"` in place of `disabled`. In development, a tag that does not match logs an error.
   *
   * @defaultValue true
   * @cckSemantic none
   * @cckParity Tells the part what element `render` produces.
   */
  readonly nativeButton?: boolean | undefined;
  /**
   * Replaces the element that the part renders. Pass an element, or a function of the merged props and the state
   * of the part. The function must pass all props on, `ref` included, to one element.
   *
   * When not set, the part renders its own element. An element that is not a `<button>` also needs
   * `nativeButton={false}`.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   * @cckShared
   */
  readonly render?: RenderProp<AccordionRenderProps, AccordionItemState> | undefined;
}

/** Props of the {@link AccordionContent}. Native `div` props pass through. */
export interface AccordionContentProps extends Omit<ComponentPropsWithRef<'div'>, 'color'> {
  /**
   * The body of the section, shown while the item is open. When not set, the open section is empty.
   *
   * @example
   * <Accordion.Content>Orders leave in two days.</Accordion.Content>
   * @cckSemantic accordion.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * Whether the content stays rendered while the item is closed. The element then has the native `hidden`
   * attribute, so a form control inside still takes part in the form.
   *
   * @defaultValue false
   * @cckSemantic accordion.content.forceMount
   * @cckParity Not available in every framework.
   */
  readonly forceMount?: boolean | undefined;
  /**
   * Replaces the element that the part renders. Pass an element, or a function of the merged props and the state
   * of the part. The function must pass all props on, `ref` included, to one element.
   *
   * When not set, the part renders its own element.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   * @cckShared
   */
  readonly render?: RenderProp<AccordionRenderProps, AccordionItemState> | undefined;
}

/** An Accordion part: a function component with its `displayName`. The Content renders nothing while closed. */
export interface AccordionPart<P> {
  (props: P): ReactElement | null;
  displayName: string;
}
