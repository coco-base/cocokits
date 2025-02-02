'use client';
import './ui-components.scss';
import { Tab, TabLabel, Tabs } from '@cocokits/react-tabs';
import { Brand } from '../../brands/brand';
import { CckComponent } from '../../cck-component/cck-component';
import { Button } from '@cocokits/react-button';
import { FormField, Input, Select, Option } from '@cocokits/react-form-field';
import { useWebsiteContext } from 'apps/website/app/app.context';
import Link from 'next/link';

export function UiComponents() {
  const context = useWebsiteContext();
  if(!context) {
    return;
  }

  const {selectedTheme, setSelectedTheme} = context;

  return (
    <div className="my-xl flex-column flex-center">
      <h2>UI components</h2>
      <p className="mb-xl">Practical components for high-quality development process.</p>

      <Tabs
        hideContent={true}
        selectedValue={selectedTheme}
        onSelectionChange={(theme) => setSelectedTheme(theme.value as typeof selectedTheme)}>
        <Tab label={TabBrandLabel('cocokits')} value="cocokits"/>
        <Tab label={TabBrandLabel('frames-x')} value="frames-x"/>
      </Tabs>

      <div className='flex-row gap-xl mt-xl'>
        <CckComponent themeName={selectedTheme} name="Button">
          <Button>Button</Button>
        </CckComponent>

        <CckComponent themeName={selectedTheme} name="Input">
          <FormField>
            <Input placeholder="Input" />
          </FormField>
        </CckComponent>

        <CckComponent themeName={selectedTheme} name="Select">
          <FormField>
            <Select placeholder="Input">
              <Option value="1">Text 1</Option>
              <Option value="2">Text 2</Option>
              <Option value="3">Text 3</Option>
            </Select>
          </FormField>
        </CckComponent>
      </div>

      <Link className='mt-xl' href="https://angular.cocokits.com/?path=/docs/ui-components-button--docs" target='_blank' rel="noopener noreferrer">
        <Button>Explore all components</Button>
      </Link>
    </div>
  );
}

// eslint-disable-next-line react/display-name
const TabBrandLabel = (themeName: 'cocokits' | 'frames-x') => (selected: boolean) => {
  return (
    <TabLabel>
      <Brand name={themeName} highlight={selected}/>
    </TabLabel>
  );
}
