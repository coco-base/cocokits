import type { Component } from 'vue';
import type { AsTag } from '@cocokits/vue-core';

/**
 * The area at the top of the list. It renders a `<div>` and holds the `SelectSearch`.
 *
 * @remarks It adds no role. Without `filter` the `<div>` is `hidden` and empty: its children are not rendered.
 *
 * @example
 * <SelectHeader><SelectSearch /></SelectHeader>
 *
 * @cckPart header
 */
export interface SelectHeaderProps {
  /**
   * The tag or component to render in place of the element of the part. The part keeps its class and its state. It
   * is ignored with `asChild`.
   *
   * When not set, the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the part merges onto its first child element or component, instead of rendering its own element. When
   * not set, the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/**
 * The search box of a Select with `filter`. It renders a native `<input type="search">` with `role="combobox"`, written inside the `SelectHeader`. Without `filter` the `<input>` is `hidden`, takes no focus and is not known to the Select.
 *
 * @remarks The focus stays in it while the list is open, and `aria-activedescendant` points at the highlighted option. Typing keeps the options whose text contains the query, ignoring case. The query clears when the list closes. ArrowDown and ArrowUp move the highlight, and Enter chooses it. Escape closes the list and returns the focus to the trigger, and Tab closes it too. Its name is "Search"; give it `aria-label` for another name.
 *
 * @example
 * <SelectSearch aria-label="Search dishes" />
 *
 * @cckPart search
 */
export interface SelectSearchProps {
  /**
   * The accessible name of the search box. Write it as `aria-label` in a template.
   *
   * @cckSemantic select.search.ariaLabel
   * @cckParity Written as the native `aria-label` attribute.
   * @defaultValue 'Search'
   */
  readonly ariaLabel?: string | undefined;
  /**
   * The text shown in the search box while it is empty. When not set, the box shows no placeholder.
   *
   * @cckSemantic select.search.placeholder
   * @cckParity A native attribute of the element.
   */
  readonly placeholder?: string | undefined;
}

/**
 * The text shown while the query matches no option. It renders a `<div role="status">`, so assistive technology announces it politely, and only while a `filter` finds nothing.
 *
 * @example
 * <SelectEmpty>No dish found</SelectEmpty>
 *
 * @cckPart empty
 */
export interface SelectEmptyProps {
  /**
   * The tag or component to render in place of the element of the part. The part keeps its class and its state. It
   * is ignored with `asChild`.
   *
   * When not set, the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the part merges onto its first child element or component, instead of rendering its own element. When
   * not set, the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/**
 * The area at the bottom of the list, written inside `SelectContent` after the items. It renders a `<div>` that holds your own actions, such as a button or a link. It adds no role.
 *
 * @remarks A press in it does not close the list.
 *
 * @example
 * <SelectFooter><button type="button">Add a dish</button></SelectFooter>
 *
 * @cckPart footer
 */
export interface SelectFooterProps {
  /**
   * The tag or component to render in place of the element of the part. The part keeps its class and its state. It
   * is ignored with `asChild`.
   *
   * When not set, the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the part merges onto its first child element or component, instead of rendering its own element. When
   * not set, the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/**
 * What comes before the text of an item, such as an icon or a picture, written inside `SelectItem`. It renders a `<span>` that assistive technology does not see, so the text names the item.
 *
 * @example
 * <SelectOptionLeading><SvgIcon icon-name="pizza" /></SelectOptionLeading>
 *
 * @cckPart optionLeading
 */
export interface SelectOptionLeadingProps {
  /**
   * The tag or component to render in place of the element of the part. The part keeps its class and its state. It
   * is ignored with `asChild`.
   *
   * When not set, the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the part merges onto its first child element or component, instead of rendering its own element. When
   * not set, the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/**
 * A smaller text under or beside the text of an item, written inside `SelectItem`. It renders a `<span>` and is the `aria-describedby` of the item.
 *
 * @example
 * <SelectOptionDescription>Tomato and cheese</SelectOptionDescription>
 *
 * @cckPart optionDescription
 */
export interface SelectOptionDescriptionProps {
  /**
   * The tag or component to render in place of the element of the part. The part keeps its class and its state. It
   * is ignored with `asChild`.
   *
   * When not set, the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the part merges onto its first child element or component, instead of rendering its own element. When
   * not set, the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}
