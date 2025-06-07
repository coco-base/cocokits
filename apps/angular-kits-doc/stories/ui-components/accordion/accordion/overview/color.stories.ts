import { AccordionComponent } from '@cocokits/angular-accordion';
import { CCK_CONTROL, renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-angular';

export const Color: StoryObj<AccordionComponent> = {
  name: 'Color',
  parameters: {
    docs: {
      description: {
        story: 'Color options enable seamless integration with various themes or to highlight specific actions.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithThemeProp('color'), renderWithPageTab('Overview')],
      singleControls: ['type'],
      source: [
        {
          filename: 'example.component.html',
          language: 'angular-html',
          code: `
          <% themeComponentConfig.color.values.map(color => { %>
            <cck-accordion
              <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
              color='<%= color %>'
            >
              <cck-accordion-panel>
                <cck-accordion-header>Accordion Header 1</cck-accordion-header>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
              </cck-accordion-panel>

              <cck-accordion-panel>
                <cck-accordion-header>Accordion Header 2</cck-accordion-header>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
              </cck-accordion-panel>

              <cck-accordion-panel>
                <cck-accordion-header>Accordion Header 3</cck-accordion-header>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
              </cck-accordion-panel>
            </cck-accordion>
          <% }) %>
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
      @for (color of cckControl.themeComponentConfig.color.values; let col = $index; track color) {
        <cck-accordion [type]="cckControl.type" [color]="color">
          <h5 style="width: 100%; margin: 0">{{ color }}</h5>
          <cck-accordion-panel>
            <cck-accordion-header>Accordion Header 1</cck-accordion-header>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
          </cck-accordion-panel>

          <cck-accordion-panel>
            <cck-accordion-header>Accordion Header 2</cck-accordion-header>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
          </cck-accordion-panel>

          <cck-accordion-panel>
            <cck-accordion-header>Accordion Header 3</cck-accordion-header>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
          </cck-accordion-panel>
        </cck-accordion>
      }
    `,
  }),
};
