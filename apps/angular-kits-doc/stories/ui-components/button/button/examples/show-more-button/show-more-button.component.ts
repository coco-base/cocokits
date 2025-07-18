import { Component, input } from '@angular/core';

import { ButtonComponent, SvgIconComponent } from '@cocokits/angular-components';
import { Icons } from '@cocokits/common-icons';
import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/button/show-more-button.config';

@Component({
  selector: 'cck-show-more-button',
  imports: [ButtonComponent, SvgIconComponent],
  template: `
    <button cck-button [type]="cckExampleArgs().buttonType" [color]="cckExampleArgs().buttonColor">
      <span>Show More</span>
      <cck-svg-icon [icon]="Icons.arrowHeadDown"></cck-svg-icon>
    </button>
  `,
  styles: ``,
})
export class ShowMoreButtonComponent {
  public cckExampleArgs = input.required<ExampleArgs>();
  public readonly Icons = Icons;
}
