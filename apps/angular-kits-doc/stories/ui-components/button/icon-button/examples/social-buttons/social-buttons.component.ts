import { Component, input } from '@angular/core';

import { IconButtonComponent } from '@cocokits/angular-button';
import { SvgIconComponent } from '@cocokits/angular-icon';
import { Icons } from '@cocokits/common-icons';
import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/icon-button/social-buttons.config';

@Component({
  standalone: true,
  selector: 'cck-social-buttons',
  imports: [IconButtonComponent, SvgIconComponent],
  template: `
    <button
      cck-icon-button
      [color]="cckExampleArgs().color"
      [type]="cckExampleArgs().type"
      [size]="cckExampleArgs().size">
      <cck-svg-icon [icon]="Icons.x" [size]="cckExampleArgs().iconSize" />
    </button>

    <button
      cck-icon-button
      [color]="cckExampleArgs().color"
      [type]="cckExampleArgs().type"
      [size]="cckExampleArgs().size">
      <cck-svg-icon [icon]="Icons.github" [size]="cckExampleArgs().iconSize" />
    </button>

    <button
      cck-icon-button
      [color]="cckExampleArgs().color"
      [type]="cckExampleArgs().type"
      [size]="cckExampleArgs().size">
      <cck-svg-icon [icon]="Icons.instagram" [size]="cckExampleArgs().iconSize" />
    </button>
  `,
  styles: `
    :host {
      display: flex;
      gap: 8px;
    }
  `,
})
export class SocialButtonsComponent {
  public cckExampleArgs = input.required<ExampleArgs>();
  protected readonly Icons = Icons;
}
