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
 * The text that names a control. It renders a native `<label>`. Native `label` props pass through, and `ref`
 * reaches the element.
 *
 * Inside a `FormField` with a CocoKits control, `htmlFor` points to the control by itself. A click on the label then
 * moves the focus to the control. An `htmlFor` you write wins.
 *
 * Outside a field, or for a control that is not a CocoKits control, set `htmlFor` to the `id` of the control. For a
 * control that a label cannot name, give the Label an `id` and the control `aria-labelledby`.
 *
 * While the control is required, the label ends with a `*` marker that screen readers skip, because they read the
 * native `required`. `hideRequiredMarker` on the `FormField` hides it.
 *
 * Inside a `FormField`, the label has an `id` that names the open list of a Select.
 *
 * @example
 * <Label htmlFor="email">Email address</Label>
 * <input id="email" type="email" required />
 * @cckPart root
 * @cckPart requiredMarker
 * @param props - The Label props.
 * @returns The rendered label.
 */
export const Label: LabelComponent = Object.assign(LabelImpl, { displayName: 'Label' });
