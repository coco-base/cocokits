// (Do not edit directly)
// (Auto generated by the Cocokits 'generate-example-story-source' on Wed Mar 12 2025

import { AddonParametersSource, ThemeId } from '@cocokits/storybook-addon-theme';

export const SOURCE: AddonParametersSource[] = [
  {
    language: 'tsx',
    filename: 'TrailingCustomColor.styled.tsx',
    code: `
import styled from "styled-components";

import { Trailing } from "@cocokits/react-components";

const _Trailing = styled(Trailing)\`

  &.cck-trailing {
    background-color: var(--trailing-bg);
  
    &:hover:not(:active) {
      background-color: var(--trailing-bg-hover);
    }
  
    &:active {
      background-color: var(--trailing-bg-active);
    }
  
    .cck-svg-icon .cck-svg-icon__svg {
      fill: var(--trailing-color);
    }
  }
\`;

export const Styled = {
  Trailing: _Trailing,
};`,
  },
  {
    language: 'tsx',
    filename: 'TrailingCustomColor.tsx',
    code: `
import { Icons } from '@cocokits/common-icons';

import { FormField, Input, Label, SvgIcon } from '@cocokits/react-components';

import { Styled } from './TrailingCustomColor.styled';

export function TrailingCustomColor() {
  return (
    <FormField>
      <Label>Subscribe</Label>
      <Input defaultValue="hello@cocokits.com"/>
      <Styled.Trailing clickable>
        <SvgIcon icon={Icons.arrowRight}/>
      </Styled.Trailing>
    </FormField>
  );
}
`,
  },
  {
    language: 'scss',
    filename: 'global.scss',
    code: `
      :root {--trailing-bg: var(--color-brand-default);
        --trailing-bg-hover: var(--color-brand-default);
        --trailing-bg-active: var(--color-brand-default);
        --trailing-color: var(--color-font-inverse-default);
      }`,
    visibleConditions: [(theme) => theme.id === ThemeId.CocoKits],
  },
  {
    language: 'scss',
    filename: 'global.scss',
    code: `
      :root {--trailing-bg: var(--state-brand-active);
        --trailing-bg-hover: var(--state-brand-hover);
        --trailing-bg-active: var(--state-brand-selected);
        --trailing-color: var(--text-light-primary);
      }`,
    visibleConditions: [(theme) => theme.id === ThemeId.FramesX],
  },
];
