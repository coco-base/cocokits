import { moduleMetadata } from '@storybook/angular';

import { SvgIconComponent } from '@cocokits/angular-icon';
import { TabHeaderTemplateDirective, TabsComponent } from '@cocokits/angular-tabs';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-angular';

export const CustomHeader: StoryObj<TabsComponent> = {
  name: 'CustomHeader',
  decorators: [
    moduleMetadata({
      imports: [TabHeaderTemplateDirective, SvgIconComponent],
    }),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Custom headers allow for personalized tab headers, enhancing user experience and branding.',
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
            <cck-tabs
             <% if (typeof type !== 'undefined') { %> type='<%= type %>'<% } %>
            >
              <cck-tab [hideContent]="true">
                <ng-template cckTabHeader>
                  <div class="header">
                    <cck-svg-icon [icon]="Icons.diamonds"/>
                    <span>Dashboard</span>
                  </div>
                </ng-template>
              </cck-tab>
              <cck-tab>
                <ng-template cckTabHeader>
                  <div class="header">
                    <cck-svg-icon [icon]="Icons.tools"/>
                    <span>Tools</span>
                  </div>
                </ng-template>
              </cck-tab>
              <cck-tab>
                <ng-template cckTabHeader>
                  <div class="header">
                    <cck-svg-icon [icon]="Icons.setting"/>
                    <span>Setting</span>
                  </div>
                </ng-template>
              </cck-tab>
            </cck-tabs>
          `,
        },
        {
          filename: 'example.component.scss',
          language: 'scss',
          code: `
            .header {
              display: flex;
              gap: 4px;
              align-items: center;
            }
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
      <cck-tabs [type]="cckControl.type" [size]="size" [hideContent]="true">
        <cck-tab>
          <ng-template cckTabHeader>
            <div style="display: flex; gap: 4px;">
              <cck-svg-icon [icon]="cckIcons.diamonds"/>
              <span>Dashboard</span>
            </div>
          </ng-template>
        </cck-tab>
        <cck-tab>
          <ng-template cckTabHeader>
            <div style="display: flex; gap: 4px;">
              <cck-svg-icon [icon]="cckIcons.tools"/>
              <span>Tools</span>
            </div>
          </ng-template>
        </cck-tab>
        <cck-tab>
          <ng-template cckTabHeader>
            <div style="display: flex; gap: 4px;">
              <cck-svg-icon [icon]="cckIcons.setting"/>
              <span>Setting</span>
            </div>
          </ng-template>
        </cck-tab>
      </cck-tabs>
    `,
  }),
};
