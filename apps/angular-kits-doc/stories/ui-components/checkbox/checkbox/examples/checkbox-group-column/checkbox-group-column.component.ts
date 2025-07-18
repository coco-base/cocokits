import { Component, input } from '@angular/core';

import { CheckboxComponent } from '@cocokits/angular-components';
import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/checkbox/checkbox-group-column.config';

@Component({
  selector: 'cck-checkbox-group-column',
  imports: [CheckboxComponent],
  template: `
    <div class="checkbox-group-column">
      <span class="label">My hobbies</span>
      <cck-checkbox [size]="cckExampleArgs().size" [value]="1">Comic books</cck-checkbox>
      <cck-checkbox [size]="cckExampleArgs().size" [value]="2">Listen to music</cck-checkbox>
      <cck-checkbox [size]="cckExampleArgs().size" [value]="3">Travel the world</cck-checkbox>
      <cck-checkbox [size]="cckExampleArgs().size" [value]="4">Watch movies</cck-checkbox>
    </div>
  `,
  styles: `
    .checkbox-group-column {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .label {
      color: var(--checkbox-group-column-color);
      font-style: italic;
    }
  `,
})
export class CheckboxGroupColumnComponent {
  public cckExampleArgs = input.required<ExampleArgs>();
}
