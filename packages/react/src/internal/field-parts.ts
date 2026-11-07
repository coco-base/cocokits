import { Children, Fragment, cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';

interface PartProps {
  readonly id?: string | undefined;
  readonly children?: ReactNode;
}

/** The elements of a zone in document order; a Fragment is looked through. */
function elementsOf(node: ReactNode): ReactElement<PartProps>[] {
  const found: ReactElement<PartProps>[] = [];
  Children.forEach(node, (child) => {
    if (!isValidElement<PartProps>(child)) return;
    if (child.type === Fragment) found.push(...elementsOf(child.props.children));
    else found.push(child);
  });
  return found;
}

/**
 * Reads the `id` the author wrote on each part of a zone (the `hint` or the `error` of a FormField).
 *
 * @param node - The zone.
 * @returns One entry per part in document order: its `id`, or `undefined`.
 */
export function ownPartIds(node: ReactNode): (string | undefined)[] {
  return elementsOf(node).map((element) => element.props.id);
}

/**
 * Gives each part of a zone its id, in document order, unless the author wrote one. Because the ids come from the
 * props, the first render (also on the server) already has them.
 *
 * @param node - The zone.
 * @param ids - The id of each part, from `formFieldIds`.
 * @returns The zone with the ids set.
 */
export function withPartIds(node: ReactNode, ids: readonly string[] | undefined): ReactNode {
  if (!ids || ids.length === 0) return node;
  let next = 0;
  const walk = (zone: ReactNode): ReactNode =>
    Children.map(zone, (child) => {
      if (!isValidElement<PartProps>(child)) return child;
      if (child.type === Fragment) return cloneElement(child, undefined, walk(child.props.children));
      const id = ids[next++];
      return child.props.id === undefined || child.props.id === '' ? cloneElement(child, { id }) : child;
    });
  return walk(node);
}
