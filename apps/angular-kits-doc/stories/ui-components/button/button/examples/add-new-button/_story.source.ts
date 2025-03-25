/* eslint-disable @typescript-eslint/no-unused-vars */
// (Do not edit directly)
// (Auto generated by the Cocokits 'generate-example-story-source' on Tue Mar 25 2025

import { AddonParametersSource, ThemeId } from '@cocokits/storybook-addon-theme';

export const SOURCE: AddonParametersSource[] = [
  {
    language: 'angular-ts',
    filename: 'add-new-button.component.ts',
    code: `
import { Component, input } from '@angular/core';

import { ButtonComponent } from '@cocokits/angular-button';
import { SvgIconComponent } from '@cocokits/angular-icon';
import { Icons } from '@cocokits/common-icons';


@Component({
  standalone: true,
  selector: 'cck-add-new-button',
  imports: [ButtonComponent, SvgIconComponent],
  template: \`
    <button
      cck-button
      [type]="'<%=buttonType%>'"
      [color]="'<%=buttonColor%>'"
      [size]="'<%=buttonSize%>'">
      <span>Add New</span>
      <cck-svg-icon [icon]="Icons.plus"></cck-svg-icon>
    </button>
  \`,
  styles: \`\`,
})
export class AddNewButtonComponent {

  public readonly Icons = Icons;
}
`,
  },
];
