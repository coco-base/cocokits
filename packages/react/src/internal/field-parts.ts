import { Children, Fragment, cloneElement, createElement, isValidElement, type ReactNode } from 'react';
import { FieldError } from '../field-error/field-error';
import { Hint } from '../hint/hint';

interface PartProps {
  readonly id?: string | undefined;
  readonly children?: ReactNode;
}

/** The zone of a FormField that holds the parts: `hint` holds Hints, `error` holds FieldErrors. */
export type FieldZone = 'hint' | 'error';

/** A zone read once per render: its items in document order, the parts among them and their own ids. */
export interface ZoneParts {
  /** The items of the zone, with Fragments read through and each run of plain text wrapped in its part. */
  readonly items: readonly ReactNode[];
  /** The `id` the author wrote on each part, in document order; `undefined` for none. */
  readonly ownIds: readonly (string | undefined)[];
  /** Whether an element that is not a part holds a Hint or a FieldError, which the field does not read into. */
  readonly hasWrapper: boolean;
}

const partOf = (zone: FieldZone): unknown => (zone === 'hint' ? Hint : FieldError);
const isText = (node: ReactNode): node is string | number => typeof node === 'string' || typeof node === 'number';

/** Whether a node holds a Hint or a FieldError element at any depth. */
function holdsPart(node: ReactNode): boolean {
  return Children.toArray(node).some(
    (child) =>
      isValidElement<PartProps>(child) &&
      (child.type === Hint || child.type === FieldError || holdsPart(child.props.children)),
  );
}

/** The children of a node in document order, with Fragments read through and keys that stay unique. */
function flatten(node: ReactNode, prefix: string): ReactNode[] {
  return Children.toArray(node).flatMap((child, index) => {
    if (!isValidElement<PartProps>(child)) return [child];
    const key = `${prefix}${child.key ?? String(index)}`;
    if (child.type === Fragment) return flatten(child.props.children, `${key}/`);
    return [cloneElement(child, { key })];
  });
}

/**
 * Reads a zone of a FormField. Only the Hints of `hint` and the FieldErrors of `error` are parts. A run of plain
 * text becomes one part: a Hint, or a FieldError that always shows, as plain error text did before.
 *
 * @param node - The `hint` or `error` prop.
 * @param zone - Which zone it is.
 * @returns The items, the own ids of the parts and whether a wrapper hides parts.
 */
export function readZone(node: ReactNode, zone: FieldZone): ZoneParts {
  const items: ReactNode[] = [];
  const ownIds: (string | undefined)[] = [];
  let text: (string | number)[] = [];
  let hasWrapper = false;
  const endText = (): void => {
    if (text.length === 0) return;
    const key = `text-${String(items.length)}`;
    const props = zone === 'hint' ? { key } : { key, force: true };
    items.push(createElement(partOf(zone) as typeof Hint, props, text.join('')));
    ownIds.push(undefined);
    text = [];
  };
  for (const child of flatten(node, '')) {
    if (isText(child)) {
      text.push(child);
      continue;
    }
    endText();
    items.push(child);
    if (!isValidElement<PartProps>(child)) continue;
    if (child.type === partOf(zone)) ownIds.push(child.props.id === '' ? undefined : child.props.id);
    else if (holdsPart(child.props.children)) hasWrapper = true;
  }
  endText();
  return { items, ownIds, hasWrapper };
}

/**
 * Gives each part of a read zone its id, in document order, unless the author wrote one. Other elements stay as
 * they are. Because the ids come from the props, the first render (also on the server) already has them.
 *
 * @param parts - The zone from `readZone`.
 * @param zone - Which zone it is.
 * @param ids - The id of each part, from `formFieldIds`.
 * @returns The zone with the ids set.
 */
export function withPartIds(parts: ZoneParts, zone: FieldZone, ids: readonly string[] | undefined): ReactNode {
  let next = 0;
  return parts.items.map((item) => {
    if (!isValidElement<PartProps>(item) || item.type !== partOf(zone)) return item;
    const id = ids?.[next++];
    return item.props.id === undefined || item.props.id === '' ? cloneElement<PartProps>(item, { id }) : item;
  });
}
