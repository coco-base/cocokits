import styled from "styled-components";

interface TokenInfoVariableProps {
  value: string;
}

export function TokenInfoVariable({ value }: TokenInfoVariableProps) {
  return (
    <StyledHost>
      {value}
    </StyledHost>
  );

}

const StyledHost = styled.div`
  display: flex;
  border: 1px solid var(--cck-doc-color-border-2);
  background-color: var(--cck-doc-color-bg-2);
  padding: 8px 8px 8px 18px;
  font: var(--cck-doc-text-sm-regular);
  color: var(--cck-doc-color-font-1);
`;