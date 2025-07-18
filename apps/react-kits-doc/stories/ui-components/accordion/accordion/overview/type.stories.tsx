import { Fragment } from 'react';

import { Accordion, AccordionHeader, AccordionPanel } from '@cocokits/react-accordion';
import { renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Type: StoryObj<typeof Accordion> = {
  name: 'Type',
  parameters: {
    docs: {
      description: {
        story:
          'Displays variations in appearance and functionality, demonstrating how different types can be used to create unique Accordion styles.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithThemeProp('type'), renderWithPageTab('Overview')],
      source: [
        {
          filename: 'Source Code',
          language: 'tsx',
          code: `
          import { Accordion, AccordionPanel, AccordionHeader } from "@cocokits/react-components";

          export const MyComponent = () => {
            return (
              <>
                <% themeComponentConfig.type.values.map(type => { %>
                  <Accordion
                    <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
                  >
                    <AccordionPanel>
                      <AccordionHeader>Accordion Header 1</AccordionHeader>
                      
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
                        dolore magna aliqua.
                      
                    </AccordionPanel>

                    <AccordionPanel>
                      <AccordionHeader>Accordion Header 1</AccordionHeader>
                      
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
                        dolore magna aliqua.
                      
                    </AccordionPanel>

                    <AccordionPanel>
                      <AccordionHeader>Accordion Header 1</AccordionHeader>
                      
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
                        dolore magna aliqua.
                      
                    </AccordionPanel>
                    </Accordion>
                <% }) %>
              </>
            );
          }
          `,
        },
      ],
    },
  },
  render: (args) => (
    <>
      {args.cckControl.themeComponentConfig.type?.values.map((type, index) => (
        <Fragment key={index}>
          <h4 className="cck-doc-story__header">{type}</h4>
          <Accordion key={index} type={type}>
            <AccordionPanel>
              <AccordionHeader>Accordion Header 1</AccordionHeader>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
              dolore magna aliqua.
            </AccordionPanel>

            <AccordionPanel>
              <AccordionHeader>Accordion Header 1</AccordionHeader>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
              dolore magna aliqua.
            </AccordionPanel>

            <AccordionPanel>
              <AccordionHeader>Accordion Header 1</AccordionHeader>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
              dolore magna aliqua.
            </AccordionPanel>
          </Accordion>
        </Fragment>
      ))}
    </>
  ),
};
