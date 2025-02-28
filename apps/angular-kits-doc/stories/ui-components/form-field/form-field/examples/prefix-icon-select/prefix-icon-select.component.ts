import { Component, input, signal } from '@angular/core';
import {
  FormFieldComponent,
  LabelComponent,
  SelectComponent,
  OptionComponent,
  SvgIconComponent,
  PrefixComponent,
} from '@cocokits/angular-components';
import { Icons } from '@cocokits/common-icons';

import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/form-field/prefix-icon-select.config';

@Component({
  standalone: true,
  selector: 'cck-prefix-icon-select',
  imports: [FormFieldComponent, LabelComponent, SelectComponent, OptionComponent, SvgIconComponent, PrefixComponent],
  template: `
    <cck-form-field>
      <cck-label>Favorite food</cck-label>
      <cck-prefix>
        <cck-svg-icon [icon]="iconMap[value()]" />
      </cck-prefix>
      <cck-select class="select" [value]="value()" (selectionChange)="value.set($event[0])">
        <cck-option value="Cake">
          <div class="option-wrapper">
            <cck-svg-icon [icon]="iconMap.Cake"></cck-svg-icon>
            Cake
          </div>
        </cck-option>
        <cck-option value="Pizza">
          <div class="option-wrapper">
            <cck-svg-icon [icon]="iconMap.Pizza"></cck-svg-icon>
            Pizza
          </div>
        </cck-option>
        <cck-option value="Burger">
          <div class="option-wrapper">
            <cck-svg-icon [icon]="iconMap.Burger"></cck-svg-icon>
            Burger
          </div>
        </cck-option>
        <cck-option value="Steak">
          <div class="option-wrapper">
            <cck-svg-icon [icon]="iconMap.Steak"></cck-svg-icon>
            Steak
          </div>
        </cck-option>
      </cck-select>
    </cck-form-field>
  `,
  styles: `
    .select {
      min-width: 150px;
    }

    .option-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;

      .cck-svg-icon {
        fill: currentColor;
      }
    }
  `,
})
export class PrefixIconSelectComponent {
  public cckExampleArgs = input.required<ExampleArgs>();
  protected Icons = Icons;

  protected iconMap: Record<'Cake' | 'Pizza' | 'Burger' | 'Steak', string> = {
    Cake: Icons.cake,
    Pizza: Icons.pizzaSlice,
    Burger: Icons.burger,
    Steak: Icons.steak,
  };

  protected value = signal<'Cake' | 'Pizza' | 'Burger' | 'Steak'>('Cake');
}
