/**
 * Renames the listeners of a machine to the names Vue binds. The machine names a listener after the event
 * (`onKeyDown`); `h()` and `v-bind` turn that into the event `key-down`, which never fires. A
 * template writes `@keydown`, which is `onKeydown`, so every name after `on` is lowercase. A one-word
 * listener (`onClick`) is unchanged.
 *
 * @param props - The props of a machine part.
 * @returns A new record with the listener names lowercased after `on`.
 */
export function toVueListeners(props: object): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(props).map(([name, value]) => [
      /^on[A-Z]/.test(name) ? `on${name.charAt(2)}${name.slice(3).toLowerCase()}` : name,
      value,
    ]),
  );
}
