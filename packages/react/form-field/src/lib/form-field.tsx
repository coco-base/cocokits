'use client';
import React, { useEffect, useRef } from 'react';

import { UIBaseComponentProps } from '@cocokits/core';
import { useUiBaseComponentConfig } from '@cocokits/react-core';

import { useCreateFormStore } from './form-store';


export interface FormFieldProps extends UIBaseComponentProps {
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  hideRequiredMarker?: boolean;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}


export const FormField = (props: FormFieldProps) => {
  const { formStore, FormStoreProvider } = useCreateFormStore();

  const disabled = formStore.useState((state) => state.disabled);
  const required = formStore.useState((state) => state.required);
  const focused = formStore.useState((state) => state.focused);
  const hasInput = formStore.useState((state) => state.hasInput);
  const hasSelect = formStore.useState((state) => state.hasSelect);
  const invalid = formStore.useState((state) => state.invalid);
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
    props: {...props, size},
    extraHostElementClassConditions: [
      { if: disabled, classes: (cn) => [cn.disabled] },
      { if: required, classes: (cn) => [cn.required] },
      { if: focused, classes: (cn) => [cn.focused] },
      { if: hasInput, classes: (cn) => [cn.withInput] },
      { if: hasSelect, classes: (cn) => [cn.withSelect] },
      { if: invalid, classes: (cn) => [cn.invalid] },
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
      wrapperElem: wrapperElemRef,
      disabled: props.disabled,
      required: props.required,
      invalid: props.invalid,
      size: props.size,
      hideRequiredMarker: props.hideRequiredMarker,
    });
  }, [wrapperElemRef, formStore, props.disabled, props.required, props.invalid, props.size, props.hideRequiredMarker]);

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
            return <React.Fragment key={index}>{errorTemplate}</React.Fragment>;
          })}
        </div>
      </div>
    </FormStoreProvider>
  );
};

FormField.displayName = 'FormField';
export default FormField;
