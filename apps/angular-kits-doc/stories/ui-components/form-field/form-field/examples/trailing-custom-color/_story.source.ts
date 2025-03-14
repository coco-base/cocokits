// (Do not edit directly)
// (Auto generated by the Cocokits 'generate-example-story-source' on Tue Mar 11 2025

import { AddonParametersSource, ThemeId } from '@cocokits/storybook-addon-theme';

export const SOURCE: AddonParametersSource[] = [
  {
    language: 'angular-ts',
    filename: 'trailing-custom-color.component.ts',
    code: `
import { Component, input } from '@angular/core';

import {
  FormFieldComponent,
  InputComponent,
  LabelComponent,
  SvgIconComponent,
  TrailingComponent,
} from '@cocokits/angular-components';
import { Icons } from '@cocokits/common-icons';


@Component({
  standalone: true,
  selector: 'cck-trailing-custom-color',
  imports: [FormFieldComponent, InputComponent, TrailingComponent, LabelComponent, SvgIconComponent],
  template: \`
    <cck-form-field>
      <cck-label>Subscribe</cck-label>
      <input cck-input [value]="'hello@cocokits.com'" />
      <cck-trailing class="custom-trailing" [clickable]="true">
        <cck-svg-icon [icon]="Icons.arrowRight" />
      </cck-trailing>
    </cck-form-field>
  \`,
  styles: \`
    .custom-trailing.cck-trailing {
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
  \`,
})
export class TrailingCustomColorComponent {

  public Icons = Icons;
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
