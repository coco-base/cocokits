import styled from "styled-components";

import { Select } from "@cocokits/react-components";

const _Select = styled(Select<'Cake' | 'Pizza' | 'Burger' | 'Steak'>)`
  min-width: 150px;
`;

const OptionWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  .cck-svg-icon {
    fill: currentColor;
  }
`;

export const Styled = {
  Select: _Select,
  OptionWrapper
};