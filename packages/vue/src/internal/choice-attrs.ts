import { mergeProps } from 'vue';
import { omit, pick } from './record';

/**
 * The attributes of the root of a choice control: the theme, the machine's facts, and the author's `class`,
 * `style` and (on a Radio, which has no `hidden` prop) `hidden`. Every other author attribute belongs to the input.
 *
 * @param attrs - The author's fallthrough attributes.
 * @param theme - The theme attributes of the root part.
 * @param root - The machine's root props; its block class is left to the template.
 * @returns The attributes to bind on the root.
 */
export function choiceRootAttrs(attrs: object, theme: object, root: object): Record<string, unknown> {
  return { ...theme, ...omit(root, 'class'), ...pick(attrs, 'class', 'style', 'hidden') };
}

/** What differs between the inputs of the choice controls. */
export interface ChoiceInputParts {
  /** The theme attributes of the input part. */
  readonly theme: object;
  /** The attributes of the declared props, see `declaredInputAttrs`. */
  readonly declared: object;
  /** The machine's input props; they replace the same attribute of the author. */
  readonly machine: { readonly class: string };
  /** Attributes an author may not set on the input. `role` is always cleared first; the Switch machine's `role: 'switch'` comes after it and wins. */
  readonly reserved?: readonly string[] | undefined;
  /** The input's own `ref` and handlers; they run after the author's listeners. */
  readonly own: Record<string, unknown>;
}

/**
 * The props of the input vnode of a choice control: the author's attributes and listeners under the declared
 * props, the reserved keys cleared, the machine's props, and the control's own `ref` and handlers.
 *
 * @param attrs - The author's fallthrough attributes.
 * @param parts - The pieces that differ per control.
 * @returns The props for `h('input', ...)`.
 */
export function choiceInputProps(attrs: object, parts: ChoiceInputParts): Record<string, unknown> {
  const reserved = Object.fromEntries(['role', ...(parts.reserved ?? [])].map((name) => [name, undefined]));
  return mergeProps(
    omit(attrs, 'class', 'style', 'hidden'),
    { ...parts.theme, ...parts.declared, ...reserved, ...omit(parts.machine, 'class') },
    { class: parts.machine.class, ...parts.own },
  );
}
