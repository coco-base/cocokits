import  { ReactNode } from 'react';
import styled from 'styled-components';

interface TokenSectionProp {
  title: string;
  children: ReactNode
}

export function TokenSection({title, children}: TokenSectionProp) {
  return (
    <StylesWrapper>
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
    font: var(--cck-storybook-text-xs-regular);
    color: var(--cck-storybook-color-font-contrast-1);
`;