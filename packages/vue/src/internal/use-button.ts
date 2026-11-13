import { computed, onMounted, useAttrs, watch, type ComputedRef, type Ref, type ComponentPublicInstance } from 'vue';
import type { ButtonProps as MachineButtonProps, ButtonRootProps } from '@cocokits/machines/button';
import { buttonAnatomy } from '@cocokits/machines/button';
import type { iconButtonAnatomy } from '@cocokits/machines/icon-button';
import { isDevelopment, useThemeAttrs } from '@cocokits/vue-core';
import type { ButtonProps } from '../button/button.types';
import { rootElementOf } from './root-element';

/** What the Button and the IconButton share: they render the same element with their own class and anatomy. */
export interface UseButtonOptions {
  /** The component name, for the development messages. */
  readonly name: string;
  /** The anatomy of the component. */
  readonly anatomy: typeof buttonAnatomy | typeof iconButtonAnatomy;
  /** The machine function of the component. */
  readonly getProps: (props: MachineButtonProps) => ButtonRootProps;
  /** The props of the component. */
  readonly props: Readonly<Pick<ButtonProps, 'as' | 'asChild' | 'disabled'>>;
  /** The template ref of the `Primitive` that renders the element. */
  readonly root: Readonly<Ref<ComponentPublicInstance | null>>;
}

/** What the template of a Button-like component binds. */
export interface UseButton {
  /** The class of the machine. */
  readonly className: ComputedRef<string>;
  /** The native `type`: the consumer's, else `button` on a native button, none on a link. */
  readonly type: ComputedRef<unknown>;
  /** The names of the attrs that win over an `asChild` child's own props. */
  readonly priorityAttrs: ComputedRef<string[]>;
  /** The attrs to bind to the `Primitive`: the consumer's, the reserved markers and the machine's. */
  readonly boundAttrs: () => Record<string, unknown>;
  /** The click listener of the disabled-link guard; bind it with `@click.capture`. */
  readonly guard: (event: MouseEvent) => void;
  /** The DOM element that was rendered, or `null` before mount. */
  readonly element: () => Element | null;
}

/**
 * The shared implementation of the Button and the IconButton. Only the native `button` is a button; any other tag
 * or component, and `asChild`, is a link. The machine's state markers win over an `asChild` child's own props and
 * over the consumer's attrs. In development, it logs a `CocoKits:` error when the rendered tag does not match.
 * Call it in `setup` with `inheritAttrs: false`.
 *
 * @internal
 * @param options - The component name, anatomy, machine function, props and root ref.
 * @returns The values the template binds.
 */
export function useButton({ name, anatomy, getProps, props, root }: UseButtonOptions): UseButton {
  const themeAttrs = useThemeAttrs(anatomy);
  const isLink = computed(() => !!props.asChild || (props.as ?? 'button') !== 'button');
  const machine = computed(() => {
    const {
      class: className,
      onClick,
      ...markers
    } = getProps({ element: isLink.value ? 'a' : 'button', disabled: !!props.disabled });
    return { className, onClick, state: markers, markers: { ...themeAttrs.value.root, ...markers } };
  });

  // The data attrs the machine sets on a disabled button or link are reserved: only the machine sets them, so
  // neither a consumer attr nor a child can.
  const reserved = [
    ...new Set(
      (['a', 'button'] as const).flatMap((element) =>
        Object.keys(getProps({ element, disabled: true })).filter((key) => key.startsWith('data-')),
      ),
    ),
  ];
  const attrs = useAttrs();
  const type = computed(() => (attrs as { type?: unknown }).type ?? (isLink.value ? undefined : 'button'));
  const priorityAttrs = computed(() => [...Object.keys(machine.value.state), ...reserved]);

  const element = (): Element | null => rootElementOf(root.value);

  function checkElementKind(): void {
    const rendered = element();
    if (!isDevelopment() || !rendered) return;
    const tag = rendered.tagName.toLowerCase();
    if (!isLink.value && tag !== 'button') {
      console.error(`CocoKits: <${name}> renders a native <button>, but its element is <${tag}>.`);
    } else if (isLink.value && tag === 'button') {
      console.error(
        `CocoKits: <${name}> renders a link (as is not "button", or asChild is set), but its element is a <button>. Use as="button", or render an <a>.`,
      );
    } else if (isLink.value && tag !== 'a') {
      console.error(
        `CocoKits: <${name}> renders a link, which must be an <a> (or a component that renders one), but its element is <${tag}>.`,
      );
    }
  }
  onMounted(checkElementKind);
  watch(isLink, checkElementKind, { flush: 'post' });

  return {
    className: computed(() => machine.value.className),
    type,
    priorityAttrs,
    boundAttrs: () => ({
      ...attrs,
      ...Object.fromEntries(reserved.map((key) => [key, undefined])),
      ...machine.value.markers,
    }),
    // Bound with `@click.capture` after the attrs, so a consumer `@click.capture` runs first and may veto.
    guard: (event) => {
      machine.value.onClick?.(event);
    },
    element,
  };
}
