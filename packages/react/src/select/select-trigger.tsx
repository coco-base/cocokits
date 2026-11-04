'use client';

import type { ReactElement } from 'react';
import { getSelectProps } from '@cocokits/machines/select';
import { toReactProps } from '@cocokits/react-core';
import { useElementKind } from '../internal/button-kind';
import { withoutReserved } from '../internal/merge-props';
import { renderElement } from '../internal/render-element';
import { useIsomorphicLayoutEffect } from '../internal/use-isomorphic-layout-effect';
import { useSelectContext } from './select-context';
import type { SelectPart, SelectRenderProps, SelectTriggerProps } from './select.types';
import { useSelectPartProps } from './use-select-part';

/** The attributes the machine owns, with the author's `aria-*` merged in; a consumer value can never replace them. */
const RESERVED = [
  'id',
  'role',
  'aria-haspopup',
  'aria-expanded',
  'aria-controls',
  'aria-activedescendant',
  'aria-labelledby',
  'aria-label',
  'aria-describedby',
  'aria-readonly',
  'aria-required',
  'aria-invalid',
  'data-state',
];

/** The handlers the Root builds from the native event. */
const HANDLERS = ['onClick', 'onKeyDown', 'onKeyUp', 'onBlur'];

const stringOf = (value: unknown): string | undefined => (typeof value === 'string' ? value : undefined);

function SelectTriggerImpl({ nativeButton = true, render, ref, ...rest }: SelectTriggerProps): ReactElement {
  const context = useSelectContext<unknown>('Select.Trigger');
  const { state, field, dispatch, handlers, setTriggerAria } = context;
  const label = stringOf(rest['aria-label']);
  const labelledby = stringOf(rest['aria-labelledby']);
  const describedby = stringOf(rest['aria-describedby']);

  // The list takes the name of the trigger, and the field's description joins the author's: the Root needs them.
  useIsomorphicLayoutEffect(() => {
    setTriggerAria({ label, labelledby, describedby });
  }, [setTriggerAria, label, labelledby, describedby]);

  // The trigger computes its own props with its own `aria-*`, so the first render (the server's too) carries them.
  const { trigger } = getSelectProps(
    { ...state, ariaLabel: label, labelledBy: labelledby, ariaDescribedBy: describedby },
    dispatch,
    field,
  );
  const machineProps = withoutReserved(toReactProps(trigger), [
    ...HANDLERS,
    ...(nativeButton ? [] : ['type', 'disabled']),
  ]);
  const internalRef = useElementKind('Select.Trigger', nativeButton, context.setTriggerRef);
  const props = useSelectPartProps({
    ours: {
      ...context.theme.trigger,
      ...machineProps,
      ...(nativeButton
        ? {}
        : { tabIndex: trigger.disabled ? -1 : 0, 'aria-disabled': trigger.disabled ? 'true' : undefined }),
      ...(nativeButton && context.form !== undefined ? { form: context.form } : {}),
      ...handlers,
    },
    rest,
    reserved: RESERVED,
    ref,
    render,
    internalRef,
  });
  return renderElement<SelectRenderProps, undefined>(render, 'button', props, undefined);
}

/**
 * Renders the `<button role="combobox">` that shows the selection and opens the list (or your `render` element
 * with `nativeButton={false}`, which gets `tabindex="0"` and no `type`). It carries `aria-haspopup="listbox"`,
 * `aria-expanded` and, while the list is mounted, `aria-controls`; focus stays on it while the list is open and
 * the highlighted item is its `aria-activedescendant`. Name it with the label of a FormField, or with `aria-label`
 * or `aria-labelledby` (the list takes the same name); `aria-describedby` joins the ids of the field. Put a
 * `Select.Value` and a `Select.Icon` inside it. Native button props pass through, and `ref` reaches the element.
 *
 * @example
 * <Select.Trigger aria-label="Dish">
 *   <Select.Value placeholder="Choose a dish" />
 *   <Select.Icon />
 * </Select.Trigger>
 * @cckPart trigger
 * @param props - The Trigger props.
 * @returns The rendered element.
 */
export const SelectTrigger: SelectPart<SelectTriggerProps> = Object.assign(SelectTriggerImpl, {
  displayName: 'Select.Trigger',
});
