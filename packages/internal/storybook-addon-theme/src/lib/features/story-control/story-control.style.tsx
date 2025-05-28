import styled, { css } from 'styled-components';

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

export const StyledControlImage = styled.div<{ $selected: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 4px;
  overflow: hidden;
  border: 2px solid transparent;

  img {
    width: 32px;
    height: 32px;
    border-radius: 4px;
  }

  ${(props) =>
    props.$selected &&
    css`
      border: 2px solid var(--cck-doc-color-brand-default);
    `}
`;

export const StyledControlSelection = styled.div<{ $isRow?: boolean }>`
  grid-column: 2;

  ${(props) =>
    props.$isRow &&
    css`
      display: flex;
      gap: 12px;
    `}
`;
