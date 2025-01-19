import styled from "styled-components";

export const StyledControlWrapper = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 8px 12px;
`;

export const StyledControlLabel = styled.div`
  grid-column: 1;
  font: var(--cck-doc-text-sm-regular);
  color: var(--cck-doc-color-font-1);
  min-width: 40px;
  max-width: 150px;
`;

export const StyledControlSelection = styled.div`
  grid-column: 2;
`;