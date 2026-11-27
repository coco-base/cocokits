/** A group-child option and the components it may inherit from, nearest first. */
export type OptionParents = Readonly<Record<string, Readonly<Record<string, readonly string[]>>>>;

/**
 * The group inheritance of the cocokits theme: per child component and option, the parent components, nearest
 * first. A child's own value wins, then the nearest parent that sets one, then the `ThemeProvider` override, then
 * the default. Every parent has an option of the same name whose values are all values of the child's.
 */
export const optionParents: OptionParents = {
  select: { size: ['form-field'] },
  input: { size: ['form-field'] },
  textarea: { size: ['form-field'] },
  'chip-list': { size: ['form-field'] },
  avatar: { size: ['avatar-label', 'avatar-group'] },
  radio: { size: ['radio-group'], color: ['radio-group'], labelPosition: ['radio-group'] },
};

/**
 * The first value that is not `undefined`: the own value, then the value of the nearest parent that sets one. `null` is a value
 * (it removes the option), so it stops the search. The framework layers use it to resolve the group inheritance. @internal
 */
export function resolveInheritedValue<T>(ownValue: T | undefined, ...parentValues: (T | undefined)[]): T | undefined {
  return [ownValue, ...parentValues].find((value) => value !== undefined);
}
