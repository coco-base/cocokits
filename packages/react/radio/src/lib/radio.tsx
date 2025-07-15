'use client';
import React, { useContext, useState } from 'react';

import { ThemeConfigContext, useUiBaseComponentConfig } from '@cocokits/react-core';

import { RadioGroupContext } from './radio.context';
import { RadioButtonProps } from './radio.model';

let NEXT_ID = 0;

export const RadioButton = <T extends string | number>(props: RadioButtonProps<T>) => {
  const radioContextValue = useContext(RadioGroupContext);
  const [id] = useState(props.id ?? `cck-radio-${NEXT_ID++}`);

  const name = props.name ?? radioContextValue?.name;
  const type = props.type ?? radioContextValue?.type;
  const size = props.size ?? radioContextValue?.size;
  const color = props.color ?? radioContextValue?.color;
  const additional = props.additional ?? radioContextValue?.additional;
  const disabled = props.disabled ?? radioContextValue?.disabled;
  const value = props.value;
  const checked = radioContextValue ? radioContextValue.selected === value : props.checked;

  const themeConfig = useContext(ThemeConfigContext);

  const { classNames, hostClassNames } = useUiBaseComponentConfig({
    componentName: 'radioButton',
    props: { type, size, color, additional },
    extraHostElementClassConditions: [
      { if: disabled, classes: (cn) => [cn.disabled] },
      { if: checked, classes: (cn) => [cn.checked] },
      { if: !checked, classes: (cn) => [cn.unchecked] },
      { if: !!props.className, classes: () => [props.className] },
    ],
  });

  const onInputChange = () => {
    if (disabled) {
      return;
    }

    props.onChange?.({ value });
    radioContextValue?.onChange?.({ value });
  };

  return (
    <div className={hostClassNames} style={props.style}>
      <div className={classNames.wrapper}>
        <div className={classNames.inputWrapper}>
          <input
            className={classNames.input}
            type="radio"
            id={id}
            name={name}
            checked={checked}
            disabled={disabled}
            value={value}
            onChange={onInputChange}
          />

          <div className={classNames.backdrop}></div>
          <div
            className={classNames.background}
            dangerouslySetInnerHTML={{
              __html: themeConfig?.components.radioButton?.templates?.radioCheckmark ?? '',
            }}></div>
        </div>
        <label className={classNames.label} htmlFor={id}>
          {props.children}
        </label>
      </div>
    </div>
  );
};

RadioButton.displayName = 'RadioButton';
export default RadioButton;
