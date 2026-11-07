'use client';

import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
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
import { isDevelopment } from '../internal/dev';
import { readZone, withPartIds } from '../internal/field-parts';
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
  const hintKey = JSON.stringify(readZone(hint, 'hint').ownIds);
  const errorKey = JSON.stringify(readZone(error, 'error').ownIds);
  const hasWrapper = readZone(hint, 'hint').hasWrapper || readZone(error, 'error').hasWrapper;
  useEffect(() => {
    if (hasWrapper && isDevelopment()) {
      console.warn(
        'CocoKits: a FormField lists only the Hint and FieldError elements put directly in the hint or error prop. An element around them hides them: the control is not described by them.',
      );
    }
  }, [hasWrapper]);
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
            {withPartIds(readZone(hint, 'hint'), 'hint', ids.hints)}
            {withPartIds(readZone(error, 'error'), 'error', ids.errors)}
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
 * A label, a control, its zones, its hints and its errors, each in a fixed place. It renders a `<div>`. Native `div`
 * props pass through, and `ref` reaches the element.
 *
 * The `label` comes first. Then come `leading`, the box with `prefix`, the control and `suffix`, and `trailing`.
 * Last come `hint` and `error`, in a feedback wrapper that is always rendered. The order of your props does not
 * change this order.
 *
 * A click on the box, its padding, a prefix or a suffix moves the focus to the control. It does not when the click
 * lands on a link or a button, on a disabled control, or ends a text selection.
 *
 * The field links its CocoKits control for you. The control, an `Input` or a `Textarea`, gets the id
 * `<id>-control`, and the `htmlFor` of the `Label` points to it.
 *
 * The ids of the hints and then of the errors follow the `aria-describedby` of the control. A hint or error without
 * an `id` gets `<id>-hint-<n>` or `<id>-error-<n>`. An `id`, `htmlFor` or `aria-describedby` you write wins or comes
 * first.
 *
 * `disabled`, `readOnly`, `required` and `invalid` reach the control. The root has the state of the control as
 * `data-*` attributes, also `touched`, `dirty`, `submitted`, `focused`, `filled` and `pending`.
 *
 * A control that is not a CocoKits control gets none of this. Give it an `id` and the `Label` the same `htmlFor`,
 * and add the ids of the hints to its `aria-describedby`.
 *
 * @example
 * <FormField
 *   label={<Label>Email address</Label>}
 *   hint={<Hint>We never share it.</Hint>}
 *   error={<FieldError>Enter an email address.</FieldError>}
 *   required
 * >
 *   <Input type="email" />
 * </FormField>
 * @cckPart root
 * @param props - The FormField props.
 * @returns The rendered div.
 */
export const FormField: FormFieldComponent = Object.assign(FormFieldImpl, { displayName: 'FormField' });
