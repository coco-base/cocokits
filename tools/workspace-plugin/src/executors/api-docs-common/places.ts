import type ts from 'typescript';

const PLACES = new WeakMap<object, ts.Node>();

/**
 * Notes where a member or a part of the JSON was declared, and returns it. The names its type text writes are then
 * read in that scope ({@link placeOf}), so a type that only the declaring file imports is found.
 */
export function placeAt<T extends object>(item: T, node: ts.Node | undefined): T {
  if (node !== undefined) PLACES.set(item, node);
  return item;
}

/**
 * The declaration {@link placeAt} noted for a member or a part, or undefined. The note belongs to the object: a
 * copy (`{ ...member }`) has none, so code that copies a member must call `placeAt` on the copy.
 */
export const placeOf = (item: object): ts.Node | undefined => PLACES.get(item);
