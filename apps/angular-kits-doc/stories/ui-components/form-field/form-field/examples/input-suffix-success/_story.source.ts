// (Do not edit directly)
// (Auto generated by the Cocokits 'generate-example-story-source' on Sat Mar 01 2025

import { AddonParametersSource, ThemeId } from '@cocokits/storybook-addon-theme';

export const SOURCE: AddonParametersSource[] = [
  {
    language: 'angular-ts',
    filename: 'input-suffix-success.component.ts',
    code: `
import { Component, computed, input, signal } from '@angular/core';

import {
  FormFieldComponent,
  HintComponent,
  InputComponent,
  LabelComponent,
  SuffixComponent,
  SvgIconComponent,
} from '@cocokits/angular-components';
import { Icons } from '@cocokits/common-icons';


@Component({
  standalone: true,
  selector: 'cck-input-suffix-success',
  imports: [FormFieldComponent, LabelComponent, InputComponent, SuffixComponent, HintComponent, SvgIconComponent],
  template: \`
    <cck-form-field>
      <cck-label>Confirm email</cck-label>
      <input cck-input placeholder="Enter hello@cocokits.com" (input)="setValue($event)" />
      @if (isValid()) {
        <cck-suffix>
          <cck-svg-icon
            [icon]="Icons.checkCircle"
            [color]="'<%=iconColor%>'"
            [size]="'<%=iconSize%>'"></cck-svg-icon>
        </cck-suffix>
      }
      <cck-hint>Enter your email address again</cck-hint>
    </cck-form-field>
  \`,
  styles: \`\`,
})
export class InputSuffixSuccessComponent {

  protected readonly Icons = Icons;
  protected value = signal('');
  protected isValid = computed(() => this.value() === 'hello@cocokits.com');

  setValue(event: Event) {
    this.value.set((event.target as HTMLInputElement).value);
  }
}
`,
  },
];
