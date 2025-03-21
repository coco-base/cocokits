import { Component, input } from '@angular/core';

import { CheckboxComponent } from '@cocokits/angular-checkbox';
import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/checkbox/checkbox-label-through.config';

@Component({
  standalone: true,
  selector: 'cck-checkbox-label-through',
  imports: [CheckboxComponent],
  template: `
    <cck-checkbox [size]="cckExampleArgs().size" [value]="1"
      ><span class="striked-label"> Checkbox Label </span></cck-checkbox
    >
  `,
  styles: `
    .striked-label {
      text-decoration: line-through;
    }
  `,
})
export class CheckboxLabelThroughComponent {
  public cckExampleArgs = input.required<ExampleArgs>();
}
