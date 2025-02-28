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
import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/form-field/input-suffix-success.config';

@Component({
  standalone: true,
  selector: 'cck-input-suffix-success',
  imports: [FormFieldComponent, LabelComponent, InputComponent, SuffixComponent, HintComponent, SvgIconComponent],
  template: `
    <cck-form-field>
      <cck-label>Confirm email</cck-label>
      <input cck-input placeholder="Enter hello@cocokits.com" (input)="setValue($event)" />
      @if (isValid()) {
        <cck-suffix>
          <cck-svg-icon
            [icon]="Icons.checkCircle"
            [color]="cckExampleArgs().iconColor"
            [size]="cckExampleArgs().iconSize"></cck-svg-icon>
        </cck-suffix>
      }
      <cck-hint>Enter your email address again</cck-hint>
    </cck-form-field>
  `,
  styles: ``,
})
export class InputSuffixSuccessComponent {
  public cckExampleArgs = input.required<ExampleArgs>();
  protected readonly Icons = Icons;
  protected value = signal('');
  protected isValid = computed(() => this.value() === 'hello@cocokits.com');

  setValue(event: Event) {
    this.value.set((event.target as HTMLInputElement).value);
  }
}
