/**
 * One icon: the `viewBox` of the `<svg>` that draws it and the markup inside that `<svg>`.
 *
 * Trusted content only: `body` is inserted as markup, with no sanitising. Register only icons you wrote or reviewed;
 * never build one from text of users or other untrusted sources.
 */
export interface Icon {
  /** The `viewBox` attribute of the `<svg>`, for example `0 0 24 24`. */
  readonly viewBox: string;
  /**
   * The markup inside the `<svg>`; any tags are allowed (`path`, `g`, `circle`, ...). Paint with `currentColor` so
   * the CSS `color` of the page colours the icon.
   */
  readonly body: string;
}
