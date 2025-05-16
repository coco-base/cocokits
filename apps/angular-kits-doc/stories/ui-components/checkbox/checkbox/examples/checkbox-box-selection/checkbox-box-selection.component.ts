import { Component, input } from '@angular/core';

import { CheckboxComponent } from '@cocokits/angular-components';
import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/checkbox/checkbox-box-selection.config';

@Component({
  standalone: true,
  selector: 'cck-checkbox-box-selection',
  imports: [CheckboxComponent],
  templateUrl: './checkbox-box-selection.component.html',
  styleUrls: ['./checkbox-box-selection.component.scss'],
})
export class CheckboxBoxSelectionComponent {
  public cckExampleArgs = input.required<ExampleArgs>();
}
