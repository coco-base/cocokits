// (Do not edit directly)
// (Auto generated by the Cocokits 'generate-example-story-source' on Sun Mar 09 2025

import { AddonParametersSource, ThemeId } from '@cocokits/storybook-addon-theme';

export const SOURCE: AddonParametersSource[] = [
  {
    language: 'angular-ts',
    filename: 'leading-currency.component.ts',
    code: `
import { Component, input, signal } from '@angular/core';

import {
  FormFieldComponent,
  InputComponent,
  LabelComponent,
  LeadingComponent,
  removeAmountFormat,
  SvgIconComponent,
  toAmountFormat,
} from '@cocokits/angular-components';
import { Icons } from '@cocokits/common-icons';


@Component({
  standalone: true,
  selector: 'cck-leading-currency',
  imports: [FormFieldComponent, InputComponent, LeadingComponent, LabelComponent, SvgIconComponent],
  template: \`
    <cck-form-field>
      <cck-label>Select currency</cck-label>
      <cck-leading>
        <cck-svg-icon icon="{{ Icons.dollarMoney }}"></cck-svg-icon>
      </cck-leading>
      <input cck-input (change)="onChange($event)" (focus)="onFocus()" (blur)="onBlur()" [value]="value()" />
    </cck-form-field>
  \`,
  styles: \`\`,
})
export class LeadingCurrencyComponent {


  protected readonly Icons = Icons;
  protected value = signal('');

  protected onChange(event: Event) {
    this.value.set((event.currentTarget as HTMLInputElement).value);
  }

  protected onFocus() {
    this.value.set(removeAmountFormat(this.value()));
  }

  protected onBlur() {
    this.value.set(toAmountFormat(this.value()));
  }
}
`,
  },
];
