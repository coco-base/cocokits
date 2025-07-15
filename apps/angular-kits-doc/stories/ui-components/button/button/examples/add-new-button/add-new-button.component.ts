import { Component, input } from '@angular/core';

import { ButtonComponent } from '@cocokits/angular-button';
import { SvgIconComponent } from '@cocokits/angular-icon';
import { Icons } from '@cocokits/common-icons';
import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/button/add-new-button.config';

@Component({
  selector: 'cck-add-new-button',
  imports: [ButtonComponent, SvgIconComponent],
  template: `
    <button
      cck-button
      [type]="cckExampleArgs().buttonType"
      [color]="cckExampleArgs().buttonColor"
      [size]="cckExampleArgs().buttonSize">
      <span>Add New</span>
      <cck-svg-icon [icon]="Icons.plus"></cck-svg-icon>
    </button>
  `,
  styles: ``,
})
export class AddNewButtonComponent {
  public cckExampleArgs = input.required<ExampleArgs>();
  public readonly Icons = Icons;
}
