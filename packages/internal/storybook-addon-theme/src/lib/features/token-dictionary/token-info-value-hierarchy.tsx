import React from 'react';
import styled, { css } from 'styled-components';

import { Icons } from "@cocokits/common-icons";
import { IconButton } from '@cocokits/react-button';
import { SvgIcon } from '@cocokits/react-icon';

import { TokenDictionaryValueHierarchy } from './token-dictionary.model';
import { TokenArrowDownIcon } from './token-dictionary-icons';
import { TokenDictionaryValue } from './token-dictionary-value';

export interface TokenInfoValueHierarchyProps {
  hierarchiesModes: TokenDictionaryValueHierarchy[][];
  selectedIndex: number;
  onNextClick: () => void;
  onPrevClick: () => void;
}

export function TokenInfoValueHierarchy({
  hierarchiesModes,
  selectedIndex,
  onNextClick,
  onPrevClick,
}: TokenInfoValueHierarchyProps) {
  const maxIndex = hierarchiesModes.length - 1;
  const minIndex = 0;

  return (
    <StylesHost>
      {/* Slider */}
      <StylesSliderGroup $selectedIndex={selectedIndex}>
        {hierarchiesModes.map((hierarchies, i) => (
          <StylesSlider key={i}>
            {hierarchies.map((hierarchy, index) => (
              <React.Fragment key={index}>
                <TokenDictionaryValue {...hierarchy}></TokenDictionaryValue>
                {index !== hierarchies.length - 1 && <TokenArrowDownIcon />}
              </React.Fragment>
            ))}
          </StylesSlider>
        ))}
      </StylesSliderGroup>

      {/* Indicator */}
      <StyledIndicatorWrapper>
        {
          hierarchiesModes.map((_, index) => (
            <StyledIndicator key={index} $selected={index === selectedIndex}/>
          ))
        }
      </StyledIndicatorWrapper>

      {/* Prev Button */}
      {selectedIndex > minIndex && (
        <StyleNextIcon $position="left" onClick={onPrevClick}>
          <IconButton type="outline">
            <SvgIcon icon={Icons.arrowHeadLeft} />
          </IconButton>
        </StyleNextIcon>
      )}

      {/* Next Button */}
      {selectedIndex < maxIndex && (
        <StyleNextIcon $position="right" onClick={onNextClick}>
          <IconButton type="outline">
            <SvgIcon icon={Icons.arrowHeadRight} />
          </IconButton>
        </StyleNextIcon>
      )}
    </StylesHost>
  );
}

const StylesHost = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 24px;
  overflow: hidden;
  position: relative;
`;

const StyledIndicatorWrapper = styled.div`
  display: flex;
  gap: 8px;
`;

const StyledIndicator = styled.div<{ $selected: boolean }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${({ $selected }) => ($selected ? 'var(--cck-doc-color-brand-default)' : 'var(--cck-doc-color-bg-5)')};
`;

const StylesSliderGroup = styled.div<{ $selectedIndex: number }>`
  width: 100%;
  display: flex;
  transition: transform 300ms;

  transform: ${({ $selectedIndex }) => `translateX(-${$selectedIndex}00%)`};
`;

const StylesSlider = styled.div`
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 6px;
  margin: 12px 44px; // Left and right margins for spacing between navigation buttons
  width: calc(100% - 88px);
  height: calc(100% - 24px);
`;

const StyleNextIcon = styled(IconButton)<{ $position: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);

  ${(props) =>
    props.$position === 'left' &&
    css`
      left: 0px;
    `}

  ${(props) =>
    props.$position === 'right' &&
    css`
      right: 0px;
    `}
`;
