import React, { useMemo } from 'react';

/**
 * A tuple of length = slotNames.length + 1,
 * where the last item is always ReactNode[] (the “rest”).
 */
type SlotChildrenResult<T extends readonly any[]> = [...{ [K in keyof T]: React.ReactNode }, React.ReactNode[]];

/**
 * A custom hook that splits a React children tree into N named “slots” (by
 * matching each child’s `type.displayName`) plus a final “rest” array of all
 * unmatched children.
 *
 * It returns a tuple of length = `slotNames.length + 1`. Each of the first N
 * items is the combined ReactNode(s) for that slot, in the same order they
 * appeared in the children. The last item is an array of all remaining children.
 *
 * @typeParam T
 *   A readonly tuple of slot displayName strings.
 *
 * @param children
 *   The full React.ReactNode children tree to partition.
 * @param slotNames
 *   A list of component displayName strings to extract, in order.
 *   E.g. `['MyComponent.Header', 'MyComponent.Footer']`.
 *
 * @returns
 *   A tuple `[slot1, slot2, …, rest]` where:
 *     - `slot1` corresponds to the children of the component whose
 *       `displayName === slotNames[0]`
 *     - `slot2` corresponds to the children of the component whose
 *       `displayName === slotNames[1]`
 *     - …
 *     - `rest` is an array of all other children not matched by any slotName.
 *
 * @example
 * // Single-slot usage: returns [headerNodes, restNodes]
 * function MyComponent({ children }: { children: React.ReactNode }) {
 *   const [header, rest] = useSlotChildren(children, 'MyComponent.Header')
 *   return (
 *     <div>
 *       <div className="header">{header}</div>
 *       <div className="body">{rest}</div>
 *     </div>
 *   )
 * }
 *
 * MyComponent.Header = ({ children }: { children: React.ReactNode }) => <>{children}</>
 * MyComponent.Header.displayName = 'MyComponent.Header'
 *
 * @example
 * // Multi-slot usage: returns [hdr, ftr, rest]
 * const [hdr, ftr, rest] = useSlotChildren(
 *   children,
 *   'MyComponent.Header',
 *   'MyComponent.Footer'
 * )
 *
 * @warning
 * - The hook relies on each slot component setting a unique `displayName`.
 * - The returned slots are re-computed whenever `children` or any
 *   `slotNames` change (shallow string compare).
 * - Pushing large numbers of children through this hook can impact render
 *   performance—use sparingly for layout slots, not deep content parsing.
 */
export function useSlotChildren<const T extends readonly string[]>(
  children: React.ReactNode,
  ...slotNames: T
): SlotChildrenResult<T>;

export function useSlotChildren<const T extends readonly string[]>(
  children: React.ReactNode,
  ...slotNames: T
): (React.ReactNode | React.ReactNode[])[] {
  return useMemo(() => {
    const slots: React.ReactNode[] = new Array(slotNames.length).fill(null);
    const rest: React.ReactNode[] = [];

    React.Children.forEach(children, (child) => {
      if (!React.isValidElement(child) || typeof child.type === 'string') {
        rest.push(child);
      } else {
        const name = (child.type as any).displayName;
        const idx = slotNames.indexOf(name);
        if (idx >= 0) {
          slots[idx] = child;
        } else {
          rest.push(child);
        }
      }
    });

    return [...slots, rest];
  }, [children, ...slotNames]);
}
