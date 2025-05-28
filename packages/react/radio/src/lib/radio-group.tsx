'use client';
import { useState } from 'react';

import { useUiBaseComponentConfig } from '@cocokits/react-core';
import { useEffectAfterMount } from '@cocokits/react-utils';

import { RadioGroupContext } from './radio.context';
import { RadioChangeEvent, RadioGroupProps } from './radio.model';

export const RadioGroup = <T extends string | number>(props: RadioGroupProps<T>) => {
  const [selected, setSelected] = useState<T | undefined>(props.selected);

  const { hostClassNames } = useUiBaseComponentConfig({
    componentName: 'radioGroup',
    props: props,
    extraHostElementClassConditions: [{ if: !!props.className, classes: () => [props.className] }],
  });

  useEffectAfterMount(() => {
    setSelected(props.selected);
  }, [props.selected]);

  const onInputChange = (event: RadioChangeEvent<T>) => {
    setSelected(event.value);
    props.onChange?.(event);
  };

  return (
    <div className={hostClassNames} style={props.style}>
      <RadioGroupContext.Provider
        value={{
          name: props.name,
          type: props.type,
          size: props.size,
          color: props.color,
          additional: props.additional,
          selected: selected,
          disabled: props.disabled,
          onChange: onInputChange,
        }}>
        {props.children}
      </RadioGroupContext.Provider>
    </div>
  );
};

RadioGroup.displayName = 'RadioGroup';
export default RadioGroup;
