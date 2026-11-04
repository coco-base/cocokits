'use client';

import type { ReactElement } from 'react';
import { toReactProps, useThemeAttrs } from '@cocokits/react-core';
import { getLabelProps, labelAnatomy } from '@cocokits/machines/label';
import { useFormFieldContext, useFormFieldLabelContext } from '../internal/form-field-context';
import { mergeProps } from '../internal/merge-props';
import { useIsomorphicLayoutEffect } from '../internal/use-isomorphic-layout-effect';
import type { LabelProps } from './label.types';

function LabelImpl({ htmlFor, children, ...props }: LabelProps): ReactElement {
  const field = useFormFieldLabelContext();
  const control = useFormFieldContext();
  // The id the Label renders is the one the field's control refers to: an author `id` wins and is reported.
  const labelId = props.id ?? control?.ids.label;
  const setLabelId = control?.setLabelId;
  useIsomorphicLayoutEffect(() => {
    setLabelId?.(props.id);
    return () => {
      setLabelId?.(undefined);
    };
  }, [setLabelId, props.id]);
  const parts = getLabelProps({
    id: labelId,
    for: htmlFor === undefined || htmlFor === '' ? field?.controlId : htmlFor,
    required: field?.required,
    hideRequiredMarker: field?.hideRequiredMarker,
  });
  const themeAttrs = useThemeAttrs(labelAnatomy);
  const { text, ...markerProps } = parts.requiredMarker ?? { text: undefined };
  // `ref` is one of the props and reaches the label as it is.
  return (
    <label {...mergeProps({ ...themeAttrs.root, ...toReactProps(parts.root) }, { ...props })}>
      {children}
      {text !== undefined && (
        <span {...themeAttrs.requiredMarker} {...toReactProps(markerProps)}>
          {text}
        </span>
      )}
    </label>
  );
}

/** The {@link Label} component and its `displayName`. */
interface LabelComponent {
  (props: LabelProps): ReactElement;
  displayName: string;
}

/**
 * Renders a native `<label>` with the text of a control. Inside a FormField with a CocoKits control
 * `htmlFor` defaults to the control's id, so a click on the label focuses the control and the label
 * names it; an `htmlFor` you write wins. Outside a field, or for a control that is not a CocoKits
 * control, set `htmlFor` to the `id` of the control. For a control that is not labelable, give the
 * Label an `id` and set `aria-labelledby` on the control. While the control is required, the label
 * ends with a `*` marker that is hidden from assistive technology (the native `required` is
 * announced); `hideRequiredMarker` on the FormField hides it. Inside a FormField the label has an `id` that
 * names the open list of a Select. Native label attributes pass through,
 * and `ref` reaches the label.
 *
 * @example
 * <FormField label={<Label>Email address</Label>}>
 *   <Input type="email" required />
 * </FormField>
 * @cckPart root
 * @cckPart requiredMarker
 * @param props - The Label props.
 * @returns The rendered label.
 */
export const Label: LabelComponent = Object.assign(LabelImpl, { displayName: 'Label' });
