import { moduleMetadata } from '@storybook/angular';

import { BadgeComponent } from '@cocokits/angular-badge';
import { ButtonComponent } from '@cocokits/angular-button';
import { MenuComponent, MenuItemComponent } from '@cocokits/angular-menu';
import { TabComponent, TabHeaderTemplateDirective, TabsComponent } from '@cocokits/angular-tabs';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-angular';

export const Integration: StoryObj<BadgeComponent> = {
  name: 'Integration',
  decorators: [
    moduleMetadata({
      imports: [
        ButtonComponent,
        TabsComponent,
        TabComponent,
        TabHeaderTemplateDirective,
        MenuComponent,
        MenuItemComponent,
      ],
    }),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Badges attached to interactive components.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Overview')],
      singleControls: ['type'],
      source: [
        {
          filename: 'example.component.html',
          language: 'angular-html',
          code: `
            <button cck-button>
              Button
              <cck-badge [type]="cckControl.type" content="2"/>
            </button>

            <cck-tabs [hideContent]="true">
              <cck-tab>
                <ng-template cckTabHeader>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span>Header 1</span>
                    <cck-badge [type]="cckControl.type" content="2"/>
                  </div>
                </ng-template>
              </cck-tab>
              <cck-tab header="Header 2" />
              <cck-tab header="Header 3" />
            </cck-tabs>

            <cck-menu >
              <cck-menu-item>Edit</cck-menu-item>
              <cck-menu-item>Duplicate</cck-menu-item>
              <cck-divider></cck-divider>
              <cck-menu-item>
                Share
                <cck-badge [type]="cckControl.type" content="2"/>
              </cck-menu-item>
            </cck-menu>
          `,
        },
      ],
      controls: [CCK_CONTROL.type()],
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>
        Button
        <cck-badge [type]="cckControl.type" content="2"/>
      </button>

      <cck-tabs [hideContent]="true">
        <cck-tab>
          <ng-template cckTabHeader>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span>Header 1</span>
              <cck-badge [type]="cckControl.type" content="2"/>
            </div>
          </ng-template>
        </cck-tab>
        <cck-tab header="Header 2" />
        <cck-tab header="Header 3" />
      </cck-tabs>

      <cck-menu >
        <cck-menu-item>Edit</cck-menu-item>
        <cck-menu-item>Duplicate</cck-menu-item>
        <cck-divider></cck-divider>
        <cck-menu-item>
          Share
          <cck-badge [type]="cckControl.type" content="2"/>
        </cck-menu-item>
      </cck-menu>
    `,
  }),
};
