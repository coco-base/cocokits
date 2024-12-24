import { PreparedStory } from '@storybook/types';
import { useState } from 'react';
import styled, { css } from 'styled-components';

import { ElementAnchorPoint } from '@cocokits/common-utils';
import { Delay } from '@cocokits/react-cdk';
import { FormField, Option, Select, SelectPreview } from '@cocokits/react-form-field';

import { useSourceCodeGenerator } from './use-source-code-generator';

interface StorySourceCodeProps {
  story: PreparedStory;
}

export function StorySourceCode({ story }: StorySourceCodeProps) {
  const [selectedSourceIndex, setSelectedSourceIndex] = useState<number>(0);
  const {loading, sourceCodes} = useSourceCodeGenerator(story);

  if (loading && sourceCodes.length === 0) {
    return (
      <StyledHost $placeholder={true}>
        <StyledLoader />
        <p>Generating source code</p>
      </StyledHost>
    );
  }

  if (sourceCodes.length === 0) {
    return (
      <StyledHost $placeholder={true}>
        <p>No source code available for this component!</p>
      </StyledHost>
    );
  }

  const selectedSource = sourceCodes[selectedSourceIndex];


  const CustomPreview = () => (
    <SelectPreview>
      <StyleSelectPreviewText>{sourceCodes.length} Files</StyleSelectPreviewText>
    </SelectPreview>
  );

  const onChange = ([index]: number[]) => {
    setSelectedSourceIndex(index);
  };

  return (
    <StyledHost>

      <StyledHeader>
        <StyledFilename>
          {selectedSource.fileName}
          { loading && <Delay time={100}><StyledLoader /></Delay> }
        </StyledFilename>
        
        {sourceCodes.length > 1 && (
          <FormField>
            <Select
              anchorPoint={ElementAnchorPoint.BottomRight}
              selectPreview={CustomPreview}
              value={selectedSourceIndex}
              onChange={onChange}>
              {sourceCodes.map((sourceCode, index) => (
                <Option key={index} value={index}>
                  {sourceCode.fileName}
                </Option>
              ))}
            </Select>
          </FormField>
        )}
      </StyledHeader>

      <StyledCode dangerouslySetInnerHTML={{ __html: selectedSource?.html }} />
    </StyledHost>
  );
}

const StyledHost = styled.div<{ $placeholder?: boolean }>`
  min-height: 100px;
  margin: 8px;
  background-color: var(--cck-doc-color-bg-3);
  border-radius: var(--cck-doc-radius-md);

  ${(props) =>
    props.$placeholder &&
    css`
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 12px;

      & p {
        margin: 0;
      }
    `}
`;

const StyledHeader = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px 8px 8px 20px;
  border-bottom: 1px solid var(--cck-doc-color-border-2);
`;

const StyledFilename = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font: var(--cck-doc-text-sm-medium);
  color: var(--cck-doc-color-font-3);
`;

const StyleSelectPreviewText = styled.span`
  font: var(--cck-doc-text-sm-medium);
  color: var(--cck-doc-color-font-3);
`;


const StyledCode = styled.div`
  position: relative;
  padding: 20px 20px;

  & pre {
    margin: 0;
    background-color: transparent !important;
  }

  & code {
    background-color: transparent;
    border: none;
    padding: 0;
  }
`;

const StyledLoader = styled.div`
  width: 20px;
  height: 20px;
  position: relative;
  border-radius: 50%;
  display: inline-block;
  background: linear-gradient(0deg, var(--cck-doc-color-bg-3) 33%, var(--cck-doc-color-brand-default) 100%);
  box-sizing: border-box;
  animation: rotation 1s linear infinite;

  &::after {
    content: '';  
    box-sizing: border-box;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--cck-doc-color-bg-3);
  }

  @keyframes rotation {
    0% { transform: rotate(0deg) }
    100% { transform: rotate(360deg) }
  }
`;