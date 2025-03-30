/* eslint-disable */
// (Do not edit directly)
// (Auto generated by the Cocokits 'generate-example-story-source')

import { AddonParametersSource, ThemeId } from '@cocokits/storybook-addon-theme';

export const SOURCE: AddonParametersSource[] = [
  {
    language: 'angular-ts',
    filename: 'stack-horizontal-button.component.ts',
    code: `
import { Component, input } from '@angular/core';

import { ButtonComponent } from '@cocokits/angular-components';


@Component({
  standalone: true,
  selector: 'cck-stack-horizontal-button',
  imports: [ButtonComponent],
  template: \`
    <button
      cck-button
      [type]="'<%=firstButtonType%>'"
      [size]="'<%=firstButtonSize%>'"
      [color]="'<%=firstButtonColor%>'">
      Cancel
    </button>

    <button
      cck-button
      [type]="'<%=secondButtonType%>'"
      [size]="'<%=secondButtonSize%>'"
      [color]="'<%=secondButtonColor%>'">
      Confirm
    </button>
  \`,
  styles: \`
    :host {
      display: flex;
      gap: 12px;
    }
  \`,
})
export class StackHorizontalButtonComponent {

}
`,
  },
];
