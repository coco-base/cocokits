import { h, type VNode } from 'vue';

/** The parts of a machine result that the box tree renders: the Checkbox and the Radio share them. */
export interface BoxParts {
  readonly wrapper: { readonly class: string };
  readonly inputWrapper: { readonly class: string };
  readonly backdrop: { readonly class: string; readonly 'aria-hidden': 'true' };
  readonly background: { readonly class: string; readonly 'aria-hidden': 'true' };
  readonly label: { readonly class: string; readonly for?: string | undefined };
}

/** The theme attributes of the parts of the box tree. */
export type BoxTheme = Readonly<
  Record<'wrapper' | 'inputWrapper' | 'backdrop' | 'background' | 'label', object | undefined>
>;

/**
 * The tree below the root of a Checkbox or a Radio: the wrapper with the box (the input, the halo and the
 * background) and the label that holds the author's content.
 *
 * @param parts - The machine props of the parts.
 * @param theme - The theme attributes of the parts.
 * @param input - The input vnode.
 * @param content - The author's label content.
 * @returns The wrapper vnode.
 */
export function boxTree(parts: BoxParts, theme: BoxTheme, input: VNode, content: VNode[]): VNode {
  return h('span', { ...theme.wrapper, class: parts.wrapper.class }, [
    h('span', { ...theme.inputWrapper, class: parts.inputWrapper.class }, [
      input,
      h('span', { ...theme.backdrop, ...parts.backdrop }),
      h('span', { ...theme.background, ...parts.background }),
    ]),
    h('label', { ...theme.label, ...parts.label }, content),
  ]);
}
