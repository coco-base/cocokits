import { AccordionComponent } from '@cocokits/angular-accordion';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-angular';

export const CustomIcon: StoryObj<AccordionComponent> = {
  name: 'Custom Icon',
  parameters: {
    docs: {
      description: {
        story:
          'The `customIcon` template allows you to replace the default icons with custom SVG icons, enhancing the visual appeal and branding of the accordion component.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Overview')],
      source: [
        {
          filename: 'example.component.html',
          language: 'angular-html',
          code: `
          <cck-accordion
            <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
          >
            <!-- Custom icon template for all accordions header -->
            <ng-template cckAccordionHeaderIcon let-isExpanded="isExpanded">
              <cck-svg-icon [icon]="isExpanded ? Icons.minus : Icons.plus"/>
            </ng-template>

            <cck-accordion-panel>
              <cck-accordion-header>
                Accordion Header 1

                <!-- Custom icon template for this accordion header -->
                <ng-template cckAccordionHeaderIcon let-isExpanded="isExpanded">
                  <cck-svg-icon [icon]="isExpanded ? Icons.arrowUp : Icons.arrowDown"/>
                </ng-template>
              </cck-accordion-header>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </cck-accordion-panel>

            <cck-accordion-panel disabled>
              <cck-accordion-header>Accordion Header 2</cck-accordion-header>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </cck-accordion-panel>

            <cck-accordion-panel>
              <cck-accordion-header>Accordion Header 3</cck-accordion-header>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </cck-accordion-panel>
          </cck-accordion>
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
        <cck-accordion [type]="cckControl.type">

        <ng-template cckAccordionHeaderIcon let-isExpanded="isExpanded">
          <cck-svg-icon [icon]="isExpanded ? cckIcons.arrowUp : cckIcons.arrowDown"/>
        </ng-template>

          <cck-accordion-panel>
            <cck-accordion-header>
              Accordion Header 1
              <ng-template cckAccordionHeaderIcon let-isExpanded="isExpanded">
                <cck-svg-icon [icon]="isExpanded ? cckIcons.minus : cckIcons.plus"/>
              </ng-template>
            </cck-accordion-header>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </cck-accordion-panel>

          <cck-accordion-panel>
            <cck-accordion-header>Accordion Header 2</cck-accordion-header>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </cck-accordion-panel>

          <cck-accordion-panel>
            <cck-accordion-header>Accordion Header 3</cck-accordion-header>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </cck-accordion-panel>
        </cck-accordion>
      `,
    };
  },
};
