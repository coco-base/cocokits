import { Component, input } from '@angular/core';

import { ButtonComponent, SvgIconComponent } from '@cocokits/angular-components';
import { Icons } from '@cocokits/common-icons';
import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/button/stack-vertical-button.config';

@Component({
  standalone: true,
  selector: 'cck-stack-vertical-button',
  imports: [ButtonComponent, SvgIconComponent],
  template: `
    <button
      cck-button
      [type]="cckExampleArgs().firstButtonType"
      [size]="cckExampleArgs().firstButtonSize"
      [color]="cckExampleArgs().firstButtonColor">
      Skip
    </button>

    <button
      cck-button
      [type]="cckExampleArgs().secondButtonType"
      [size]="cckExampleArgs().secondButtonSize"
      [color]="cckExampleArgs().secondButtonColor">
      Confirm
      <cck-svg-icon [icon]="Icons.arrowRight" />
    </button>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      width: 150px;
      gap: 12px;
    }
  `,
})
export class StackVerticalButtonComponent {
  public cckExampleArgs = input.required<ExampleArgs>();
  public Icons = Icons;
}
