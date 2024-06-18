import React from 'react';
import styled from 'styled-components';

import { DocBgEffect } from './DocBgEffect';
import { DocHeader } from './DocHeader';
import { DocMain } from './DocMain';


export const DocPage = () => {

  return (
    // sb-unstyled: Remove default storybook styles
    <StyledWrapper className="sb-unstyled">
      <DocBgEffect></DocBgEffect>
      <DocHeader></DocHeader>
      <DocMain></DocMain>
    </StyledWrapper>
  );
};

// region ---------------- STYLES ----------------
const StyledWrapper = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
`;
// endregion