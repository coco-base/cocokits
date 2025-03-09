/* eslint-disable max-lines-per-function */
'use client';
import { CSSProperties, Fragment, ReactNode, useEffect, useRef } from 'react';

import { UIBaseComponentProps } from '@cocokits/core';
import { useUiBaseComponentConfig } from '@cocokits/react-core';

import { useCreateFormStore } from './form-store';

export interface FormFieldProps extends UIBaseComponentProps {
  /**
   * Whether the form field is disabled.
   */
  disabled?: boolean;
  /**
   * Whether the field is required.
   */
  required?: boolean;
  /**
   * Whether the form field is invalid.
   */
  invalid?: boolean;
  /**
   * Whether the required marker should be hidden.
   */
  hideRequiredMarker?: boolean | undefined;
  /**
   * The content inside the component.
   * This can be a string, a number, an element, or an array of elements.
   * It allows rendering nested components within this component.
   */
  children?: ReactNode | ReactNode[];
  /**
   * A custom class name that can be used to apply additional styles to the component.
   */
  className?: string;
  /**
   * An object containing inline styles that can be used to customize the appearance of the component.
   */
  style?: CSSProperties;
}

export const FormField = (props: FormFieldProps) => {
  const { formStore, FormStoreProvider } = useCreateFormStore();

  const disabled = formStore.useState((state) => state.disabled);
  const required = formStore.useState((state) => state.required);
  const focused = formStore.useState((state) => state.focused);
  const hasInput = formStore.useState((state) => state.hasInput);
  const hasSelect = formStore.useState((state) => state.hasSelect);
  const hasChipList = formStore.useState((state) => state.hasChipList);
  const hasTextarea = formStore.useState((state) => state.hasTextarea);
  const invalid = formStore.useState((state) => state.invalid);
  const error = formStore.useState((state) => state.error);
  const size = formStore.useState((state) => state.size);
  const labelTemplate = formStore.useState((state) => state.labelTemplate);
  const hintTemplate = formStore.useState((state) => state.hintTemplate);
  const errorsTemplates = formStore.useState((state) => state.errorsTemplates);
  const prefixTemplate = formStore.useState((state) => state.prefixTemplate);
  const suffixTemplate = formStore.useState((state) => state.suffixTemplate);
  const leadingTemplate = formStore.useState((state) => state.leadingTemplate);
  const trailingTemplate = formStore.useState((state) => state.trailingTemplate);

  const wrapperElemRef = useRef<HTMLDivElement>(null);

  const { classNames, hostClassNames } = useUiBaseComponentConfig({
    componentName: 'formField',
    props: { ...props, size },
    extraHostElementClassConditions: [
      { if: disabled, classes: (cn) => [cn.disabled] },
      { if: required, classes: (cn) => [cn.required] },
      { if: focused, classes: (cn) => [cn.focused] },
      { if: hasInput, classes: (cn) => [cn.withInput] },
      { if: hasSelect, classes: (cn) => [cn.withSelect] },
      { if: hasChipList, classes: (cn) => [cn.withChipList] },
      { if: hasTextarea, classes: (cn) => [cn.withTextarea] },
      { if: invalid, classes: (cn) => [cn.invalid] },
      { if: error, classes: (cn) => [cn.error] },
      { if: !!props.className, classes: () => [props.className] },
      // TODO: add formControl like react-hook-form. with untouched, touched, pristine, dirty, valid, invalid, pending
    ],
  });

  useEffect(() => {
    formStore.registerComponent('formField');
    return () => formStore.unregisterComponent('formField');
  }, [formStore]);

  useEffect(() => {
    formStore.deepUpdateComponent('formField', {
      wrapperElem: wrapperElemRef.current,
      disabled: props.disabled,
      required: props.required,
      invalid: props.invalid,
      size: props.size,
      hideRequiredMarker: props.hideRequiredMarker,
    });
  }, [
    wrapperElemRef.current,
    formStore,
    props.disabled,
    props.required,
    props.invalid,
    props.size,
    props.hideRequiredMarker,
  ]);

  return (
    <FormStoreProvider value={formStore}>
      <div style={props.style} className={hostClassNames}>
        {labelTemplate}

        <div className={classNames.wrapper} ref={wrapperElemRef}>
          {leadingTemplate}
          <div className={classNames.inputWrapper}>
            {prefixTemplate}
            {props.children}
            {suffixTemplate}
          </div>
          {trailingTemplate}
        </div>

        <div className={classNames.feedbackWrapper}>
          {hintTemplate}
          {errorsTemplates.map((errorTemplate, index) => {
            return <Fragment key={index}>{errorTemplate}</Fragment>;
          })}
        </div>
      </div>
    </FormStoreProvider>
  );
};

FormField.displayName = 'FormField';
export default FormField;
