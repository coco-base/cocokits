import { Component, input } from '@angular/core';

import { ButtonComponent, SvgIconComponent } from '@cocokits/angular-components';
import { Icons } from '@cocokits/common-icons';
import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/button/back-button.config';

@Component({
  selector: 'cck-back-button',
  imports: [ButtonComponent, SvgIconComponent],
  template: `
    <button cck-button>
      <cck-svg-icon [icon]="Icons.arrowLeft" />
      <span>Back</span>
    </button>
  `,
})
export class BackButtonComponent {
  public cckExampleArgs = input.required<ExampleArgs>();
  public readonly Icons = Icons;
}
