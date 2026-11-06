import type { Component } from 'vue';
import type { AsTag, Direction } from '@cocokits/vue-core';
import type { SelectOpenReason, SelectValueReason } from '@cocokits/machines/select';

export type { SelectOpenReason, SelectValueReason };

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
  /** The value of the item. */
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
 * Holds the value and the open state of a custom listbox. It renders a `<div>` that contains the parts, the hidden form inputs and the message of a blocked submit. It is not a native `<select>`.
 *
 * Write the parts inside it: a `SelectTrigger` with a `SelectValue` and a `SelectIcon`, and a `SelectContent` with `SelectItem` elements. The items mount with the list, so the list renders nothing while closed, on the server and in the first client render.
 *
 * Bind the value with `v-model`. It is a `T` or `null`, or a list of `T` with `multiple`. `T` is `string` unless the items carry something else. Then `itemToStringLabel`, `itemToStringValue` and `by` tell the Select how to show, send and compare the values.
 *
 * With `name` or `required`, the Select renders hidden native inputs. Then `FormData`, constraint validation, `form` and a form reset work.
 *
 * Inside a `FormField`, the trigger is the control of the field, and the list lines up with the input of the field.
 *
 * @example
 * <SelectRoot v-model="dish">
 *   <SelectTrigger aria-label="Dish">
 *     <SelectValue placeholder="Choose a dish" />
 *     <SelectIcon />
 *   </SelectTrigger>
 *   <SelectContent>
 *     <SelectGroup>
 *       <SelectLabel>Desserts</SelectLabel>
 *       <SelectItem value="Cake">
 *         <SelectItemIndicator />
 *         <SelectItemText>Cake</SelectItemText>
 *       </SelectItem>
 *     </SelectGroup>
 *     <SelectSeparator />
 *     <SelectItem value="Pizza">
 *       <SelectItemIndicator />
 *       <SelectItemText>Pizza</SelectItemText>
 *     </SelectItem>
 *   </SelectContent>
 * </SelectRoot>
 * @typeParam T - The type of the value of an item. The default is `string`.
 * @typeParam M - The type of `multiple`. `true` makes the value a list. The default is `false`.
 * @cckPart root
 */
export interface SelectRootProps<T = string, M extends boolean = false> {
  /**
   * The selected value, bound with `v-model`. A single Select holds one value, or `null` for nothing. A Select with `multiple` holds a list of values.
   *
   * When not set, the Select keeps its own value, which starts as `defaultValue`.
   *
   * `''` and an empty list also mean nothing is selected. If you listen for changes and do not accept one, the old value stays.
   *
   * @example
   * <SelectRoot v-model="dish">
   *   ...
   * </SelectRoot>
   * <!-- In the script: const dish = ref<string | null>('Pizza'); -->
   * @cckTask Read and set the value
   * @cckSemantic select.value
   * @cckParity Bound with `v-model`.
   */
  readonly modelValue?: SelectValueOf<T, M> | undefined;
  /**
   * The modifiers of `v-model`, as in `v-model.trim`. Vue fills it. The component declares it so the modifiers do not reach the DOM.
   * @internal
   * @cckSemantic none
   * @cckParity Only this framework has this member.
   */
  readonly modelModifiers?: Record<string, true> | undefined;
  /**
   * The start value of a Select whose `v-model` is not bound. It is read once, when the Select is created. A form reset restores it.
   *
   * When not set, a form reset clears the Select.
   *
   * @cckSemantic none
   * @cckParity The value the component starts with.
   */
  readonly defaultValue?: SelectValueOf<T, M> | undefined;
  /**
   * Whether the list is open, bound with `v-model:open`. A disabled or read-only Select never opens. When not set, the Select keeps its own open state, which starts as `defaultOpen`.
   * @cckSemantic select.open
   * @cckParity Bound with `v-model:open`.
   * @defaultValue false
   */
  readonly open?: boolean | undefined;
  /**
   * The modifiers of `v-model:open`. Vue fills it. The component declares it so the modifiers do not reach the DOM.
   * @internal
   * @cckSemantic none
   * @cckParity Only this framework has this member.
   */
  readonly openModifiers?: Record<string, true> | undefined;
  /**
   * The start open state of a Select whose `open` is not bound. It is read once, when the Select is created. A disabled or read-only Select never opens.
   * @cckSemantic none
   * @cckParity The value the component starts with.
   * @defaultValue false
   */
  readonly defaultOpen?: boolean | undefined;
  /**
   * Whether the user can choose more than one item. The value is then a list, in the order of the choices. Choosing an item adds it or removes it, and the list stays open.
   *
   * @example
   * <SelectRoot multiple v-model="dishes">
   *   ...
   * </SelectRoot>
   * <!-- In the script: const dishes = ref<string[]>(['Cake']); -->
   * @cckTask Choose several options
   * @defaultValue false
   */
  readonly multiple?: (M & boolean) | undefined;
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
   * How the value of an item is compared with the selected value. Pass the name of a field to compare, or a function. Use it when the values are objects.
   *
   * When not set, the values are compared with `Object.is`.
   *
   * @example
   * <SelectRoot v-model="dish" by="id">
   *   ...
   * </SelectRoot>
   * @cckTask Use objects as values
   * @cckSemantic select.isItemEqual
   * @cckParity A key name or a compare function.
   * @defaultValue Object.is
   */
  readonly by?: string | ((a: T, b: T) => boolean) | undefined;
  /**
   * The native `autocomplete` value of the hidden form inputs. A browser autofill that writes to them chooses the matching item of a single Select. When not set, the value is `'off'`.
   * @cckSemantic select.autocomplete
   * @cckParity Spelled as the native `autocomplete` attribute.
   * @defaultValue 'off'
   */
  readonly autocomplete?: string | undefined;
  /**
   * The text that the hidden input of a single Select carries while nothing is selected. When not set, the input carries an empty text.
   * @cckSemantic none
   * @cckParity Only this framework has this member.
   * @defaultValue ''
   */
  readonly nullableValue?: string | undefined;
  /**
   * Whether the Select is disabled. A disabling `fieldset` or a disabled `FormField` also disables it.
   * @defaultValue false
   */
  readonly disabled?: boolean | undefined;
  /**
   * Whether the Select is read-only. The user can focus it but it never opens.
   * @cckSemantic select.readOnly
   * @cckParity Spelled as the native `readonly` attribute.
   * @defaultValue false
   */
  readonly readonly?: boolean | undefined;
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
   *   <SelectRoot name="dish" required>
   *     ...
   *   </SelectRoot>
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
   * The text direction of the Select and its list. The keys and the nested parts follow it. When not set, the nearest direction provider applies, and then `'ltr'`.
   *
   * Only a `dir` you pass is written on the root element.
   *
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly dir?: Direction | undefined;
  /**
   * Whether the part merges onto its first child element or component, instead of rendering its own `<div>`. The child keeps its own props and gets the role, the classes and the `data-*` attributes of the part. When not set, the part renders its own element.
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/**
 * The events of the `SelectRoot`.
 */
export interface SelectRootEmits<T = string, M extends boolean = false> {
  /**
   * Emits with the new value after the Select accepts a change. `v-model` listens to it. The value is one value or `null`, or a list with `multiple`.
   *
   * It carries the new value only, and no reason.
   *
   * @example
   * <SelectRoot :model-value="dish" @update:model-value="(value) => console.log(value)">
   *   ...
   * </SelectRoot>
   * @cckTask Respond to a choice
   * @cckSemantic select.valueChange
   * @cckParity The `update:modelValue` event is the only change event; it carries no reason.
   */
  'update:modelValue': [value: SelectValueOf<T, M>];
  /**
   * Emits with the new open state after the Select accepts a change of it. `v-model:open` listens to it.
   *
   * It carries the new state only, and no reason.
   *
   * @cckSemantic select.openChange
   * @cckParity The `update:open` event is the only change event; it carries no reason.
   */
  'update:open': [open: boolean];
}

/**
 * The button that shows the choice and opens the list. It renders a `<button>` with the role `combobox`. It sets `aria-expanded`, `aria-haspopup="listbox"` and, while the list is mounted, `aria-controls`.
 *
 * Name it with the label of a `FormField`, or with `aria-label` or `aria-labelledby`. The list gets the same name. `aria-describedby` joins the ids of the field. Native button attributes and listeners fall through to it.
 *
 * @example
 * <SelectTrigger aria-label="Dish">
 *   <SelectValue placeholder="Choose a dish" />
 *   <SelectIcon />
 * </SelectTrigger>
 * @cckPart trigger
 */
export interface SelectTriggerProps {
  /**
   * The tag or component to render in place of the `<button>`. The part keeps its role, state, ids and handlers. It is ignored with `asChild`.
   *
   * When not set, the part renders a `<button>`.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   * @defaultValue 'button'
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the part merges onto its first child element or component, instead of rendering its own `<button>`. The child keeps its own props and gets the role, the classes and the `data-*` attributes of the part. When not set, the part renders its own element.
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/**
 * The text that the trigger shows. It renders a `<span>` with the placeholder while nothing is selected, and with the selected labels otherwise. Give it the default slot to show something else.
 *
 * @example
 * <SelectValue placeholder="Choose a dish" />
 * @cckPart value
 * @cckPart placeholder
 */
export interface SelectValueProps {
  /**
   * The text that shows while nothing is selected. When not set, the trigger shows no text then.
   * @cckSemantic select.value.placeholder
   * @defaultValue ''
   */
  readonly placeholder?: string | undefined;
  /**
   * The tag or component to render in place of the `<span>`. The part keeps its role, state, ids and handlers. It is ignored with `asChild`.
   *
   * When not set, the part renders a `<span>`.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   * @defaultValue 'span'
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the part merges onto its first child element or component, instead of rendering its own `<span>`. The child keeps its own props and gets the role, the classes and the `data-*` attributes of the part. When not set, the part renders its own element.
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/**
 * The icon that shows the trigger opens a list. It renders a `<span aria-hidden="true">`. Content you give it replaces the icon of the theme.
 *
 * @example
 * <SelectIcon />
 * @cckPart dropdownIcon
 */
export interface SelectIconProps {
  /**
   * The tag or component to render in place of the `<span>`. The part keeps its role, state, ids and handlers. It is ignored with `asChild`.
   *
   * When not set, the part renders a `<span>`.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   * @defaultValue 'span'
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the part merges onto its first child element or component, instead of rendering its own `<span>`. The child keeps its own props and gets the role, the classes and the `data-*` attributes of the part. When not set, the part renders its own element.
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}
