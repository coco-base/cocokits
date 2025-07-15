import { Component, input } from '@angular/core';

import { ButtonComponent, SvgIconComponent } from '@cocokits/angular-components';
import { OutlineIcons } from '@cocokits/common-icons';
import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/button/delete-button.config';

@Component({
  selector: 'cck-delete-button',
  imports: [ButtonComponent, SvgIconComponent],
  template: `
    <button cck-button [type]="cckExampleArgs().buttonType" [color]="cckExampleArgs().buttonColor">
      <cck-svg-icon [icon]="OutlineIcons.trash" />
      <span>Delete</span>
    </button>
  `,
})
export class DeleteButtonComponent {
  public cckExampleArgs = input.required<ExampleArgs>();
  public readonly OutlineIcons = OutlineIcons;
}
