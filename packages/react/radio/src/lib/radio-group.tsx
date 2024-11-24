import { useState } from "react";
import { RadioGroupContext } from "./radio.context";
import { useUiBaseComponentConfig } from "@cocokits/react-core";
import { RadioChangeEvent, RadioGroupProps } from "./radio.model";

export const RadioGroup = <T extends string | number,>(props: RadioGroupProps<T>) => {

  const type = props.type;
  const size = props.size;
  const color = props.color;
  const additional = props.additional;
  
  const [selected, setSelected] = useState<T | undefined>(props.selected);

  const { classNames, hostClassNames } = useUiBaseComponentConfig({
    componentName: 'radioGroup',
    props: { type, size, color, additional }
  });

  const onInputChange = (event: RadioChangeEvent<T>) => {
    setSelected(event.value);
    props.onChange?.(event);
  };

  return (
    <div className={`${hostClassNames} ${props.className}`}>
      <RadioGroupContext.Provider
        value={{
          name: props.name,
          selected: selected,
          disabled: props.disabled,
          onChange: onInputChange,
        }}>
        {props.children}
      </RadioGroupContext.Provider>
    </div>
  );
};