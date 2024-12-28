import { AngularStoryObj } from '@cocokits/internal-model';
import { AddonParametersControlType } from '@cocokits/storybook-addon-theme';

import { ButtonComponent } from '../../src/lib/button/button.component';

export const Default: AngularStoryObj<ButtonComponent> = {
  name: 'Default',
  parameters: {
    docs: {
      description: {
        story:
          'Shows the default example with no additional configurations, providing an interactive example in its most basic form.',
      },
    },
    cckAddon: {
      source: [
        {
          filename: 'button.component.ts',
          language: 'angular-ts',
          code: `
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from './cart.service';

@Component({
  selector: 'app-demo',
  standalone: true,
  imports: [],
  template: \`
<button cck-button [type]="<%= type %>">Test</button>
<button type="button" [routerLink]="'/cart'">
@if (cartService.length > 0) {
<div>
@let hello = "world";
{{ cartService.length }}
</div>
}
Cart
</button>
  \`,
  styles: \`
    div { display: block; }
  \`,
})
export class CartButtonComponent {
  protected cartService = inject(CartService);
}
`,
        },
        {
          filename: 'button.component.html',
          language: 'angular-html',
          code: `
          @if(true) {
<button cck-button>HTML</button>
<cck-checkbox> This is a Checkbox </cck-checkbox>
        }
          `,
        },
      ],
      hasControl: true,
      hasStackblitz: true,
      hasCode: true,
      singleControls: [],
      controls: [
        { displayName: 'Text', default: 'Button', storyArgKey: 'text', type: AddonParametersControlType.Text },
        {
          displayName: 'Left Icon',
          default: 'heartFill',
          icons: ['none', 'heartFill', 'heart', 'link'],
          storyArgKey: 'leftIcon',
          type: AddonParametersControlType.Icon,
        },
        {
          displayName: 'Right Icon',
          default: 'none',
          icons: ['none', 'heartFill', 'heart', 'link'],
          storyArgKey: 'rightIcon',
          type: AddonParametersControlType.Icon,
        },
        { prop: 'type', type: AddonParametersControlType.SelectThemeConfig },
        { prop: 'color', type: AddonParametersControlType.SelectThemeConfig },
        { prop: 'size', type: AddonParametersControlType.SelectThemeConfig },
        { prop: 'additional', type: AddonParametersControlType.SelectThemeConfig },
        { displayName: 'Disabled', default: false, storyArgKey: 'disabled', type: AddonParametersControlType.Boolean },
      ],
    },
  },
  args: {
    // _type: 'secondary'
  },
  render: (args) => {
    return {
      props: {
        ...args,
        // _type: 'secondary'
      },
      template: `
        <button [type]="cckControl.type" [size]="cckControl.size" [color]="cckControl.color" cck-button>{{cckControl.text}}</button>
      `,
    };
  },
};

// <story-table [headers]="['Default', 'Disabled']" [fullWidth]="false">
//     <story-table-cell row="0" col="0">
//       <button cck-button>Button</button>
//     </story-table-cell>
//     <story-table-cell row="0" col="1">
//       <button cck-button disabled>Button</button>
//     </story-table-cell>
//   </story-table>
