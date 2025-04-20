import React, { ReactNode } from "react";
import { styled } from "styled-components";

export function Feature(prop: {title: string, children: ReactNode, image: React.FC<void>}) {
  return (
    <StyledHost>
      <h3>{prop.title}</h3>
      <StyledImage>{prop.image()}</StyledImage>
      <p>{prop.children}</p>
    </StyledHost>
  )
}


const StyledHost = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 300px;
  max-width: 300px;
`;

const StyledImage = styled.div`
  margin: 12px 0 28px 0;
`;