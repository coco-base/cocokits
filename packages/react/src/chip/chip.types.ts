import type { ComponentPropsWithRef, HTMLAttributes, ReactNode, RefCallback } from 'react';
import type { ChangeDetails } from '@cocokits/shared';
import type { RenderProp } from '../internal/render-element';

/**
 * Why the selected state of a Chip changed.
 *
 * @cckValue user - The user pressed the toggle with a click, Enter or Space.
 */
export type ChipChangeReason = 'user';

/** What `onSelectedChange` receives besides the value: the `reason` and the `event` behind the change. */
export type ChipChangeDetails = ChangeDetails<ChipChangeReason>;

/**
 * The root props that the function form of `render` receives: the native props merged with the props of the chip.
 * Pass all of them, `children` and `ref` included, to one element.
 */
export interface ChipRenderProps extends Omit<HTMLAttributes<HTMLElement>, 'color'> {
  /** Any `data-*` attribute: the state of the chip and the theme options. */
  readonly [attribute: `data-${string}`]: string | undefined;
  /** The merged ref: the `ref` of the Chip, the `ref` of the rendered element and the `ref` of the Chip itself. */
  readonly ref: RefCallback<HTMLElement>;
}

/**
 * Props of the {@link Chip}. Native `div` props pass through to the root, and `ref` reaches it.
 */
export interface ChipProps extends Omit<ComponentPropsWithRef<'div'>, 'children' | 'color'> {
  /**
   * The content of the chip: the text it shows. It also names the remove button. When not set, the chip shows no
   * text.
   *
   * @example
   * <Chip>Pizza</Chip>
   */
  readonly children?: ReactNode;
  /**
   * Whether the chip has a button that removes it. The button is a native `<button type="button">` in the tab order.
   *
   * @defaultValue false
   */
  readonly removable?: boolean | undefined;
  /**
   * Whether the chip is disabled. The root gets `data-disabled`, a selectable chip's toggle is natively disabled, and
   * a disabled chip renders no remove button, so it never reports a removal.
   *
   * @defaultValue false
   */
  readonly disabled?: boolean | undefined;
  /**
   * Whether the chip is selected. Setting it, to `true` or `false`, makes the chip selectable and controlled. When
   * not set, the chip is not selectable.
   *
   * @remarks
   * The content is then a toggle `<button>` with `aria-pressed`, and a check shows while selected. If you do not
   * update it after `onSelectedChange`, the old state stays.
   *
   * @cckSemantic chip.selected
   */
  readonly selected?: boolean | undefined;
  /**
   * The start state of a selectable chip that you do not control with `selected`. Setting it, to `true` or `false`,
   * makes the chip selectable. When not set, the chip is not selectable.
   *
   * @cckSemantic none
   * @cckParity The uncontrolled start value.
   */
  readonly defaultSelected?: boolean | undefined;
  /**
   * Called after the user presses the toggle of a selectable chip. It receives the new state and a details object
   * with the `reason` and the `event`. It is never called when you change `selected` yourself.
   *
   * @example
   * <Chip selected={on} onSelectedChange={(selected) => setOn(selected)}>
   *   Pizza
   * </Chip>
   * @cckSemantic chip.selectedChange
   * @cckParity The change callback of this component.
   */
  readonly onSelectedChange?: ((selected: boolean, details: ChipChangeDetails) => void) | undefined;
  /**
   * The accessible name of the remove button. When not set, the name is "Remove" and the text of the chip, for
   * example "Remove Pizza". An empty string counts as not set.
   *
   * @cckSemantic chip.removeLabel
   * @defaultValue "Remove <chip text>"
   */
  readonly removeLabel?: string | undefined;
  /**
   * The `id` of the chip. The content wrapper gets the id `<id>-content`. When not set, the chip gets a generated
   * id that is the same on the server and in the browser.
   */
  readonly id?: string | undefined;
  /**
   * Called when the user activates the remove button, with a click or with Enter or Space. It has no value. The
   * chip never removes itself, so you remove it from your data.
   *
   * @example
   * <Chip removable onRemove={() => setTags((tags) => tags.filter((tag) => tag !== 'Pizza'))}>
   *   Pizza
   * </Chip>
   * @remarks
   * A chip that leaves the DOM keeps no focus. Move the focus to the next chip or to the control that added it.
   * @cckSemantic chip.remove
   * @cckParity The remove event of this component.
   */
  readonly onRemove?: (() => void) | undefined;
  /**
   * Replaces the root element. Pass an element, or a function of the root props that returns an element.
   *
   * When not set, the root is a `<div>`.
   *
   * @remarks
   * The content and the remove button stay. The element form keeps the `ref` of the element. The function form does
   * not work from a Server Component.
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   */
  readonly render?: RenderProp<ChipRenderProps, undefined> | undefined;
}
