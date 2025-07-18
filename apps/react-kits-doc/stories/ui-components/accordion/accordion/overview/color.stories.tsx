import { Fragment } from 'react';

import { Accordion, AccordionHeader, AccordionPanel } from '@cocokits/react-accordion';
import { CCK_CONTROL, renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Color: StoryObj<typeof Accordion> = {
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
          filename: 'Source Code',
          language: 'tsx',
          code: `
          import { Accordion, AccordionPanel, AccordionHeader } from "@cocokits/react-components";

          export const MyComponent = () => {
            return (
              <>
                <% themeComponentConfig.color.values.map(color => { %>
                  <Accordion
                    <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
                    color='<%= color %>'>
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
      controls: [CCK_CONTROL.type()],
    },
  },
  render: (args) => (
    <>
      {args.cckControl.themeComponentConfig.color?.values.map((color, index) => (
        <Fragment key={index}>
          <h4 className="cck-doc-story__header">{color}</h4>
          <Accordion key={index} type={args.cckControl.type} color={color}>
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
