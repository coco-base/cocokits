import { useState } from 'react';

import { Icons } from '@cocokits/common-icons';
import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/form-field/prefix-icon-select.config';
import { FormField, Label, Option, Prefix, SvgIcon } from '@cocokits/react-components';

import { Styled } from './PrefixIconSelect.styled';

const iconMap: Record<'Cake' | 'Pizza' | 'Burger' | 'Steak', string> = {
  Cake: Icons.cake,
  Pizza: Icons.pizzaSlice,
  Burger: Icons.burger,
  Steak: Icons.steak,
};

export function PrefixIconSelect(props: { cckExampleArgs: ExampleArgs }) {
  const [value, setValue] = useState<'Cake' | 'Pizza' | 'Burger' | 'Steak'>('Cake');

  return (
    <FormField>
      <Label>Favorite food</Label>
      <Styled.Select value={value} onChange={(e) => setValue(e[0])}>
        <Option value="Cake">
          <Styled.OptionWrapper>
            <SvgIcon icon={iconMap.Cake} />
            Cake
          </Styled.OptionWrapper>
        </Option>
        <Option value="Pizza">
          <Styled.OptionWrapper>
            <SvgIcon icon={iconMap.Pizza} />
            Pizza
          </Styled.OptionWrapper>
        </Option>
        <Option value="Burger">
          <Styled.OptionWrapper>
            <SvgIcon icon={iconMap.Burger} />
            Burger
          </Styled.OptionWrapper>
        </Option>
        <Option value="Steak">
          <Styled.OptionWrapper>
            <SvgIcon icon={iconMap.Steak} />
            Steak
          </Styled.OptionWrapper>
        </Option>
      </Styled.Select>
      <Prefix>
        <SvgIcon icon={iconMap[value]} />
      </Prefix>
    </FormField>
  );
}
