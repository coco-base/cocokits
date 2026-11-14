import type { ComponentPropsWithRef, HTMLAttributes, RefCallback } from 'react';
import type { ChipListChangeReason } from '@cocokits/machines/chip-list';
import type { ChangeDetails } from '@cocokits/shared';
import type { RenderProp } from '../internal/render-element';

export type { ChipListChangeReason };

/** What `onValueChange` receives besides the list: the `reason` and the `event` behind the change. */
export type ChipListChangeDetails = ChangeDetails<ChipListChangeReason>;

/**
 * The root props that the function form of `render` receives: the native props merged with the props of the list.
 * Pass all of them, `children` and `ref` included, to one element.
 */
export interface ChipListRenderProps extends Omit<HTMLAttributes<HTMLElement>, 'color'> {
  /** Any `data-*` attribute: the facts of the list and the theme options. */
  readonly [attribute: `data-${string}`]: string | undefined;
  /** The merged ref: the `ref` of the list, the `ref` of the rendered element and the `ref` of the list itself. */
  readonly ref: RefCallback<HTMLElement>;
}

/**
 * Props of the {@link ChipList}. Native `div` props pass through to the root, and `ref` reaches it. `id`,
 * `aria-label`, `aria-labelledby`, `aria-describedby` and `placeholder` go to the text box.
 */
export interface ChipListProps extends Omit<
  ComponentPropsWithRef<'div'>,
  'children' | 'color' | 'defaultValue' | 'id' | 'hidden' | 'aria-label' | 'aria-labelledby' | 'aria-describedby'
> {
  /**
   * The values of the list, in the order they were added. Setting it makes the list controlled. If you do not
   * update it after `onValueChange`, the old values stay.
   *
   * When not set, the list keeps its own values, which start as `defaultValue`.
   */
  readonly value?: readonly string[] | undefined;
  /**
   * The start values of a list that you do not control with `value`. A form reset restores them.
   *
   * @defaultValue []
   *
   * @cckSemantic none
   * @cckParity The uncontrolled start value.
   */
  readonly defaultValue?: readonly string[] | undefined;
  /**
   * Called after the user adds or removes a value, and after a form reset. It receives the new list and a details
   * object with the `reason` and the `event`. It is never called when you change `value` yourself, and not when
   * the user adds a text that is empty or already in the list.
   *
   * @example
   * const [tags, setTags] = useState<readonly string[]>([]);
   * <ChipList aria-label="Tags" value={tags} onValueChange={(next) => setTags(next)} />
   *
   * @cckSemantic chip-list.valueChange
   * @cckParity The change callback of this component.
   */
  readonly onValueChange?: ((value: readonly string[], details: ChipListChangeDetails) => void) | undefined;
  /**
   * The name of the form entries. With a `name`, `FormData` has one entry per chip. When not set, the form does not
   * send the list.
   *
   * @remarks
   * The list adds one hidden input per value under this name. The text box has no name.
   */
  readonly name?: string | undefined;
  /**
   * The id of the form that owns the hidden inputs. When not set, the nearest form around the list owns them.
   */
  readonly form?: string | undefined;
  /**
   * Whether text that is still in the text box becomes a chip when focus leaves the text box.
   *
   * @defaultValue false
   */
  readonly addOnBlur?: boolean | undefined;
  /**
   * The hint that shows in the text box while it is empty. When not set, the text box shows no hint.
   *
   * @defaultValue ''
   */
  readonly placeholder?: string | undefined;
  /**
   * The `id` of the text box. Inside a `FormField`, an `id` you write wins, and the `Label` follows it. When not
   * set, the text box inside a `FormField` gets `<fieldId>-control`.
   *
   * @cckSemantic chip-list.id
   */
  readonly id?: string | undefined;
  /**
   * Names the text box when no `Label` does. Outside a `FormField`, give the text box a name with this prop or
   * with `aria-labelledby`. When not set, only `aria-labelledby` or the `Label` of the field names it.
   *
   * @cckSemantic chip-list.ariaLabel
   */
  readonly 'aria-label'?: string | undefined;
  /**
   * The id of the element that names the text box. When not set, only `aria-label` or the `Label` of the field
   * names it.
   *
   * @cckSemantic chip-list.ariaLabelledBy
   */
  readonly 'aria-labelledby'?: string | undefined;
  /**
   * The ids of the elements that describe the text box. Inside a `FormField`, the ids of its hints and then of its
   * errors follow them. When not set, only the field describes the text box.
   *
   * @cckSemantic chip-list.ariaDescribedBy
   */
  readonly 'aria-describedby'?: string | undefined;
  /**
   * Whether the list is disabled. The text box and every remove button are natively disabled, and nothing is
   * added or removed. A disabled `fieldset` around it, or a disabled `FormField`, also disables it.
   *
   * @defaultValue false
   */
  readonly disabled?: boolean | undefined;
  /**
   * Whether the list is read-only. The user can focus the text box, but the list adds and removes nothing, and
   * the remove buttons are disabled.
   *
   * @defaultValue false
   */
  readonly readOnly?: boolean | undefined;
  /**
   * Whether the list must have a value before the form can submit. The hidden inputs get the native `required`,
   * and the text box gets `aria-required`.
   *
   * @defaultValue false
   */
  readonly required?: boolean | undefined;
  /**
   * Whether the value is not valid. The text box gets `aria-invalid` only after the user has left the list or has
   * tried to submit the form.
   *
   * @defaultValue false
   */
  readonly invalid?: boolean | undefined;
  /**
   * Whether an async check of the value is running.
   *
   * @defaultValue false
   */
  readonly pending?: boolean | undefined;
  /**
   * Whether the user has left the list. A value you pass wins. When not set, the list sets it after focus first
   * leaves it.
   */
  readonly touched?: boolean | undefined;
  /**
   * Whether the user has added or removed a value. A value you pass wins. When not set, the list sets it after the
   * first change.
   */
  readonly dirty?: boolean | undefined;
  /**
   * Whether the user has tried to submit the form. A value you pass wins, so you can bind the submit state of a
   * form library.
   *
   * When not set, a `submit` event of the form sets it, also a canceled one, and a form reset clears it.
   */
  readonly submitted?: boolean | undefined;
  /**
   * Whether the list is hidden. It sets the native `hidden`. When not set, the list shows.
   */
  readonly hidden?: boolean | undefined;
  /**
   * Replaces the root element. Pass an element, or a function of the root props that returns an element.
   *
   * When not set, the root is a `<div>`.
   *
   * @remarks
   * The chips and the text box stay. The element form keeps the `ref` of the element. The function form does not
   * work from a Server Component.
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   */
  readonly render?: RenderProp<ChipListRenderProps, undefined> | undefined;
}
