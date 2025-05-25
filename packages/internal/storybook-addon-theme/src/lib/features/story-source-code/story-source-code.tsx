import { PreparedStory } from '@storybook/types';
import { forwardRef, useEffect, useState } from 'react';
import styled, { css } from 'styled-components';

import { Icons } from '@cocokits/common-icons';
import { ElementAnchorPoint } from '@cocokits/common-utils';
import { Button } from '@cocokits/react-button';
import { FormField, Option, Select, SelectPreview } from '@cocokits/react-form-field';
import { SvgIcon } from '@cocokits/react-icon';

import { useSourceCodeGenerator } from './use-source-code-generator';
import { StyledLoader } from '../../utils/common-elements';

interface StorySourceCodeProps {
  story: PreparedStory;
  pause?: boolean;
  className?: string;
}

export const StorySourceCode = forwardRef<HTMLDivElement, StorySourceCodeProps>(({ story, pause, className }, ref) => {
  const [hasCopied, setHasCopied] = useState(false);
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

  if (isMobile) {
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

  const onCopyClick = () => {
    navigator.clipboard.writeText(selectedSource.code);

    if (!hasCopied) {
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 3000);
    }
  };

  return (
    <StyledHost className={className} ref={ref}>
      <StyledHeader>
        <StyledFilename>{selectedSource.fileName}</StyledFilename>

        <StyledCopyButton onClick={onCopyClick}>
          {hasCopied && 'Copied!'}
          {!hasCopied && (
            <>
              <SvgIcon icon={Icons.copy} />
              Copy
            </>
          )}
        </StyledCopyButton>

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

const StyledCopyButton = styled(Button)`
  margin-left: auto;
  margin-right: 8px;
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
  font-size: 14px;
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
