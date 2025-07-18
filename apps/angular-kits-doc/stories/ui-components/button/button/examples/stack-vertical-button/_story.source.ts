/* eslint-disable */
// (Do not edit directly)
// (Auto generated by the Cocokits 'generate-example-story-source')

import { AddonParametersSource, ThemeId } from '@cocokits/storybook-addon-theme';

export const SOURCE: AddonParametersSource[] = [
  {
    language: 'angular-ts',
    filename: 'stack-vertical-button.component.ts',
    code: `
import { Component, input } from '@angular/core';

import { ButtonComponent, SvgIconComponent } from '@cocokits/angular-components';
import { Icons } from '@cocokits/common-icons';


@Component({
  selector: 'cck-stack-vertical-button',
  imports: [ButtonComponent, SvgIconComponent],
  template: \`
    <button
      cck-button
      [type]="'<%=firstButtonType%>'"
      [size]="'<%=firstButtonSize%>'"
      [color]="'<%=firstButtonColor%>'">
      Skip
    </button>

    <button
      cck-button
      [type]="'<%=secondButtonType%>'"
      [size]="'<%=secondButtonSize%>'"
      [color]="'<%=secondButtonColor%>'">
      Confirm
      <cck-svg-icon [icon]="Icons.arrowRight" />
    </button>
  \`,
  styles: \`
    :host {
      display: flex;
      flex-direction: column;
      width: 150px;
      gap: 12px;
    }
  \`,
})
export class StackVerticalButtonComponent {

  public Icons = Icons;
}
`,
  },
];
