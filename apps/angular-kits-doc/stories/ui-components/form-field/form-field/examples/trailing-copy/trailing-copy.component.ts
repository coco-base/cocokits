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
import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/form-field/trailing-copy.config';

@Component({
  selector: 'cck-trailing-copy',
  imports: [FormFieldComponent, InputComponent, TrailingComponent, LabelComponent, SvgIconComponent, HintComponent],
  template: `
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
  `,
  styles: ``,
})
export class TrailingCopyComponent {
  public cckExampleArgs = input.required<ExampleArgs>();
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
