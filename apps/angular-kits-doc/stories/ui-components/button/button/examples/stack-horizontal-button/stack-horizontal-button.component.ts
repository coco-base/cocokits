import { Component, input } from '@angular/core';

import { ButtonComponent } from '@cocokits/angular-components';
import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/button/stack-horizontal-button.config';

@Component({
  selector: 'cck-stack-horizontal-button',
  imports: [ButtonComponent],
  template: `
    <button
      cck-button
      [type]="cckExampleArgs().firstButtonType"
      [size]="cckExampleArgs().firstButtonSize"
      [color]="cckExampleArgs().firstButtonColor">
      Cancel
    </button>

    <button
      cck-button
      [type]="cckExampleArgs().secondButtonType"
      [size]="cckExampleArgs().secondButtonSize"
      [color]="cckExampleArgs().secondButtonColor">
      Confirm
    </button>
  `,
  styles: `
    :host {
      display: flex;
      gap: 12px;
    }
  `,
})
export class StackHorizontalButtonComponent {
  public cckExampleArgs = input.required<ExampleArgs>();
}
