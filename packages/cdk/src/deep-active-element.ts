/**
 * The focused element of a document, looking through open shadow roots.
 *
 * @param doc - The document.
 * @returns The element, or `null` when the document has none.
 */
export function deepActiveElement(doc: Document): Element | null {
  let active = doc.activeElement;
  while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement;
  return active;
}
