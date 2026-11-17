import type { ComponentPropsWithRef, ReactNode } from 'react';
import type { SelectRender } from './select.types';

/** The `render` prop every part has; its TSDoc is repeated on each part's props. */
interface SelectRenderOption {
  /**
   * Replaces the element that the part renders. Pass an element, or a function of the merged props that returns an element. The function must pass all props on, `ref` included, to one element.
   *
   * When not set, the part renders its own element.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   * @cckShared
   */
  readonly render?: SelectRender | undefined;
}

/** Props of the {@link SelectHeader}: native `div` props and `render`. */
export interface SelectHeaderProps extends Omit<ComponentPropsWithRef<'div'>, 'color'>, SelectRenderOption {
  /**
   * The content of the header: the `Select.Search`, and anything else you want above the options. When not set,
   * the header is empty.
   *
   * @example
   * <Select.Header>
   *   <Select.Search />
   * </Select.Header>
   * @cckSemantic select.default
   */
  readonly children?: ReactNode | undefined;
}

/**
 * Props of the {@link SelectSearch}: native `input` props and `render`. The `type`, the `role`, the value and the
 * `aria-*` of the combobox belong to the Select.
 */
export interface SelectSearchProps
  extends
    Omit<ComponentPropsWithRef<'input'>, 'color' | 'type' | 'role' | 'value' | 'defaultValue' | 'children' | 'onInput'>,
    SelectRenderOption {
  /**
   * The accessible name of the search input. When not set, the name is "Search".
   *
   * @example
   * <Select.Search aria-label="Search dishes" />
   * @cckSemantic select.search.ariaLabel
   * @cckParity A native attribute of the element.
   * @defaultValue 'Search'
   */
  readonly 'aria-label'?: string | undefined;
  /**
   * The hint that shows in the search input while it is empty. When not set, the input shows no hint.
   *
   * @cckSemantic select.search.placeholder
   * @cckParity A native attribute of the element.
   */
  readonly placeholder?: string | undefined;
}

/** Props of the {@link SelectEmpty}: native `div` props and `render`. */
export interface SelectEmptyProps extends Omit<ComponentPropsWithRef<'div'>, 'color'>, SelectRenderOption {
  /**
   * What to say while no option matches the query, as text or markup. A screen reader announces it politely. When
   * not set, the part is empty.
   *
   * @example
   * <Select.Empty>No dish found</Select.Empty>
   * @cckSemantic select.default
   */
  readonly children?: ReactNode | undefined;
}

/** Props of the {@link SelectFooter}: native `div` props and `render`. */
export interface SelectFooterProps extends Omit<ComponentPropsWithRef<'div'>, 'color'>, SelectRenderOption {
  /**
   * The content of the footer: your own actions, such as a button that adds a choice. When not set, the footer is
   * empty.
   *
   * @example
   * <Select.Footer>
   *   <button type="button">Add a dish</button>
   * </Select.Footer>
   * @cckSemantic select.default
   */
  readonly children?: ReactNode | undefined;
}

/** Props of the {@link SelectCount}: native `span` props and `render`. */
export interface SelectCountProps
  extends Omit<ComponentPropsWithRef<'span'>, 'color' | 'children'>, SelectRenderOption {
  /**
   * The text of the count. When not set, the count shows `+N`, where N is the number of selected values after the
   * first one.
   *
   * @example
   * <Select.Count>and more</Select.Count>
   * @cckSemantic select.default
   * @cckParity The count is built in.
   */
  readonly children?: ReactNode | undefined;
}

/** Props of the {@link SelectOptionDescription}: native `span` props and `render`. */
export interface SelectOptionDescriptionProps extends Omit<ComponentPropsWithRef<'span'>, 'color'>, SelectRenderOption {
  /**
   * The text under the text of the option, such as a hint. When not set, the part is empty.
   *
   * @example
   * <Select.OptionDescription>Baked in a stone oven</Select.OptionDescription>
   * @cckSemantic select.default
   */
  readonly children?: ReactNode | undefined;
}

/** Props of the {@link SelectOptionLeading}: native `span` props and `render`. */
export interface SelectOptionLeadingProps extends Omit<ComponentPropsWithRef<'span'>, 'color'>, SelectRenderOption {
  /**
   * The decorative content before the text of the option, such as an icon or an avatar. It is hidden from assistive
   * technology, so the text of the option names the option. When not set, the part is empty.
   *
   * @example
   * <Select.OptionLeading>
   *   <SvgIcon iconName="house" />
   * </Select.OptionLeading>
   * @cckSemantic select.default
   */
  readonly children?: ReactNode | undefined;
}
