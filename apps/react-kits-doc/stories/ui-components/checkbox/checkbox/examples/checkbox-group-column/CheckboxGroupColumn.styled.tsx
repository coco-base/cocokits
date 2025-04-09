import styled from 'styled-components';

const Label = styled.span`
  color: var(--checkbox-group-column-color);
  font-style: italic;
  font-family: var(--checkbox-group-column-font-family);
`;

const CheckboxGroupColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const Styled = {
  Label,
  CheckboxGroupColumn,
};
