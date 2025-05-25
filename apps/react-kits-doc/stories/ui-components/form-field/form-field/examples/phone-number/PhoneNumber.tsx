import InputMask from '@mona-health/react-input-mask';
import { useState } from 'react';

import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/form-field/phone-number.config';
import { FormField, Hint, Input, Label, Option, Select, Suffix, SvgIcon } from '@cocokits/react-components';

import { ATFlag, THFlag } from './flags';
import { Styled } from './PhoneNumber.styled';

const FlagsMap = {
  TH: THFlag,
  AT: ATFlag,
};

export function PhoneNumber(props: { cckExampleArgs: ExampleArgs }) {
  const [value, setValue] = useState<'TH' | 'AT'>('TH');

  return (
    <FormField>
      <Label>Phone number</Label>
      <Styled.Prefix>+{value === 'TH' ? '66' : '43'}</Styled.Prefix>
      <InputMask mask={value === 'TH' ? '999-999-999' : '999 9999 999'} maskPlaceholder={null}>
        <Input />
      </InputMask>
      <Suffix>
        <Select
          value={value}
          onChange={(e) => setValue(e[0] as 'TH' | 'AT')}
          selectPreview={(selected) => (
            <SvgIcon size={props.cckExampleArgs.previewFlagSize} icon={FlagsMap[selected[0]]} />
          )}>
          <Option value="TH">
            <Styled.OptionWrapper>
              <SvgIcon size={props.cckExampleArgs.optionFlagSize} icon={THFlag} />
              TH
            </Styled.OptionWrapper>
          </Option>
          <Option value="AT">
            <Styled.OptionWrapper>
              <SvgIcon size={props.cckExampleArgs.optionFlagSize} icon={ATFlag} />
              AT
            </Styled.OptionWrapper>
          </Option>
        </Select>
      </Suffix>
      <Hint>Enter your local phone number</Hint>
    </FormField>
  );
}
