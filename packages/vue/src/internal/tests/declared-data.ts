/**
 * The `data-*` attributes that the rendered parts carry and the meta does not declare for them. A part is found
 * by its anatomy class anywhere in the document (the overlays render outside the container). The result lists
 * `part: data-name`, so a failure names what leaked. It is empty when every attribute is declared.
 *
 * @param classes - The anatomy classes by part.
 * @param declared - The `data-*` names the meta declares by part.
 * @returns The undeclared attributes, and the parts that were not found.
 */
export function undeclaredData(
  classes: Readonly<Record<string, string>>,
  declared: Readonly<Record<string, readonly string[]>>,
): { readonly undeclared: string[]; readonly found: string[] } {
  const undeclared: string[] = [];
  const found: string[] = [];
  for (const [part, allowed] of Object.entries(declared)) {
    const className = classes[part];
    if (!className) continue;
    const elements = document.querySelectorAll(`.${className}`);
    if (elements.length > 0) found.push(part);
    for (const element of elements) {
      for (const name of element.getAttributeNames()) {
        if (name.startsWith('data-') && !allowed.includes(name)) undeclared.push(`${part}: ${name}`);
      }
    }
  }
  return { undeclared, found };
}
