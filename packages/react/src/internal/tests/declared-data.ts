/**
 * The `data-*` names on every rendered element of each part, checked against the names the meta declares for it
 * (architecture §3: undeclared output fails a test).
 *
 * @param classes - The anatomy class of each part.
 * @param declared - The `data-*` names the meta declares for each part.
 * @param root - Where to look; the whole document by default (overlay parts render in a portal).
 * @returns The part, its undeclared names and how many elements were found, for each part of the meta.
 */
export function undeclaredData(
  classes: Readonly<Record<string, string>>,
  declared: Readonly<Record<string, readonly string[]>>,
  root: ParentNode = document,
): { part: string; found: number; undeclared: string[] }[] {
  return Object.entries(declared).map(([part, names]) => {
    const elements = [...root.querySelectorAll(`.${classes[part] ?? '\0'}`)];
    const undeclared = elements.flatMap((element) =>
      element.getAttributeNames().filter((name) => name.startsWith('data-') && !names.includes(name)),
    );
    return { part, found: elements.length, undeclared };
  });
}
