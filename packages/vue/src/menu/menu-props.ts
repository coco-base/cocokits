import { toVueListeners } from '../internal/listeners';

/**
 * The props of a machine part as Vue binds them: listeners named for Vue, `tabIndex` as the attribute, and no key
 * that is `undefined` (it would replace the author's attribute of the same name when merged).
 *
 * @internal
 * @param props - The props of a machine part.
 * @returns A new record.
 */
export function vueProps(props: object): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(toVueListeners(props))
      .filter(([, value]) => value !== undefined)
      .map(([name, value]) => [name === 'tabIndex' ? 'tabindex' : name, value]),
  );
}
