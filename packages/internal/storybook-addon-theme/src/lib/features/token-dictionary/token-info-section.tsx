import { ReactNode } from 'react';
import styled from 'styled-components';

interface TokenSectionProp {
  title: string;
  className?: string;
  children: ReactNode;
}

export function TokenInfoSection({ title, className, children }: TokenSectionProp) {
  return (
    <StylesWrapper className={className}>
      <StylesTitle>{title}:</StylesTitle>
      {children}
    </StylesWrapper>
  );
}

const StylesWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StylesTitle = styled.div`
  font: var(--cck-doc-text-sm-regular);
  color: var(--cck-doc-color-font-4);
`;
