import { Fragment, type ComponentPublicInstance } from 'vue';

/**
 * The DOM element a part rendered: `$el`, or the first element inside the part's own fragment (a
 * comment or text may sit next to an `asChild` child). `null` before mount, or when it holds none.
 *
 * @internal
 * @param instance - The component instance of the part, from a template ref.
 * @returns The element, or `null`.
 */
export function rootElementOf(instance: ComponentPublicInstance | null | undefined): Element | null {
  let node: Node | null | undefined = instance?.$el as Node | null | undefined;
  if (node?.nodeType === 1) return node as Element;
  const tree = instance?.$.subTree;
  if (tree?.type !== Fragment) return null;
  const end = tree.anchor as Node | null;
  while (node && node !== end) {
    node = node.nextSibling;
    if (node && node !== end && node.nodeType === 1) return node as Element;
  }
  return null;
}
