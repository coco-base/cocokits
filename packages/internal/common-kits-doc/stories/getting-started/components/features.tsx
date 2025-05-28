import React from 'react';
import { Feature } from './feature';
import { CustomizeSvg, TokenSvg, UiComponentSvg } from './feature-image';
import { styled } from 'styled-components';

export function Features() {
  return (
    <>
      <h2>What is CocoKits?</h2>
      <p>
        CocoKits is a collection of core UI components and tools designed to bridge the gap between designers and
        developers. Whether you're a designer looking to bring your designs to life without deep coding knowledge or a
        developer seeking customizable components, CocoKits streamlines your workflow.
      </p>

      <StyledFeatureWrapper>
        <Feature title="Tokens" image={TokenSvg}>
          Universal tokens and utilities to bring your design system to life and reduce maintenance costs.
        </Feature>

        <Feature title="UI Components" image={UiComponentSvg}>
          Jump start your application development with flexible and reusable components.
        </Feature>

        <Feature title="Easy-to-use and customize" image={CustomizeSvg}>
          Build and customize design system themes with enterprise-grade flexibility and control.
        </Feature>
      </StyledFeatureWrapper>
    </>
  );
}

const StyledFeatureWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  justify-content: space-around;
`;
