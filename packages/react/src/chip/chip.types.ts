import type { ComponentPropsWithRef, HTMLAttributes, ReactNode, RefCallback } from 'react';
import type { RenderProp } from '../internal/render-element';

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
   * Whether the chip is disabled. The root and the remove button get `data-disabled`, and the button is natively
   * disabled, so a disabled chip never reports a removal.
   *
   * @defaultValue false
   */
  readonly disabled?: boolean | undefined;
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
