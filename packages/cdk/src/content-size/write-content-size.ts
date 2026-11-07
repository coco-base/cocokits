/** The names of the two custom properties that `writeContentSize` sets. */
export interface ContentSizeVariables {
  /** The custom property that receives the content height, for example `--accordion-content-height`. */
  readonly height: string;
  /** The custom property that receives the content width, for example `--accordion-content-width`. */
  readonly width: string;
}

/**
 * Writes the full scroll size of an element, in px, to two custom properties on that element.
 * A running height animation does not change `scrollHeight` or `scrollWidth`, so the values stay
 * correct while the element animates. Browser only: call it after render, never during it.
 *
 * @param element - The element to measure and to write the variables to.
 * @param variables - The names of the height and width custom properties.
 */
export function writeContentSize(element: HTMLElement, variables: ContentSizeVariables): void {
  element.style.setProperty(variables.height, `${String(element.scrollHeight)}px`);
  element.style.setProperty(variables.width, `${String(element.scrollWidth)}px`);
}
