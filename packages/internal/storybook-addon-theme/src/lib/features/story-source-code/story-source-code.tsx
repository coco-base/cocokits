import { PreparedStory } from '@storybook/types';
import { forwardRef, useEffect, useState } from 'react';
import styled, { css } from 'styled-components';

import { ElementAnchorPoint } from '@cocokits/common-utils';
import { Delay } from '@cocokits/react-cdk';
import { FormField, Option, Select, SelectPreview } from '@cocokits/react-form-field';

import { useSourceCodeGenerator } from './use-source-code-generator';
import { StyledLoader } from '../../utils/common-elements';

interface StorySourceCodeProps {
  story: PreparedStory;
  pause?: boolean;
  className?: string;
}

export const StorySourceCode = forwardRef<HTMLDivElement, StorySourceCodeProps>(({ story, pause, className }, ref) => {

  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);
  const [selectedSourceIndex, setSelectedSourceIndex] = useState<number>(0);
  const { loading, sourceCodes } = useSourceCodeGenerator(story, pause || isMobile);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 600);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if(isMobile)  {
    return (
      <StyledHost className={className} $placeholder={true} ref={ref}>
        <p>Please switch to a larger device to see the source code</p>
      </StyledHost>
    );
  }

  if (loading) {
    return (
      <StyledHost className={className} $placeholder={true} ref={ref}>
        <StyledLoader />
        <p>Generating source code</p>
      </StyledHost>
    );
  }

  if (sourceCodes.length === 0) {
    return (
      <StyledHost className={className} $placeholder={true} ref={ref}>
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
    <StyledHost className={className} ref={ref}>
      <StyledHeader>
        <StyledFilename>
          {selectedSource.fileName}
          {loading && (
            <Delay time={100}>
              <StyledLoader />
            </Delay>
          )}
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
});

const StyledHost = styled.div<{ $placeholder?: boolean }>`
  display: flex;
  flex-direction: column;
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
      padding: 24px;
      text-align: center;

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
  overflow: auto;
  flex: 1;
  margin-right: 4px;
  scrollbar-color: var(--cck-doc-color-bg-5) var(--cck-doc-color-bg-3);

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