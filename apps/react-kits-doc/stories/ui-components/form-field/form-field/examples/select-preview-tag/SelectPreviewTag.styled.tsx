import styled from "styled-components";

import { Select as CckSelect, SelectPreview as CckSelectPreview } from "@cocokits/react-components";

const Select = styled(CckSelect<string>)`
  min-width: 190px;
`;

const SelectPreview = styled(CckSelectPreview)`
  display: flex;
  gap: 8px;
`;

const Tag = styled.div`
  border-radius: 50%;
  border: 1px solid var(--tag-border);
  pad: 2px;
  width: 24px;
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--tag-bg);
  font: var(--tag-font);
  color: var(--tag-color);
`;

const HintText = styled.div`
  color: var(--hint-color);
`;

export const Styled = {
  Select,
  SelectPreview,
  Tag,
  HintText
};

