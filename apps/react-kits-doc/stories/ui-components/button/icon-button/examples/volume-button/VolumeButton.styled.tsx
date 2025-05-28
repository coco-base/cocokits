import styled from 'styled-components';

import { SvgIcon } from '@cocokits/react-components';

const Host = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Label = styled.span`
  font: var(--volume-text-font);
  color: var(--volume-text-color);
`;

const Icon = styled(SvgIcon)`
  fill: var(--volume-text-color);
`;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const Styled = {
  Host,
  Label,
  Icon,
  Wrapper,
};
