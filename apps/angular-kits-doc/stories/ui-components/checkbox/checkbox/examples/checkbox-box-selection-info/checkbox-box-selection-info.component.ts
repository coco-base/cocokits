import { Component, input } from '@angular/core';

import { CheckboxComponent, SvgIconComponent } from '@cocokits/angular-components';
import { Icons } from '@cocokits/common-icons';
import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/checkbox/checkbox-box-selection-info.config';

@Component({
  selector: 'cck-checkbox-box-selection-info',
  imports: [CheckboxComponent, SvgIconComponent],
  templateUrl: './checkbox-box-selection-info.component.html',
  styleUrls: ['./checkbox-box-selection-info.component.scss'],
})
export class CheckboxBoxSelectionInfoComponent {
  public cckExampleArgs = input.required<ExampleArgs>();
  public readonly Icons = Icons;
}
