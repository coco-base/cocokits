import type { ComponentPropsWithRef, HTMLAttributes, ReactElement, ReactNode, RefCallback } from 'react';
import type { SelectOpenReason, SelectValueReason } from '@cocokits/machines/select';
import type { Direction } from '@cocokits/shared';
import type { CancelableChangeDetails } from '../internal/cancelable-change-details';

export type { CancelableChangeDetails, SelectOpenReason, SelectValueReason };

/**
 * What `onValueChange` receives besides the value: an object with the `reason` (`'user'` or `'form-reset'`), the `event` behind the change, and `cancel()` to refuse the change.
 */
export type SelectChangeDetails = CancelableChangeDetails<SelectValueReason>;

/**
 * What `onOpenChange` receives besides the open state: an object with the `reason`, the `event` and `cancel()` to refuse the change. A close with the reason `'blur'` cannot be refused.
 */
export type SelectOpenChangeDetails = CancelableChangeDetails<SelectOpenReason>;

/**
 * The value of a Select. A single Select holds a `T`, or `null` for nothing. A Select with `multiple` holds a list of `T`.
 *
 * `M` is the type of the `multiple` prop.
 */
export type SelectValueOf<T = string, M extends boolean = false> = M extends true ? readonly T[] : T | null;

/**
 * One entry of the `items` prop: a value, the label that the trigger shows for it, and whether it is disabled.
 */
export interface SelectItemData<T = string> {
  /**
   * The value of the item.
   */
  readonly value: T;
  /**
   * The text that the trigger shows while the value is selected.
   */
  readonly label: string;
  /**
   * Whether a closed Select refuses a browser autofill to this item. When not set, the item takes part in autofill.
   * @defaultValue false
   */
  readonly disabled?: boolean | undefined;
}

/**
 * The `items` of a Select: a list of entries, or, for text values, an object from value to label.
 */
export type SelectItems<T = string> = readonly SelectItemData<T>[] | Readonly<Record<string, string>>;

/**
 * The props that the function form of `render` receives: the native props merged with the props of the part. Pass all of them, `ref` included, to one element.
 */
export interface SelectRenderProps extends Omit<HTMLAttributes<HTMLElement>, 'color'> {
  /** Any `data-*` attribute, such as `data-state` and the theme options. */
  readonly [attribute: `data-${string}`]: string | undefined;
  /**
   * The merged ref: the `ref` of the part, the `ref` of the rendered element and the `ref` of the part itself.
   */
  readonly ref: RefCallback<HTMLElement>;
}

/** The `render` prop of a Select part: an element, or a function of the merged props. */
export type SelectRender = ReactElement | ((props: SelectRenderProps) => ReactElement);

/**
 * Props of the {@link SelectRoot}. Native `div` props pass through to the root element.
 *
 * @typeParam T - The type of an item's value. Defaults to `string`.
 * @typeParam M - The type of `multiple`: `true` makes the value a list. Defaults to `false`.
 */
export interface SelectRootProps<T = string, M extends boolean = false> extends Omit<
  ComponentPropsWithRef<'div'>,
  'color' | 'defaultValue' | 'onChange' | 'dir'
> {
  /**
   * The trigger and the list: a `Select.Trigger` and a `Select.Content`.
   * @cckSemantic select.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * The selected value. A single Select holds one value, or `null` for nothing. A Select with `multiple` holds a list of values.
   *
   * Setting it makes the Select controlled. If you do not update it after `onValueChange`, the old value stays. When not set, the Select keeps its own value, which starts as `defaultValue`. `''` and an empty list also mean nothing is selected.
   *
   * @example
   * const [dish, setDish] = useState<string | null>('Pizza');
   * <Select.Root value={dish} onValueChange={setDish}>
   *   ...
   * </Select.Root>
   * @cckTask Read and set the value
   * @cckSemantic select.value
   */
  readonly value?: SelectValueOf<T, M> | undefined;
  /**
   * The start value of a Select that you do not control with `value`.
   * @cckSemantic none
   * @cckParity The uncontrolled start value.
   * @defaultValue null (an empty list with `multiple`)
   */
  readonly defaultValue?: SelectValueOf<T, M> | undefined;
  /**
   * Called after the user changes the value, and after a form reset. It receives the new value and a details object.
   *
   * The details hold the `reason` (`'user'` or `'form-reset'`), the `event` behind the change, and `cancel()`. Call `details.cancel()` to refuse the change: the value stays, and a choice made in the list keeps the list open. It is never called when you change `value` yourself. With `multiple`, the new value is a list. It is `null` when the user chose a clearing item.
   *
   * @example
   * <Select.Root onValueChange={(value, details) => console.log(value, details.reason)}>
   *   ...
   * </Select.Root>
   * @cckTask Respond to a choice
   * @cckSemantic select.valueChange
   * @cckParity The change callback of this component.
   */
  readonly onValueChange?: ((value: SelectValueOf<T, M>, details: SelectChangeDetails) => void) | undefined;
  /**
   * Whether the list is open. Setting it makes the open state controlled. A disabled or read-only Select never opens.
   *
   * When not set, the Select keeps its own open state, which starts as `defaultOpen`.
   *
   * @cckSemantic select.open
   * @defaultValue false
   */
  readonly open?: boolean | undefined;
  /**
   * The start open state of a Select that you do not control with `open`. The list mounts after hydration, so a Select that starts open is closed on the server.
   * @cckSemantic none
   * @cckParity The uncontrolled start value.
   * @defaultValue false
   */
  readonly defaultOpen?: boolean | undefined;
  /**
   * Called after the user opens or closes the list. It receives the new open state and a details object. The user can do this with the trigger, with Escape, with a press outside, by choosing an item, or by moving the focus away.
   *
   * The details hold the `reason`, the `event` and `cancel()`. Call `details.cancel()` to keep the list as it is. A close with the reason `'blur'` cannot be refused. It is never called when you change `open` yourself.
   *
   * @example
   * <Select.Root
   *   onOpenChange={(open, details) => {
   *     if (!open && details.reason === 'escape') details.cancel();
   *   }}
   * >
   *   ...
   * </Select.Root>
   * @cckTask Keep the list open
   * @cckSemantic select.openChange
   * @cckParity The change callback of this component.
   */
  readonly onOpenChange?: ((open: boolean, details: SelectOpenChangeDetails) => void) | undefined;
  /**
   * Whether the user can choose more than one item. The value is then a list, in the order of the choices. Choosing an item adds it or removes it, and the list stays open.
   *
   * @example
   * const [dishes, setDishes] = useState<string[]>(['Cake']);
   * <Select.Root multiple value={dishes} onValueChange={setDishes}>
   *   ...
   * </Select.Root>
   * @cckTask Choose several options
   * @defaultValue false
   */
  readonly multiple?: M | undefined;
  /**
   * The labels that the trigger shows, as data. Pass a list of `{ value, label }` entries, or, for text values, an object from value to label. When not set, the trigger shows the text from `itemToStringLabel`, or the value as text.
   *
   * The trigger shows the label of each selected value, joined with a comma. The labels are in the server render, because no part reports its text to the Select. The text of an item should be equal to its label. A closed Select also uses these entries to match a browser autofill.
   *
   * @cckSemantic select.items
   * @cckParity Not available in every framework.
   */
  readonly items?: SelectItems<T> | undefined;
  /**
   * A function that turns a value into the text that the trigger shows when `items` has no label for it. It also gives the type-to-search text of an item that has no text. When not set, the value is turned into text with `String`.
   * @cckSemantic select.itemToStringLabel
   * @cckParity Not available in every framework.
   * @defaultValue String
   */
  readonly itemToStringLabel?: ((value: T) => string) | undefined;
  /**
   * A function that turns a value into the text that the hidden form input sends. The browser autofill uses it to find the item. When not set, the value is turned into text with `String`.
   * @cckSemantic select.itemToStringValue
   * @cckParity A function of the item value that returns a string.
   * @defaultValue String
   */
  readonly itemToStringValue?: ((value: T) => string) | undefined;
  /**
   * A function that tells whether the value of an item is the selected value. Use it when the values are objects. When not set, the values are compared with `Object.is`.
   *
   * It must give the same answer when its two arguments swap places, because the order is not fixed.
   *
   * @example
   * <Select.Root
   *   value={dish}
   *   onValueChange={setDish}
   *   isItemEqualToValue={(a, b) => a.id === b.id}
   *   itemToStringLabel={(item) => item.name}
   *   itemToStringValue={(item) => String(item.id)}
   * >
   *   ...
   * </Select.Root>
   * @cckTask Use objects as values
   * @cckSemantic select.isItemEqual
   * @cckParity A function of the item value and the selected value.
   * @defaultValue Object.is
   */
  readonly isItemEqualToValue?: ((itemValue: T, value: T) => boolean) | undefined;
  /**
   * The native `autocomplete` value of the hidden form inputs. A browser autofill that writes to them chooses the matching item of a single Select. When not set, the value is `'off'`.
   * @cckSemantic select.autocomplete
   * @cckParity Spelled `autoComplete`.
   * @defaultValue 'off'
   */
  readonly autoComplete?: string | undefined;
  /**
   * Whether the Select is disabled. A disabling `fieldset` or a disabled `FormField` also disables it.
   * @defaultValue false
   */
  readonly disabled?: boolean | undefined;
  /**
   * Whether the Select is read-only. The user can focus it but it never opens.
   * @defaultValue false
   */
  readonly readOnly?: boolean | undefined;
  /**
   * Whether the Select needs a value before the form can submit. It turns on the native `required` check on the hidden input, and `aria-required` on the trigger.
   * @defaultValue false
   */
  readonly required?: boolean | undefined;
  /**
   * Whether the value is not valid. The trigger gets `aria-invalid` only after the user has left it or has tried to submit the form.
   * @defaultValue false
   */
  readonly invalid?: boolean | undefined;
  /**
   * The `name` that `FormData` sends. Without a name and without `required`, no hidden input is made. When not set, the Select has no name.
   *
   * @example
   * <form>
   *   <Select.Root name="dish" required>
   *     ...
   *   </Select.Root>
   *   <button type="submit">Send</button>
   * </form>
   * @cckTask Send the value with a form
   * @cckSemantic select.name
   * @defaultValue ''
   */
  readonly name?: string | undefined;
  /**
   * The `id` of the form that the hidden inputs belong to. Use it when the Select is outside its form. When not set, the form around the Select owns the inputs.
   */
  readonly form?: string | undefined;
  /**
   * The text direction of the Select and its list. The `start` and `end` placement follows it. When not set, the nearest direction provider applies, and then `'ltr'`.
   *
   * Only a `dir` you pass is written on the root element.
   *
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly dir?: Direction | undefined;
  /**
   * Replaces the element that the part renders. Pass an element, or a function of the merged props that returns an element. The function must pass all props on, `ref` included, to one element.
   *
   * When not set, the part renders its own element.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   */
  readonly render?: SelectRender | undefined;
}

/** Props of the {@link SelectTrigger}. Native button props pass through, `aria-*` included. */
export interface SelectTriggerProps extends Omit<ComponentPropsWithRef<'button'>, 'color'> {
  /**
   * The content of the trigger: a `Select.Value` and a `Select.Icon`.
   * @cckSemantic select.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * The accessible name of the Select. The list gets the same name. When not set, name the Select with `aria-labelledby` or with the label of a `FormField`.
   * @cckSemantic select.trigger.aria-label
   */
  readonly 'aria-label'?: string | undefined;
  /**
   * The id of the element that names the Select. The list gets the same name. When not set, no element names the Select through this prop.
   * @cckSemantic select.trigger.aria-labelledby
   */
  readonly 'aria-labelledby'?: string | undefined;
  /**
   * The ids of the elements that describe the Select. A `FormField` adds its own ids to them. When not set, the Select has no description of its own.
   * @cckSemantic select.trigger.aria-describedby
   */
  readonly 'aria-describedby'?: string | undefined;
  /**
   * Whether the rendered element is a native `<button>`. Set it to `false` when `render` gives another element. That element then gets `tabindex="0"` and no `type`.
   *
   * In development, a tag that does not match logs an error.
   *
   * @cckSemantic none
   * @cckParity Tells the part what element `render` produces.
   * @defaultValue true
   */
  readonly nativeButton?: boolean | undefined;
  /**
   * Replaces the `<button>` of the trigger. Pass an element, or a function of the merged props that returns an element. The function must pass all props on, `ref` included, to one element.
   *
   * An element that is not a `<button>` also needs `nativeButton={false}`. When not set, the trigger renders a `<button>`.
   *
   * @example
   * <Select.Trigger aria-label="Dish" nativeButton={false} render={(props) => <div {...props} />}>
   *   <Select.Value placeholder="Choose a dish" />
   * </Select.Trigger>
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   */
  readonly render?: SelectRender | undefined;
}

/**
 * Props of the {@link SelectValue}. Native `span` props pass through.
 *
 * @typeParam V - The type of the value the children function receives: `T | null`, or `readonly T[]` with `multiple`.
 */
export interface SelectValueProps<V = unknown> extends Omit<ComponentPropsWithRef<'span'>, 'color' | 'children'> {
  /**
   * The text that shows while nothing is selected. When not set, the trigger shows no text then.
   * @cckSemantic select.value.placeholder
   * @defaultValue ''
   */
  readonly placeholder?: string | undefined;
  /**
   * Your own content for the trigger, in place of the labels of the selected items. Pass a node, or a function that receives the selected value and returns a node.
   *
   * The function is called only while something is selected. While nothing is selected, the placeholder shows.
   *
   * @param value - The selected value. A single Select gives one value. A Select with `multiple` gives the list of values.
   * @defaultValue The trigger shows the labels of the selected items, joined with a comma.
   * @example
   * <Select.Value placeholder="Choose a dish">{(value) => `Dish: ${value}`}</Select.Value>
   * @cckSemantic select.default
   * @cckParity A node or a function of the selected value.
   */
  readonly children?: ReactNode | ((value: V) => ReactNode) | undefined;
  /**
   * Replaces the element that the part renders. Pass an element, or a function of the merged props that returns an element. The function must pass all props on, `ref` included, to one element.
   *
   * When not set, the part renders its own element.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   */
  readonly render?: SelectRender | undefined;
}

/** A Select part: a function component with its `displayName`. */
export interface SelectPart<P> {
  (props: P): ReactElement;
  displayName: string;
}

/** The {@link SelectRoot}: a generic function component, `Select.Root<T, M>`, with its `displayName`. */
export interface SelectRootComponent {
  <T = string, M extends boolean = false>(props: SelectRootProps<T, M>): ReactElement;
  displayName: string;
}

/** The {@link SelectValue}: a generic function component, `Select.Value<V>`, with its `displayName`. */
export interface SelectValueComponent {
  <V = unknown>(props: SelectValueProps<V>): ReactElement;
  displayName: string;
}
