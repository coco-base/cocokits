import { Accordion, AccordionHeader, AccordionPanel } from '@cocokits/react-accordion';
import { renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Nested: StoryObj<typeof Accordion> = {
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
          filename: 'SOurce Code',
          language: 'tsx',
          code: `
            import { Accordion, AccordionPanel, AccordionHeader } from "@cocokits/react-components";

            export const MyComponent = () => {
              return (
                <Accordion>
                  <AccordionPanel>
                    <AccordionHeader>Accordion Header 1</AccordionHeader>
                    
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore
                      magna aliqua.
                    
                  </AccordionPanel>

                  <AccordionPanel>
                    <AccordionHeader>Accordion Header 2</AccordionHeader>
                    
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore
                      magna aliqua.
                    
                  </AccordionPanel>

                  <AccordionPanel>
                    <AccordionHeader>Accordion Header 3 (Nested)</AccordionHeader>
                    <Accordion>
                      <AccordionPanel>
                        <AccordionHeader>Accordion Header 3-1</AccordionHeader>
                        
                          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
                          dolore magna aliqua.
                        
                      </AccordionPanel>

                      <AccordionPanel>
                        <AccordionHeader>Accordion Header 3-2</AccordionHeader>
                        
                          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
                          dolore magna aliqua.
                        
                      </AccordionPanel>

                      <AccordionPanel>
                        <AccordionHeader>Accordion Header 3-3</AccordionHeader>
                        
                          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
                          dolore magna aliqua.
                        
                      </AccordionPanel>
                    </Accordion>
                  </AccordionPanel>
                </Accordion>
              )
            }
          `,
        },
      ],
    },
  },
  render: (_args) => (
    <Accordion>
      <AccordionPanel>
        <AccordionHeader>Accordion Header 1</AccordionHeader>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore
        magna aliqua.
      </AccordionPanel>

      <AccordionPanel>
        <AccordionHeader>Accordion Header 2</AccordionHeader>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore
        magna aliqua.
      </AccordionPanel>

      <AccordionPanel>
        <AccordionHeader>Accordion Header 3 (Nested)</AccordionHeader>
        <Accordion>
          <AccordionPanel>
            <AccordionHeader>Accordion Header 3-1</AccordionHeader>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua.
          </AccordionPanel>

          <AccordionPanel>
            <AccordionHeader>Accordion Header 3-2</AccordionHeader>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua.
          </AccordionPanel>

          <AccordionPanel>
            <AccordionHeader>Accordion Header 3-3</AccordionHeader>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua.
          </AccordionPanel>
        </Accordion>
      </AccordionPanel>
    </Accordion>
  ),
};
