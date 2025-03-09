import { Component, input } from '@angular/core';

import { ButtonComponent, SvgIconComponent } from '@cocokits/angular-components';
import { Icons } from '@cocokits/common-icons';
import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/button/copy-link-button.config';

@Component({
  standalone: true,
  selector: 'cck-copy-link-button',
  imports: [ButtonComponent, SvgIconComponent],
  template: `
    <button cck-button [type]="cckExampleArgs().buttonType">
      <cck-svg-icon [icon]="Icons.link" />
      <span>Copy Link</span>
    </button>
  `,
})
export class CopyLinkButtonComponent {
  public cckExampleArgs = input.required<ExampleArgs>();
  public readonly Icons = Icons;
}
