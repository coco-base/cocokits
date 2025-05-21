import { AvatarComponent } from '@cocokits/angular-avatar';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-angular';

export const CustomTemplate: StoryObj<AvatarComponent> = {
  name: 'CustomTemplate',
  parameters: {
    docs: {
      description: {
        story: 'Shows an example of custom content.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Overview')],
      source: [
        {
          filename: 'example.component.ts',
          language: 'angular-ts',
          code: `
            import { Component } from "@angular/core";
            import { AvatarComponent, AvatarTemplateDirective } from '@cocokits/angular-components';

            @Component({
              selector: 'example-component',
              imports: [AvatarComponent, AvatarTemplateDirective],
              template: \`
                <cck-avatar size="<%= size %>">
                  <ng-template cckAvatar>
                    <div class="avatar-wrapper">
                    <img src="https://i.pravatar.cc/100?img=5" class="avatar-image" />
                    <img src="https://i.pravatar.cc/100?img=12" class="avatar-image" />
                    </div>
                  </ng-template>
                </cck-avatar>
              \`,
              styles: [\`
    .avatar-wrapper {
      display: grid;
      grid-template-columns: 1fr 1fr;
      width: 100%;
      height: 100%;
      gap: 2px;
    }
    .avatar-image {
      object-fit: cover;
      width: 100%;
      height: 100%
    }
    \`],
            })
            export class ExampleComponent {
            }
          `,
        },
      ],
      hasControl: false,
      singleControls: ['size'],
      controls: [CCK_CONTROL.size()],
    },
  },
  render: (args) => {
    return {
      props: {
        ...args,
      },
      template: `
        <cck-avatar [size]="cckControl.size">
          <ng-template cckAvatar>
            <div style="display: grid; grid-template-columns: 1fr 1fr; width: 100%; height: 100%; gap: 2px;">
            <img src="https://i.pravatar.cc/100?img=5" style="object-fit: cover; width: 100%; height: 100%" />
            <img src="https://i.pravatar.cc/100?img=12" style="object-fit: cover; width: 100%; height: 100%" />
            </div>
          </ng-template>
        </cck-avatar>
      `,
    };
  },
};
