'use client';

import {
  cloneElement,
  isValidElement,
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type ReactElement,
  type Ref,
} from 'react';
import { toReactProps, useThemeAttrs } from '@cocokits/react-core';
import { shouldFocusControl } from '@cocokits/utils';
import {
  formFieldAnatomy,
  formFieldStateAttrs,
  formFieldIds,
  getFormFieldProps,
  resolveFormFieldState,
  isSameFormFieldControlState,
  type FormFieldControlState,
} from '@cocokits/machines/form-field';
import {
  FormFieldContext,
  FormFieldLabelContext,
  FormFieldStateContext,
  type FormFieldContextValue,
  type FormFieldLabelContextValue,
} from '../internal/form-field-context';
import { ownPartIds, withPartIds } from '../internal/field-parts';
import { mergeProps, withoutReserved } from '../internal/merge-props';
import { renderElement } from '../internal/render-element';
import { useIsomorphicLayoutEffect } from '../internal/use-isomorphic-layout-effect';
import { useMergedRef } from '../internal/use-merged-ref';
import type { FormFieldProps, FormFieldRenderProps, FormFieldState } from './form-field.types';

interface ElementProps {
  readonly ref?: Ref<HTMLElement>;
}

/** The ids of a zone from their JSON key; JSON writes a missing id as `null`. */
const ownIdsOf = (key: string): (string | undefined)[] =>
  (JSON.parse(key) as (string | null)[]).map((id) => id ?? undefined);

function FormFieldImpl({
  label,
  hint,
  leading,
  prefix,
  suffix,
  trailing,
  error,
  render,
  ref,
  children,
  disabled,
  readOnly,
  required,
  invalid,
  hideRequiredMarker,
  id,
  hidden,
  ...rest
}: FormFieldProps): ReactElement {
  const generatedId = useId();
  const fieldId = id === undefined || id === '' ? generatedId : id;
  const [reported, setReported] = useState<FormFieldControlState | undefined>(undefined);
  // After the first commit every control has registered, so a Label without a control can drop its `for`.
  const [settled, setSettled] = useState(false);
  const [inputWrapper, setInputWrapper] = useState<HTMLElement | null>(null);
  const owner = useRef<object | null>(null);
  const controlElement = useRef<HTMLElement | null>(null);

  const claim = useCallback((token: object, element: HTMLElement): boolean => {
    if (owner.current === null) {
      owner.current = token;
      controlElement.current = element;
    }
    return owner.current === token;
  }, []);
  const release = useCallback((token: object): void => {
    if (owner.current !== token) return;
    owner.current = null;
    controlElement.current = null;
    setReported(undefined);
  }, []);
  const report = useCallback((token: object, state: FormFieldControlState): void => {
    if (owner.current === token)
      setReported((previous) => (isSameFormFieldControlState(previous, state) ? previous : state));
  }, []);
  useIsomorphicLayoutEffect(() => {
    setSettled(true);
  }, []);

  const [authorLabelId, setLabelId] = useState<string | undefined>(undefined);
  // The ids of the hints and errors come from the props, so the first render and the server render have them.
  const hintKey = JSON.stringify(ownPartIds(hint));
  const errorKey = JSON.stringify(ownPartIds(error));
  const ids = useMemo(
    () => ({
      ...formFieldIds(fieldId, {
        hints: ownIdsOf(hintKey),
        errors: ownIdsOf(errorKey),
      }),
      ...(authorLabelId === undefined ? {} : { label: authorLabelId }),
    }),
    [fieldId, authorLabelId, hintKey, errorKey],
  );
  const own = useMemo(
    () => ({ disabled, readOnly, required, invalid, hideRequiredMarker }),
    [disabled, readOnly, required, invalid, hideRequiredMarker],
  );
  const state = useMemo(() => resolveFormFieldState(own, reported), [own, reported]);
  const control = useMemo<FormFieldContextValue>(
    () => ({ ids, own, claim, release, report, setLabelId, inputWrapper }),
    [ids, own, claim, release, report, inputWrapper],
  );
  const controlId = reported ? reported.id : settled ? undefined : ids.control;
  const labelContext = useMemo<FormFieldLabelContextValue>(
    () => ({ required: state.required, hideRequiredMarker: Boolean(hideRequiredMarker), controlId }),
    [state.required, hideRequiredMarker, controlId],
  );

  // A press on the input wrapper belongs to the control: see `shouldFocusControl`. React gives the handler the
  // synthetic event, which has the fields the function reads, with `currentTarget` the wrapper.
  const onInputWrapperPress = (event: MouseEvent<HTMLElement>): void => {
    const control = controlElement.current;
    if (!control || !shouldFocusControl(event as unknown as globalThis.MouseEvent, control)) return;
    if (event.type === 'click') control.focus();
    else if (control.ownerDocument.activeElement === control) event.preventDefault();
  };

  const parts = getFormFieldProps({ state, fieldId });
  const themeAttrs = useThemeAttrs(formFieldAnatomy);
  const elementRef = isValidElement<ElementProps>(render) ? render.props.ref : undefined;
  const mergedRef = useMergedRef<HTMLElement>(ref, elementRef, undefined);
  const zones = (
    <FormFieldContext value={control}>
      <FormFieldStateContext value={state}>
        <FormFieldLabelContext value={labelContext}>
          {label}
          <div {...themeAttrs.wrapper} {...toReactProps(parts.wrapper)}>
            {leading}
            <div
              ref={setInputWrapper}
              {...themeAttrs.inputWrapper}
              {...toReactProps(parts.inputWrapper)}
              onMouseDown={onInputWrapperPress}
              onClick={onInputWrapperPress}
            >
              {prefix}
              {children}
              {suffix}
            </div>
            {trailing}
          </div>
          <div {...themeAttrs.feedbackWrapper} {...toReactProps(parts.feedbackWrapper)}>
            {withPartIds(hint, ids.hints)}
            {withPartIds(error, ids.errors)}
          </div>
        </FormFieldLabelContext>
      </FormFieldStateContext>
    </FormFieldContext>
  );
  const props = mergeProps(
    { ...themeAttrs.root, ...toReactProps(parts.root), ref: mergedRef, children: zones },
    // An empty `id` renders no attribute. The control hides the root too, so only an author `hidden` of `true` is theirs.
    {
      ...withoutReserved(rest, formFieldStateAttrs),
      id: id === '' ? undefined : id,
      hidden: hidden === true ? true : undefined,
    },
  ) as unknown as FormFieldRenderProps;
  // The zones win over the element's own children.
  const element = isValidElement<{ children?: undefined }>(render)
    ? cloneElement(render, { children: undefined })
    : render;
  return renderElement<FormFieldRenderProps, FormFieldState>(element, 'div', props, state);
}

/** The {@link FormField} component and its `displayName`. */
interface FormFieldComponent {
  (props: FormFieldProps): ReactElement;
  displayName: string;
}

/**
 * Renders a `<div>` by default that lays out a label, a control, its zones and its hints in fixed
 * places: the `label` prop; inside the wrapper the `leading` prop, then the input wrapper (the
 * `prefix` prop, the `children` (the control), the `suffix` prop), then the `trailing` prop; and the
 * `hint` and `error` props inside a feedback wrapper that is always rendered. The places fix the
 * order, not the order the props are written in. Pass the zone components (`Prefix`, `Suffix`,
 * `Leading`, `Trailing`, `FieldError`) to the props. A click on the input wrapper (its padding, a
 * prefix or a suffix) focuses the control, unless it lands on interactive content, on a disabled
 * control or after selecting text.
 *
 * It wires a CocoKits control for you. The field has an id (your `id`, or a generated one); the
 * control (an Input or a Textarea) gets `<id>-control`, the Label's `htmlFor` points at it, and the
 * control's `aria-describedby` ends with the ids of its hints, then of its errors (an `id` on a Hint or a
 * FieldError wins; otherwise `<id>-hint-<n>` or `<id>-error-<n>`), so every hint and error describes the control. An `id`, `htmlFor` or `aria-describedby` you write wins or comes first.
 * `disabled`, `readOnly`, `required` and `invalid` reach the control, and the facts of the control (those
 * and `touched`, `dirty`, `submitted`, `focused`, `filled`, `pending`) are `data-*` attributes on the field root. A control
 * that is not a CocoKits control gets none of this: give it an `id`, give the Label the same
 * `htmlFor`, and add the hint ids to its `aria-describedby`. The field holds one control. Native div
 * attributes pass through, and `ref` reaches the div.
 *
 * @example
 * <FormField label={<Label>Email address</Label>} hint={<Hint>We never share it.</Hint>} required>
 *   <Input type="email" />
 * </FormField>
 * @cckPart root
 * @param props - The FormField props.
 * @returns The rendered div.
 */
export const FormField: FormFieldComponent = Object.assign(FormFieldImpl, { displayName: 'FormField' });
