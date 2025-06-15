import { useEffect, useRef, useState } from 'react';

import { Selection, SelectionOptions } from '@cocokits/common-utils';

/**
 * A custom hook that manages selection state for items of type `T` and exposes
 * utility methods to manipulate the selection.
 *
 * Internally it creates a `Selection<T>` instance from `@cocokits/common-utils`
 * and sets up listeners to update React state whenever the selection changes.
 *
 * @param options
 *   Partial {@link SelectionOptions<T>} to configure behavior such as
 *   multi-select, comparison function, and initial selection.
 *
 * @returns
 *   An object containing:
 *   - `selected`: the current array of selected items, or `undefined` before initialization.
 *   - `selection`: the underlying `Selection<T>` instance with methods to manipulate selection.
 *
 * @example
 * function UserList() {
 *   const { selected, selection } = useSelection<User>({multiple: true});
 *
 *   return (
 *     <div>
 *       <button onClick={selection.clear}>Clear Selection</button>
 *       {users.map(user => (
 *         <div key={user.id}>
 *           <input
 *             type="checkbox"
 *             checked={selected.some(u => u.id === user.id)}
 *             onChange={() => selection.toggle(user)}
 *           />
 *           {user.name}
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 *
 * @see {@link Selection} for more details on the underlying selection API.
 * @see {@link SelectionOptions} for all available configuration options.
 */
export function useSelection<T>(options: Partial<SelectionOptions<T>>) {
  const [selected, setSelected] = useState<T[]>();
  const selectionRef = useRef(new Selection<T>([], options));
  const selection = selectionRef.current;

  useEffect(() => {
    const callback = () => setSelected(selection.selected);
    selection.addChangeEventListener(() => {
      callback();
    });

    return () => {
      selection.removeChangeEventListener(callback);
    };
  }, []);

  useEffect(() => {
    selection.updateOptions(options);
  }, [options]);

  return { selected, selection };
}
