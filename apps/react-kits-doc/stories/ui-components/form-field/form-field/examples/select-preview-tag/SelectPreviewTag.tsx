import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/form-field/select-preview-tag.config';
import { FormField, Label, Option } from '@cocokits/react-components';

import { Styled } from './SelectPreviewTag.styled';

export function SelectPreviewTag(props: { cckExampleArgs: ExampleArgs }) {
  return (
    <FormField>
      <Label>Favorite food</Label>
      <Styled.Select
        value={['Cake', 'Pizza']}
        multiple={true}
        selectPreview={(selected) => (
          <Styled.SelectPreview>
            <Styled.Tag>{selected.length}</Styled.Tag>
            <span>{selected[0]}</span>
            {selected.length > 1 && <Styled.HintText> (+{selected.length - 1} more)</Styled.HintText>}
          </Styled.SelectPreview>
        )}>
        <Option value="Cake">Cake</Option>
        <Option value="Pizza">Pizza</Option>
        <Option value="Burger">Burger</Option>
        <Option value="Steak">Steak</Option>
      </Styled.Select>
    </FormField>
  );
}
