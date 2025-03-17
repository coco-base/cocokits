// (Do not edit directly)
// (Auto generated by the Cocokits 'generate-example-story-source' on Tue Mar 11 2025

import { AddonParametersSource, ThemeId } from '@cocokits/storybook-addon-theme';

export const SOURCE: AddonParametersSource[] = [
  {
    language: 'angular-ts',
    filename: 'delete-button.component.ts',
    code: `
import { Component, input } from '@angular/core';

import { ButtonComponent, SvgIconComponent } from '@cocokits/angular-components';
import { Icons, OutlineIcons } from '@cocokits/common-icons';


@Component({
  standalone: true,
  selector: 'cck-delete-button',
  imports: [ButtonComponent, SvgIconComponent],
  template: \`
    <button cck-button [type]="'<%=buttonType%>'" [color]="'<%=buttonColor%>'">
      <cck-svg-icon [icon]="OutlineIcons.trash" />
      <span>Delete</span>
    </button>
  \`,
})
export class DeleteButtonComponent {

  public readonly OutlineIcons = OutlineIcons;
}
`,
  },
];
