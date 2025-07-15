import React from 'react';
import styled from "styled-components"
import { NeonBox } from './neon-box';
import { SvgIcon } from '@cocokits/react-components';
import { Icons } from '@cocokits/common-icons';

export function Intro() {
  return (
    <StyledContainer>
      <StyledHost>
        <StyledHeader>
          <StyledPHeader>
            Create fast and performant enterprise apps and websites.
            <br />
            Use robust toolset and components to scale you business with confidence.
          </StyledPHeader>

          <StyledPSubheader>
            CocoKits is everything you need to build your project with any framework. We provide you with all you need,
            such as utilities, CDK (Component Development Kit), and core components.
          </StyledPSubheader>
        </StyledHeader>

        <StyledNeonBoxGrid>
          <StyledNeonBox>
            <StyledNeonBoxIcon icon={Icons.code}></StyledNeonBoxIcon>
            <StyledNeonBoxText>Unstyled Components</StyledNeonBoxText>
          </StyledNeonBox>

          <StyledNeonBox>
            <StyledNeonBoxIcon icon={Icons.diamonds}></StyledNeonBoxIcon>
            <StyledNeonBoxText>Design System</StyledNeonBoxText>
          </StyledNeonBox>

          <StyledNeonBox>
            <StyledNeonBoxIcon icon={Icons.tools}></StyledNeonBoxIcon>
            <StyledNeonBoxText>Utils</StyledNeonBoxText>
          </StyledNeonBox>

          <StyledNeonBox>
            <StyledNeonBoxIcon icon={Icons.setting}></StyledNeonBoxIcon>
            <StyledNeonBoxText>CDK</StyledNeonBoxText>
          </StyledNeonBox>
        </StyledNeonBoxGrid>
      </StyledHost>
    </StyledContainer>
  );
}

const StyledContainer = styled.div`
  container-type: inline-size;
`;

const StyledHost = styled.div`
  display: flex;
  gap: 96px;

  @container (max-width: 600px) {
    flex-direction: column-reverse;
    gap: 48px;
  }
`;

const StyledHeader = styled.div`
  margin-top: 18px;
  margin-bottom: 24px;
  font: var(--cck-doc-text-lg-regular);
`;

const StyledPHeader = styled.p`
  margin-top: 18px;
  margin-bottom: 24px;
  font: var(--cck-doc-text-lg-regular);
`;

const StyledPSubheader = styled.p`
  color: var(--cck-doc-color-font-3);
`;

const StyledNeonBoxGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  align-self: center;

  & > * {
    margin: -1px;
  }
`;

const StyledNeonBox = styled(NeonBox)`
  width: 124px;
  height: 124px;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  gap: 4px;
  padding: 16px;
`;

const StyledNeonBoxIcon = styled(SvgIcon)`
  width: 45px;
  height: 45px;
`;

const StyledNeonBoxText = styled.span`
  text-align: center;
  color: var(--cck-doc-color-font-3);
  font-size: 14px;
  font-family: Inter;
  font-weight: 400;
  line-height: 15px;
  word-wrap: break-word;
`;
