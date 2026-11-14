import type { ComponentPropsWithRef, HTMLAttributes, ReactElement, ReactNode, RefCallback } from 'react';
import type { OverlayAlign, OverlaySide } from '@cocokits/cdk/positioning';
import type { MenuAlign, MenuChangeReason, MenuSide } from '@cocokits/machines/menu';
import type { CancelableChangeDetails } from '../internal/cancelable-change-details';
import type { FocusOutsideEvent, PointerDownOutsideEvent } from '../internal/dismiss-handlers';
import type { RenderProp } from '../internal/render-element';

export type {
  CancelableChangeDetails,
  FocusOutsideEvent,
  MenuAlign,
  MenuChangeReason,
  MenuSide,
  PointerDownOutsideEvent,
};

/**
 * What `onOpenChange` receives besides the open state: the `reason`, the `event` behind the change, and `cancel()`
 * to refuse the change.
 */
export type MenuChangeDetails = CancelableChangeDetails<MenuChangeReason>;

/** The state of the Trigger and the Item that `render` receives. */
export interface MenuState {
  /** Whether the menu is open. */
  readonly open: boolean;
}

/** The state of the Content that the function form of `render` receives. */
export interface MenuContentState extends MenuState {
  /** The side of the trigger that the content sits on after a flip, the same as `data-side`. */
  readonly side: MenuSide;
  /** The alignment along the edge of the trigger after a shift, the same as `data-align`. */
  readonly align: MenuAlign;
}

/** The state of an Item that the function form of `render` receives. */
export interface MenuItemState extends MenuState {
  /** Whether the item is disabled. */
  readonly disabled: boolean;
}

/**
 * The props that the function form of `render` receives: the native props merged with the props of the part. Pass
 * all of them, `ref` included, to one element.
 */
export interface MenuRenderProps extends Omit<HTMLAttributes<HTMLElement>, 'color'> {
  /** Any `data-*` attribute, such as `data-state` and the theme options. */
  readonly [attribute: `data-${string}`]: string | undefined;
  /** The merged ref: the `ref` of the part, the `ref` of the rendered element and the `ref` of the part itself. */
  readonly ref: RefCallback<HTMLElement>;
}

/** Props of the {@link MenuRoot}. The Root renders no element. It gives the open state to its parts. */
export interface MenuRootProps {
  /**
   * The parts of the menu: a `Menu.Trigger` and a `Menu.Content`. The Root renders no element around them. When not
   * set, nothing renders.
   *
   * @example
   * <Menu.Root>
   *   <Menu.Trigger>Actions</Menu.Trigger>
   *   <Menu.Content>
   *     <Menu.Item>Edit</Menu.Item>
   *   </Menu.Content>
   * </Menu.Root>
   * @cckSemantic menu.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * Whether the menu is open. Setting it makes the open state controlled. If you do not update it after
   * `onOpenChange`, the old state stays.
   *
   * @defaultValue false
   * @cckSemantic menu.open
   */
  readonly open?: boolean | undefined;
  /**
   * The start open state of a menu that you do not control with `open`. The content mounts after hydration, so a
   * menu that starts open is closed on the server.
   *
   * @defaultValue false
   * @cckSemantic none
   * @cckParity The uncontrolled start value.
   */
  readonly defaultOpen?: boolean | undefined;
  /**
   * Called before the user opens or closes the menu. It receives the new open state and a details object with the
   * `reason`, the `event` and `cancel()`.
   *
   * The user can do this with the trigger, an item, Escape, a press outside, or by moving the focus away. Call
   * `details.cancel()` to refuse the change. It is never called when you change `open` yourself.
   *
   * @example
   * <Menu.Root
   *   onOpenChange={(open, details) => {
   *     if (!open && details.reason === 'outside-press') details.cancel();
   *   }}
   * >
   *   ...
   * </Menu.Root>
   * @cckSemantic menu.openChange
   * @cckParity The change callback of this component.
   */
  readonly onOpenChange?: ((open: boolean, details: MenuChangeDetails) => void) | undefined;
}

/** Props of the {@link MenuTrigger}. Native button props pass through. */
export interface MenuTriggerProps extends Omit<ComponentPropsWithRef<'button'>, 'color'> {
  /**
   * The label of the trigger, which is also the accessible name of the menu. When not set, the trigger has no name,
   * so you must give it an `aria-label`.
   *
   * @example
   * <Menu.Trigger>Actions</Menu.Trigger>
   * @cckSemantic menu.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * Whether the rendered element is a native `<button>`. Set it to `false` when `render` gives another element.
   *
   * That element then gets `role="button"`, `tabindex="0"` and activation by Enter and Space, and no `type`. In
   * development, a tag that does not match logs an error.
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
  readonly render?: RenderProp<MenuRenderProps, MenuState> | undefined;
}

/** Props of the {@link MenuContent}. Native `div` props pass through. */
export interface MenuContentProps extends Omit<ComponentPropsWithRef<'div'>, 'color'> {
  /**
   * The items of the menu, and any Divider between them. When not set, the menu is empty and the content takes the
   * focus when it opens.
   *
   * @example
   * <Menu.Content>
   *   <Menu.Item>Edit</Menu.Item>
   *   <Menu.Item disabled>Move</Menu.Item>
   * </Menu.Content>
   * @cckSemantic menu.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * Called when the user presses Escape while this menu is on top, before it closes. Call `event.preventDefault()`
   * to keep it open.
   *
   * It is not called for a close request without a key. Refuse that one with `details.cancel()` in
   * `onOpenChange`. An item, the trigger, a press outside and moving the focus away still close it.
   *
   * @example
   * const [saving, setSaving] = useState(false);
   * <Menu.Content onEscapeKeyDown={(event) => saving && event.preventDefault()}>...</Menu.Content>
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly onEscapeKeyDown?: ((event: KeyboardEvent) => void) | undefined;
  /**
   * Called when the user presses a pointer outside this menu, before it closes. Call `event.preventDefault()` to
   * keep it open.
   *
   * The press is `event.detail.originalEvent`.
   *
   * @example
   * <Menu.Content onPointerDownOutside={(event) => event.preventDefault()}>...</Menu.Content>
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly onPointerDownOutside?: ((event: PointerDownOutsideEvent) => void) | undefined;
  /**
   * Called when the focus moves outside this menu, before it closes. Call `event.preventDefault()` to keep it open.
   *
   * The focus event is `event.detail.originalEvent`.
   *
   * @example
   * <Menu.Content onFocusOutside={(event) => event.preventDefault()}>...</Menu.Content>
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly onFocusOutside?: ((event: FocusOutsideEvent) => void) | undefined;
  /**
   * Called after `onPointerDownOutside` or `onFocusOutside`, with the same event. Call `event.preventDefault()` to
   * keep the menu open.
   *
   * @example
   * <Menu.Content onInteractOutside={(event) => event.preventDefault()}>...</Menu.Content>
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly onInteractOutside?: ((event: PointerDownOutsideEvent | FocusOutsideEvent) => void) | undefined;
  /**
   * The side of the trigger that the content should sit on. `start` and `end` follow the text direction.
   *
   * The content flips to the other side when it does not fit, and `data-side` says where it is.
   *
   * @defaultValue 'bottom'
   * @cckSemantic menu.content.side
   */
  readonly side?: OverlaySide | undefined;
  /**
   * The alignment of the content along the edge of the trigger. The content shifts to stay in view, and
   * `data-align` says where it is.
   *
   * @defaultValue 'start'
   * @cckSemantic menu.content.align
   */
  readonly align?: OverlayAlign | undefined;
  /**
   * The gap in pixels between the trigger and the content. When not set, the content takes the `--side-offset`
   * value of the theme.
   *
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly sideOffset?: number | undefined;
  /**
   * How far, in pixels, the content moves along the edge of the trigger, away from the aligned edge. It has no
   * effect with `align="center"`.
   *
   * @defaultValue 0
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly alignOffset?: number | undefined;
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
  readonly render?: RenderProp<MenuRenderProps, MenuContentState> | undefined;
}

/** Props of the {@link MenuItem}. Native `div` props pass through, except `onSelect`, which this part redefines. */
export interface MenuItemProps extends Omit<ComponentPropsWithRef<'div'>, 'color' | 'onSelect'> {
  /**
   * The content of the item: its text, and an icon if you want one. The text is also what typing a character
   * finds. When not set, the item is empty, so give it an `aria-label`.
   *
   * @example
   * <Menu.Item>Edit</Menu.Item>
   * @cckSemantic menu.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * Whether the item is disabled. A disabled item stays in the menu, keeps the focus and runs nothing.
   *
   * @defaultValue false
   * @cckSemantic menu.item.disabled
   */
  readonly disabled?: boolean | undefined;
  /**
   * Called once when the user runs the item with a click, Enter or Space. It receives its own event, not the
   * click. By default the menu then closes and the focus returns to the trigger.
   *
   * Call `event.preventDefault()` to keep the menu open.
   *
   * @example
   * <Menu.Item onSelect={(event) => { event.preventDefault(); toggleFavorite(); }}>Favorite</Menu.Item>
   * @cckSemantic menu.item.activate
   * @cckParity The item event of this component.
   */
  readonly onSelect?: ((event: Event) => void) | undefined;
  /**
   * Replaces the element that the part renders. Pass an element, or a function of the merged props and the state
   * of the part. The function must pass all props on, `ref` included, to one element.
   *
   * When not set, the part renders its own element. To make a link item, render an `<a href>`: Enter and Space click
   * it, so it follows the link.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   * @cckShared
   */
  readonly render?: RenderProp<MenuRenderProps, MenuItemState> | undefined;
}

/** A Menu part: a function component with its `displayName`. */
export interface MenuPart<P, R extends ReactElement | null = ReactElement> {
  (props: P): R;
  displayName: string;
}
