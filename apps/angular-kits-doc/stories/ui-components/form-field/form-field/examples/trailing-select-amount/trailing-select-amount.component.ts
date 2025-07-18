import { Component, input, signal } from '@angular/core';

import {
  FormFieldComponent,
  InputComponent,
  LabelComponent,
  OptionComponent,
  removeAmountFormat,
  SelectComponent,
  toAmountFormat,
  TrailingComponent,
} from '@cocokits/angular-components';
import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/form-field/trailing-select-amount.config';

@Component({
  selector: 'cck-trailing-select-amount',
  imports: [FormFieldComponent, InputComponent, TrailingComponent, LabelComponent, SelectComponent, OptionComponent],
  template: `
    <cck-form-field>
      <cck-label>Select amount</cck-label>
      <input cck-input (change)="onChange($event)" (focus)="onFocus()" (blur)="onBlur()" [value]="value()" />
      <cck-trailing>
        <cck-select value="USD" appendTo="body">
          <cck-option value="USD">USD</cck-option>
          <cck-option value="EUR">EUR</cck-option>
          <cck-option value="JPY">JPY</cck-option>
          <cck-option value="CNY">CNY</cck-option>
          <cck-option value="KRW">KRW</cck-option>
        </cck-select>
      </cck-trailing>
    </cck-form-field>
  `,
  styles: ``,
})
export class TrailingSelectAmountComponent {
  public cckExampleArgs = input.required<ExampleArgs>();
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
