import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--cck-checkbox-gap);
`;

const Box = styled.div`
  padding: var(--cck-checkbox-padding);
  border: var(--cck-checkbox-border-width) var(--cck-checkbox-border-style) var(--cck-checkbox-border-color);
  border-radius: var(--cck-checkbox-border-radius);

  direction: rtl;
  display: flex;
  align-items: center;
  gap: var(--cck-checkbox-box-gap);

  svg {
    fill: var(--cck-checkbox-icon-color);
  }
`;

export const Styled = {
  Container,
  Box,
};
