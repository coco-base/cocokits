/** The names of the two custom properties that {@link writeContentSize} sets. */
export interface ContentSizeVariables {
  /** The custom property that receives the height, for example `--panel-content-height`. */
  readonly height: string;
  /** The custom property that receives the width, for example `--panel-content-width`. */
  readonly width: string;
}

/**
 * Writes the full scroll size of an element, in px, to two custom properties on the same element.
 * Use them in CSS to animate the element from or to its natural size, such as a panel that opens.
 *
 * @remarks
 * A running height animation does not change `scrollHeight` or `scrollWidth`, so the values stay correct
 * while the element animates. Call it in the browser after the element is rendered, not while rendering.
 *
 * @param element - The element to measure. It also receives the custom properties.
 * @param variables - The names of the custom properties for the height and the width.
 * @example
 * const panel = document.querySelector<HTMLElement>('#panel')!;
 * writeContentSize(panel, { height: '--panel-content-height', width: '--panel-content-width' });
 * // CSS: #panel { height: var(--panel-content-height); }
 */
export function writeContentSize(element: HTMLElement, variables: ContentSizeVariables): void {
  element.style.setProperty(variables.height, `${String(element.scrollHeight)}px`);
  element.style.setProperty(variables.width, `${String(element.scrollWidth)}px`);
}
