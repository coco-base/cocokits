import { AccordionComponent } from '@cocokits/angular-accordion';
import { renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-angular';

export const Nested: StoryObj<AccordionComponent> = {
  name: 'Nested',
  parameters: {
    docs: {
      description: {
        story:
          'The `nested` accordion allows for the creation of complex, multi-level accordion structures, enabling better organization of content and improved user navigation through hierarchical information.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Overview')],
      source: [
        {
          filename: 'example.component.html',
          language: 'angular-html',
          code: `
          <cck-accordion>
            <cck-accordion-panel>
              <cck-accordion-header>Accordion Header 1</cck-accordion-header>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            </cck-accordion-panel>

            <cck-accordion-panel disabled>
              <cck-accordion-header>Accordion Header 2</cck-accordion-header>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            </cck-accordion-panel>

            <cck-accordion-panel>
              <cck-accordion-header>Accordion Header 3 (Nested)</cck-accordion-header>

              <cck-accordion>
                <cck-accordion-panel>
                  <cck-accordion-header>Accordion Header 3-1</cck-accordion-header>
                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                </cck-accordion-panel>

                <cck-accordion-panel disabled>
                  <cck-accordion-header>Accordion Header 3-2</cck-accordion-header>
                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                </cck-accordion-panel>

                <cck-accordion-panel>
                  <cck-accordion-header>Accordion Header 3-3</cck-accordion-header>
                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                </cck-accordion-panel>
              </cck-accordion>

            </cck-accordion-panel>
          </cck-accordion>
          `,
        },
      ],
    },
  },
  render: (args) => {
    return {
      props: {
        ...args,
      },
      template: `
        <cck-accordion>

          <cck-accordion-panel>
            <cck-accordion-header>Accordion Header 1</cck-accordion-header>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
          </cck-accordion-panel>

          <cck-accordion-panel>
            <cck-accordion-header>Accordion Header 2</cck-accordion-header>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
          </cck-accordion-panel>

          <cck-accordion-panel>
            <cck-accordion-header>Accordion Header 3 (Nested)</cck-accordion-header>
            
            <cck-accordion>
              <cck-accordion-panel>
                <cck-accordion-header>Accordion Header 3-1</cck-accordion-header>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
              </cck-accordion-panel>

              <cck-accordion-panel>
                <cck-accordion-header>Accordion Header 3-2</cck-accordion-header>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
              </cck-accordion-panel>

              <cck-accordion-panel>
                <cck-accordion-header>Accordion Header 3-3</cck-accordion-header>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
              </cck-accordion-panel>
            </cck-accordion>

          </cck-accordion-panel>
        </cck-accordion>
      `,
    };
  },
};
