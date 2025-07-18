/* eslint-disable */
// (Do not edit directly)
// (Auto generated by the Cocokits 'generate-example-story-source')

import { AddonParametersSource, ThemeId } from '@cocokits/storybook-addon-theme';

export const SOURCE: AddonParametersSource[] = [
  {
    language: 'angular-ts',
    filename: 'copy-link-button.component.ts',
    code: `
import { Component, input } from '@angular/core';

import { ButtonComponent, SvgIconComponent } from '@cocokits/angular-components';
import { Icons } from '@cocokits/common-icons';


@Component({
  selector: 'cck-copy-link-button',
  imports: [ButtonComponent, SvgIconComponent],
  template: \`
    <button cck-button [type]="'<%=buttonType%>'">
      <cck-svg-icon [icon]="Icons.link" />
      <span>Copy Link</span>
    </button>
  \`,
})
export class CopyLinkButtonComponent {

  public readonly Icons = Icons;
}
`,
  },
];
