import styled from "styled-components";

const Host = styled.div`
  display: flex;
  align-items: center;
  gap: var(--volume-host-gap);
`;

const Label = styled.span`
  font: var(--volume-text-font);
  color: var(--volume-text-color);
`;

export const Styled = {
  Host,
  Label
};