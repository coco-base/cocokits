/**
 * Finds the element that has focus in a document, looking through open shadow roots.
 *
 * @param doc - The document to read.
 * @returns The focused element, or `null` when the document has none.
 * @example
 * const active = deepActiveElement(document);
 * console.log(active?.localName);
 */
export function deepActiveElement(doc: Document): Element | null {
  let active = doc.activeElement;
  while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement;
  return active;
}
