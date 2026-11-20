import {
  computed,
  mergeProps,
  nextTick,
  onBeforeUnmount,
  onMounted,
  provide,
  shallowRef,
  useAttrs,
  useId,
  useTemplateRef,
  watch,
  type ComponentPublicInstance,
  type ComputedRef,
} from 'vue';
import { deepActiveElement } from '@cocokits/cdk/focus';
import { getMenuProps, menuAnatomy, type MenuItemChange, type MenuItemKind } from '@cocokits/machines/menu';
import { useThemeAttrs } from '@cocokits/vue-core';
import { omit } from '../internal/record';
import { rootElementOf } from '../internal/root-element';
import { vueProps } from './menu-props';
import { MENU_ITEM_KEY, useMenuContext } from './menu.context';

/** What a kind of item gives {@link useMenuItem}. Each fact is read when used, so a prop that changes is seen. */
export interface MenuItemOptions {
  /** The name of the part, for the error outside a menu. */
  readonly part: string;
  /** What the item is. */
  readonly kind: MenuItemKind;
  /** The anatomy part whose theme attributes the item takes. */
  readonly themePart: 'item' | 'checkboxItem' | 'radioItem';
  /** Whether the item is disabled. */
  readonly disabled: () => boolean;
  /** Whether a checkbox or radio item is checked. */
  readonly checked?: (() => boolean) | undefined;
  /** The value a radio item sets in its group. */
  readonly value?: (() => string | undefined) | undefined;
  /** Applies the change of a press on a checkbox or radio item. */
  readonly change?: ((change: MenuItemChange) => void) | undefined;
  /** Runs the `select` listeners with a cancelable event; returns whether one of them prevented it. */
  readonly select: () => boolean;
}

/** What {@link useMenuItem} returns for the template. */
export interface MenuItemSetup {
  /** The attributes to bind on the item element. */
  readonly bound: ComputedRef<Record<string, unknown>>;
  /** The attributes the machine owns: they win over the child of `asChild`. */
  readonly priorityAttrs: ComputedRef<string[]>;
}

/**
 * The behaviour every item shares: the registration with the menu, the machine's props for its kind, the press
 * (`select` first, then the machine) and the context its parts read. Call it in `setup` of a part with a
 * template ref named `root` on the element, and bind the result on it.
 *
 * @internal
 * @param options - What differs between the kinds.
 * @returns The attributes to bind.
 */
export function useMenuItem(options: MenuItemOptions): MenuItemSetup {
  const ctx = useMenuContext(options.part);
  const themeAttrs = useThemeAttrs(menuAnatomy);
  const attrs = useAttrs();
  const key = useId();
  const root = useTemplateRef<ComponentPublicInstance>('root');
  const element = computed(() => rootElementOf(root.value) as HTMLElement | null);
  const descriptions = shallowRef(0);
  const checked = computed(() => options.checked?.() === true);

  provide(MENU_ITEM_KEY, {
    key,
    checked,
    describe: () => {
      descriptions.value += 1;
      return () => {
        descriptions.value -= 1;
      };
    },
  });

  const machine = computed(() =>
    getMenuProps(ctx.state.value, ctx.send).item({
      key,
      text: '',
      disabled: options.disabled(),
      kind: options.kind,
      checked: options.checked ? checked.value : undefined,
      value: options.value?.(),
      hasDescription: descriptions.value > 0,
    }),
  );

  // A click runs the item: the `select` listeners first, and one that prevents the event keeps the menu open. A
  // consumer click listener runs before this one (`mergeProps` chains it first) and can veto the click.
  function onClick(event: Event): void {
    if (event.defaultPrevented) return;
    const prevented = options.disabled() ? false : options.select();
    ctx.send({ type: 'ITEM.RUN', key, disabled: options.disabled(), prevented, event });
  }

  // The machine's attributes are reserved: they replace the same attribute of the author.
  const bound = computed(() =>
    mergeProps(
      themeAttrs.value[options.themePart],
      omit(attrs, 'role', 'aria-checked', 'aria-disabled', 'data-disabled', 'data-state'),
      { ...vueProps(machine.value), onClick },
    ),
  );
  // The machine's attributes win over an `asChild` child's own props.
  const priorityAttrs = computed(() => Object.keys(vueProps(machine.value)).filter((name) => name !== 'class'));

  // Registers once per key (again when the element or the disabled fact changes); the other facts are read live.
  let unregister: (() => void) | undefined;
  function register(): void {
    const node = element.value;
    if (!node) return;
    unregister = ctx.registerItem({
      key,
      element: node,
      disabled: options.disabled(),
      kind: options.kind,
      get checked() {
        return options.checked ? checked.value : undefined;
      },
      get value() {
        return options.value?.();
      },
      get hasDescription() {
        return descriptions.value > 0;
      },
      change: (change) => {
        options.change?.(change);
      },
    });
  }
  onMounted(register);
  watch([options.disabled, element], register, { flush: 'post' });
  onBeforeUnmount(() => {
    const node = element.value;
    // An item that goes away with focus on it sends focus to the content, while the menu stays open.
    const hadFocus = node !== null && deepActiveElement(node.ownerDocument) === node;
    unregister?.();
    if (!hadFocus) return;
    void nextTick(() => {
      if (ctx.open.value) ctx.contentElement.value?.focus();
    });
  });

  return { bound, priorityAttrs };
}
