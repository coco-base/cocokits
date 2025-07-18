/* eslint-disable */
// (Do not edit directly)
// (Auto generated by the Cocokits 'generate-example-story-source')

import { AddonParametersSource, ThemeId } from '@cocokits/storybook-addon-theme';

export const SOURCE: AddonParametersSource[] = [
  {
    language: 'angular-ts',
    filename: 'back-button.component.ts',
    code: `
import { Component, input } from '@angular/core';

import { ButtonComponent, SvgIconComponent } from '@cocokits/angular-components';
import { Icons } from '@cocokits/common-icons';


@Component({
  selector: 'cck-back-button',
  imports: [ButtonComponent, SvgIconComponent],
  template: \`
    <button cck-button>
      <cck-svg-icon [icon]="Icons.arrowLeft" />
      <span>Back</span>
    </button>
  \`,
})
export class BackButtonComponent {

  public readonly Icons = Icons;
}
`,
  },
];
