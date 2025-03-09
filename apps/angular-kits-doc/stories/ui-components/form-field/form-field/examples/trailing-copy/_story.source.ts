// (Do not edit directly)
// (Auto generated by the Cocokits 'generate-example-story-source' on Sun Mar 09 2025

import { AddonParametersSource, ThemeId } from '@cocokits/storybook-addon-theme';

export const SOURCE: AddonParametersSource[] = [
  {
    language: 'angular-ts',
    filename: 'trailing-copy.component.ts',
    code: `
import { Component, input, signal } from '@angular/core';

import {
  FormFieldComponent,
  HintComponent,
  InputComponent,
  LabelComponent,
  SvgIconComponent,
  TrailingComponent,
} from '@cocokits/angular-components';
import { Icons } from '@cocokits/common-icons';


@Component({
  standalone: true,
  selector: 'cck-trailing-copy',
  imports: [FormFieldComponent, InputComponent, TrailingComponent, LabelComponent, SvgIconComponent, HintComponent],
  template: \`
    <cck-form-field>
      <cck-label>Copy text</cck-label>
      <input value="cocokits.com" cck-input />
      <cck-trailing [clickable]="true" (click)="onCopyClick()">
        <cck-svg-icon [icon]="Icons.copy" />
      </cck-trailing>

      @if (showHint()) {
        <cck-hint>Copied</cck-hint>
      }
    </cck-form-field>
  \`,
  styles: \`\`,
})
export class TrailingCopyComponent {

  public Icons = Icons;

  private setTimeoutId!: NodeJS.Timeout;
  protected showHint = signal(false);

  onCopyClick() {
    clearTimeout(this.setTimeoutId);
    this.showHint.set(true);

    this.setTimeoutId = setTimeout(() => {
      this.showHint.set(false);
    }, 3000);
  }
}
`,
  },
];
