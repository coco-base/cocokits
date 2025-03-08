import { Component, computed, input, signal } from '@angular/core';

import { IconButtonComponent, SvgIconComponent } from '@cocokits/angular-components';
import { Icons } from '@cocokits/common-icons';
import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/icon-button/mode-toggle.config';

@Component({
  standalone: true,
  selector: 'cck-mode-toggle',
  imports: [IconButtonComponent, SvgIconComponent],
  template: ` <button
    cck-icon-button
    [color]="cckExampleArgs().color"
    [type]="cckExampleArgs().type"
    [size]="cckExampleArgs().size"
    (click)="isDark.set(!isDark())">
    <cck-svg-icon [icon]="icon()" [size]="cckExampleArgs().iconSize" />
  </button>`,
  styles: ``,
})
export class ModeToggleComponent {
  public cckExampleArgs = input.required<ExampleArgs>();

  protected isDark = signal(false);
  protected icon = computed(() => (this.isDark() ? Icons.light : Icons.dark));
  protected readonly Icons = Icons;
}
