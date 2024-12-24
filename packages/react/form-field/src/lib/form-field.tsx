import React, { useEffect, useRef } from 'react';
import { UIBaseComponentProps } from '@cocokits/core';
import { useUiBaseComponentConfig } from '@cocokits/react-core';
import { createFormStore } from './form-store';

export interface FormFieldProps extends UIBaseComponentProps {
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = (props) => {

  const {formStore, FormStoreProvider} = createFormStore();

  // const disabled = fromStore.useStore(state => state.disabled);
  const focused = formStore.useState(state => state.focused);

  const wrapperElemRef = useRef<HTMLDivElement>(null);
  

  const { classNames, hostClassNames } = useUiBaseComponentConfig({
    componentName: 'formField',
    props,
    extraHostElementClassConditions: [
      // { if: disabled, classes: (classNames) => [classNames.disabled] },
      { if: focused, classes: (classNames) => [classNames.focused] },
    ],
  });

  useEffect(() => {
    formStore.registerComponent('formField');
    return () => formStore.unregisterComponent('formField')
  }, [formStore])

  // useEffectAfterMount(() => fromStore.upsertComponent('formField', {disabled: props.disabled}), [props.disabled, fromStore])
  useEffect(() => formStore.updateComponent('formField', {wrapperElem: wrapperElemRef}), [wrapperElemRef, formStore])

  return (
    <FormStoreProvider value={formStore}>
    <div className={`${hostClassNames} ${props.className}`}>

      {/* TODO: Label */}

      <div className={classNames.wrapper} ref={wrapperElemRef}>
        {/* TODO: Leading Content */}
        <div className={classNames.inputWrapper}>
          {/* TODO: Prefix */}
          {props.children}
          {/* TODO: Suffix */}
        </div>
        {/* TODO: Trailing Content */}
      </div>

      <div className={classNames.feedbackWrapper}>
        {/* TODO: Hint and Error Messages */}
      </div>

    </div>
    </FormStoreProvider>
  );
};

export default FormField;
