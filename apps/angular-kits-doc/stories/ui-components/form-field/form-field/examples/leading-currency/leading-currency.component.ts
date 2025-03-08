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
import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/form-field/leading-currency.config';

@Component({
  standalone: true,
  selector: 'cck-leading-currency',
  imports: [FormFieldComponent, InputComponent, LeadingComponent, LabelComponent, SvgIconComponent],
  template: `
    <cck-form-field>
      <cck-label>Select currency</cck-label>
      <cck-leading>
        <cck-svg-icon icon="{{ Icons.dollarMoney }}"></cck-svg-icon>
      </cck-leading>
      <input cck-input (change)="onChange($event)" (focus)="onFocus()" (blur)="onBlur()" [value]="value()" />
    </cck-form-field>
  `,
  styles: ``,
})
export class LeadingCurrencyComponent {
  public cckExampleArgs = input.required<ExampleArgs>();

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
