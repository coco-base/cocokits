/* eslint-disable @typescript-eslint/no-unused-vars */
// (Do not edit directly)
// (Auto generated by the Cocokits 'generate-example-story-source' on Tue Mar 25 2025

import { AddonParametersSource, ThemeId } from '@cocokits/storybook-addon-theme';

export const SOURCE: AddonParametersSource[] = [
  {
    language: 'tsx',
    filename: 'SelectPreviewTag.styled.tsx',
    code: `
import styled from "styled-components";

import { Select as CckSelect, SelectPreview as CckSelectPreview } from "@cocokits/react-components";

const Select = styled(CckSelect<string>)\`
  min-width: 190px;
\`;

const SelectPreview = styled(CckSelectPreview)\`
  display: flex;
  gap: 8px;
\`;

const Tag = styled.div\`
  border-radius: 50%;
  border: 1px solid var(--tag-border);
  pad: 2px;
  width: 24px;
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--tag-bg);
  font: var(--tag-font);
  color: var(--tag-color);
\`;

const HintText = styled.div\`
  color: var(--hint-color);
\`;

export const Styled = {
  Select,
  SelectPreview,
  Tag,
  HintText
};

`,
  },
  {
    language: 'tsx',
    filename: 'SelectPreviewTag.tsx',
    code: `

import { FormField, Label, Option } from '@cocokits/react-components';

import { Styled } from './SelectPreviewTag.styled';

export function SelectPreviewTag() {
  return (
    <FormField>
      <Label>Favorite food</Label>
      <Styled.Select
        value={['Cake', 'Pizza']}
        multiple={true}
        selectPreview={(selected) => (
          <Styled.SelectPreview>
            <Styled.Tag>{selected.length}</Styled.Tag>
            <span>{selected[0]}</span>
            {  selected.length > 1 && <Styled.HintText> (+{selected.length - 1} more)</Styled.HintText> }
          </Styled.SelectPreview>
        )}
      >
        <Option value="Cake">Cake</Option>
        <Option value="Pizza">Pizza</Option>
        <Option value="Burger">Burger</Option>
        <Option value="Steak">Steak</Option>
      </Styled.Select>
    </FormField>
  );
}
`,
  },
  {
    language: 'scss',
    filename: 'global.scss',
    code: `
      :root {--tag-bg: var(--color-h-contrast-alpha-4);
        --tag-border: var(--color-border-default);
        --tag-font: var(--text-xs-regular);
        --tag-color: var(--color-font-alpha-7);
        --hint-color: var(--color-font-alpha-7);
      }`,
    visibleConditions: [(theme) => theme.id === ThemeId.CocoKits],
  },
  {
    language: 'scss',
    filename: 'global.scss',
    code: `
      :root {--tag-bg: var(--base-surface-2);
        --tag-border: var(--base-border);
        --tag-font: var(--text-xs-font-medium);
        --tag-color: var(--text-dark-primary);
        --hint-color: var(--text-dark-tertiary);
      }`,
    visibleConditions: [(theme) => theme.id === ThemeId.FramesX],
  },
];
