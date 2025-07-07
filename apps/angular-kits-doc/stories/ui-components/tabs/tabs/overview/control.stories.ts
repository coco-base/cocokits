import { Component, input, model } from '@angular/core';

import { moduleMetadata } from '@storybook/angular';

import { TabComponent, TabsComponent } from '@cocokits/angular-tabs';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-angular';

@Component({
  selector: 'cck-tabs-control',
  standalone: true,
  imports: [TabsComponent, TabComponent],
  styles: [
    `
      hr {
        width: 100%;
        margin: 12px 0;
      }
    `,
  ],
  template: `
    <div class="cck-doc-story__radio-selection-group">
      <div
        class="cck-doc-story__radio-selection"
        [class.cck-doc-story__radio-selection--selected]="selected() === 1"
        (click)="selected.set(1)">
        1
      </div>
      <div
        class="cck-doc-story__radio-selection"
        [class.cck-doc-story__radio-selection--selected]="selected() === 2"
        (click)="selected.set(2)">
        2
      </div>
      <div
        class="cck-doc-story__radio-selection"
        [class.cck-doc-story__radio-selection--selected]="selected() === 3"
        (click)="selected.set(3)">
        3
      </div>
    </div>

    <hr />

    <cck-tabs [type]="type()" [(selected)]="selected" [hideContent]="true">
      <cck-tab header="Header 1" [value]="1" />
      <cck-tab header="Header 2" [value]="2" />
      <cck-tab header="Header 3" [value]="3" />
    </cck-tabs>
  `,
})
export class StoryTabsControlComponent {
  type = input.required<string>();
  selected = model(1);
}

export const Control: StoryObj<TabsComponent> = {
  name: 'Control',
  decorators: [
    moduleMetadata({
      imports: [StoryTabsControlComponent],
    }),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Tabs can be controlled programmatically.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Overview')],
      source: [
        {
          filename: 'example.component.html',
          language: 'angular-html',
          code: `
            <div class="cck-doc-story__radio-selection-group">
            <div
              class="cck-doc-story__radio-selection"
              [class.cck-doc-story__radio-selection--selected]="selected() === 1"
              (click)="selected.set(1)">
              1
            </div>
            <div
              class="cck-doc-story__radio-selection"
              [class.cck-doc-story__radio-selection--selected]="selected() === 2"
              (click)="selected.set(2)">
              2
            </div>
            <div
              class="cck-doc-story__radio-selection"
              [class.cck-doc-story__radio-selection--selected]="selected() === 3"
              (click)="selected.set(3)">
              3
            </div>
          </div>

          <hr />

          <cck-tabs type="<%= type %>" [(selected)]="selected" [hideContent]="true">
            <cck-tab header="Header 1" [value]="1"/>
            <cck-tab header="Header 2" [value]="2"/>
            <cck-tab header="Header 3" [value]="3"/>
          </cck-tabs>
          `,
        },
        {
          filename: 'example.component.ts',
          language: 'angular-ts',
          code: `
            @Component({
              selector: 'cck-tabs-control',
              standalone: true,
              imports: [TabsComponent, TabComponent],
              stylesUrls: ['./example.component.scss'],
              templateUrl: './example.component.html',
            })
            export class StoryTabsControlComponent {
              selected = signal(1);
            }
          `,
        },
        {
          filename: 'example.component.scss',
          language: 'scss',
          code: `
            // Warning: The styles below are optimized for dark mode.

            .cck-doc-story__radio-selection-group {
              display: flex;
              justify-content: center;
              gap: 8px;
            }

            .cck-doc-story__radio-selection {
              width: 32px;
              height: 32px;
              border: 1px solid var(--cck-doc-color-border-3, #ffffff33);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: var(--cck-doc-color-font-1, #fff);
              font: var(--cck-doc-text-sm-light, 300 14px/24px Inter);
              cursor: pointer;
              user-select: none;
            }

            .cck-doc-story__radio-selection--selected {
              background-color: var(--cck-doc-color-bg-selected-2, #14513c);
            }

            .cck-doc-story__button--basic {
              padding: 0 16px 0 16px;
              background-color: transparent;
              color: var(--cck-doc-color-font-1, #fff);
              gap: 8px;
              height: 40px;
              align-items: center;
              border: none;
              border-radius: var(--cck-doc-radius-sm, 4px);
              box-sizing: border-box;
              cursor: pointer;
              display: flex;
              font: var(--cck-doc-text-sm-medium, 500 14px/24px Inter);
              justify-content: center;
              margin: 0;
              min-width: 80px;
              outline: transparent;

              &:hover {
                background-color: var(--cck-doc-color-bg-hover-2, #15171e);
              }

              hr {
                width: 100%;
                margin: 12px 0;
              }
          }
          `,
        },
      ],
      singleControls: ['type'],
      hasControl: false,
      controls: [CCK_CONTROL.type()],
    },
  },
  render: (args) => {
    return {
      props: {
        ...args,
      },
      template: `
        <cck-tabs-control [type]="cckControl.type"/>
      `,
    };
  },
};
