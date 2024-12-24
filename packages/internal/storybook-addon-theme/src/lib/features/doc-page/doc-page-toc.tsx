import { FC } from 'react';
import styled from 'styled-components';

export interface DocTocItem {
  id: string;
  name: string;
}

interface DocPageTocProps {
  items: DocTocItem[];
}



export const DocPageToc: FC<DocPageTocProps & React.HTMLAttributes<HTMLDivElement>> = ({ items, ...props }) => {

  if (!items.length) {
    return null;
  }

  return (
    <StyledHost {...props}>
      TODO: ...
    </StyledHost>
  );
};

// region ---------------- STYLES ----------------
const StyledHost = styled.div`
    display: flex;
    flex-direction: column;
`;
// endregion