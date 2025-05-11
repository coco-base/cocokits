import { Icons } from '@cocokits/common-icons';
import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/checkbox/checkbox-box-selection-info.config';
import { Checkbox, SvgIcon } from '@cocokits/react-components';

import { Styled } from './CheckboxBoxSelectionInfo.styled';

export function CheckboxBoxSelectionInfo(props: { cckExampleArgs: ExampleArgs }) {
  return (
    <Styled.Container>
      <Styled.Box>
        <Checkbox value={1}>Leave at Door</Checkbox>
        <SvgIcon icon={Icons.info} size={props.cckExampleArgs.IconSize} />
      </Styled.Box>
      <Styled.Box>
        <Checkbox value={2}>Call on Arrival</Checkbox>
        <SvgIcon icon={Icons.info} size={props.cckExampleArgs.IconSize} />
      </Styled.Box>
    </Styled.Container>
  );
}
