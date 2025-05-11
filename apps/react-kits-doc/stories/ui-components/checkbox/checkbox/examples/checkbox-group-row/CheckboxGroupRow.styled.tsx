import styled from 'styled-components';

const Label = styled.span`
  color: var(--checkbox-group-column-color);
  font-style: italic;
  font-family: var(--checkbox-group-column-font-family);
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: row;
  gap: 12px;
  margin-top: 10px;
`;

export const Styled = {
  Label,
  CheckboxGroup,
};
