'use client';
import './ui-components.scss';
import { useWebsiteContext } from 'apps/website/app/app.context';
import Link from 'next/link';
import { useRef, useState } from 'react';

import { Icons } from '@cocokits/common-icons';
import { Button } from '@cocokits/react-button';
import {
  Checkbox,
  Chip,
  ChipList,
  Divider,
  IconButton,
  Label,
  Menu,
  MenuItem,
  RadioButton,
  RadioGroup,
  SvgIcon,
  Toggle,
} from '@cocokits/react-components';
import { FormField, Input, Option, Select, Textarea } from '@cocokits/react-form-field';
import { Tab, Tabs } from '@cocokits/react-tabs';

import { Brand } from '../../brands/brand';
import { CckComponent } from '../../cck-component/cck-component';

export function UiComponents() {
  const context = useWebsiteContext();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  if (!context) {
    return;
  }

  const { selectedTheme, setSelectedTheme } = context;

  return (
    <div className="my-xl flex-column flex-center">
      <h2>UI components</h2>
      <p className="mb-xl">Practical components for high-quality development process.</p>

      <Tabs
        hideContent={true}
        selected={selectedTheme}
        onSelectionChange={(theme) => setSelectedTheme(theme.value as typeof selectedTheme)}>
        <Tab header={TabBrandLabel('cocokits')} value="cocokits" />
        <Tab header={TabBrandLabel('frames-x')} value="frames-x" />
      </Tabs>

      <div className="examples-container">
        <CckComponent className="examples-1x1" themeName={selectedTheme} name="Button">
          <Button>Button</Button>
        </CckComponent>

        <CckComponent className="examples-1x1" themeName={selectedTheme} name="Button">
          <IconButton>
            <SvgIcon icon={Icons.heartFill} />
          </IconButton>
        </CckComponent>

        <CckComponent className="examples-1x1" themeName={selectedTheme} name="Button">
          <Checkbox>Checkbox</Checkbox>
        </CckComponent>

        <CckComponent className="examples-1x1" themeName={selectedTheme} name="Input">
          <FormField style={{ width: '200px' }}>
            <Input placeholder="Input" />
          </FormField>
        </CckComponent>

        <CckComponent className="examples-1x1" themeName={selectedTheme} name="Chip">
          <Chip> Chip </Chip>
        </CckComponent>

        <CckComponent className="examples-1x2" themeName={selectedTheme} name="ChipList">
          <FormField>
            <Label>Favorite Foods</Label>
            <ChipList chips={['Steak', 'Pizza']} placeholder="Add a new food" />
          </FormField>
        </CckComponent>

        <CckComponent className="examples-1x1" themeName={selectedTheme} name="Menu">
          <Button ref={buttonRef} onClick={() => setOpen(true)}>
            Open Menu
          </Button>

          <Menu open={open} targetRef={buttonRef} onMenuStatusChange={(isOpen) => setOpen(isOpen)}>
            <MenuItem>Edit</MenuItem>
            <MenuItem>Duplicate</MenuItem>
            <Divider />
            <MenuItem>Archive</MenuItem>
            <MenuItem disabled>Move</MenuItem>
            <Divider />
            <MenuItem>Share</MenuItem>
            <MenuItem>Add to favorite</MenuItem>
          </Menu>
        </CckComponent>

        <CckComponent className="examples-1x1" themeName={selectedTheme} name="Select">
          <FormField style={{ width: '200px' }}>
            <Select placeholder="Select">
              <Option value="Text 1">Text 1</Option>
              <Option value="Text 2">Text 2</Option>
              <Option value="Text 3">Text 3</Option>
            </Select>
          </FormField>
        </CckComponent>

        <CckComponent className="examples-1x1" themeName={selectedTheme} name="Textarea">
          <FormField style={{ width: '200px' }}>
            <Textarea placeholder="Textarea" autoResize minRows={2} maxRows={4} />
          </FormField>
        </CckComponent>

        <CckComponent className="examples-1x1" themeName={selectedTheme} name="RadioGroup">
          <RadioGroup selected="Radio-1">
            <RadioButton value="Radio-1">Radio Button 1</RadioButton>
            <RadioButton value="Radio-2">Radio Button 2</RadioButton>
            <RadioButton value="Radio-3">Radio Button 3</RadioButton>
          </RadioGroup>
        </CckComponent>

        <CckComponent className="examples-1x1" themeName={selectedTheme} name="Toggle">
          <Toggle />
        </CckComponent>
      </div>

      <Link
        className="mt-xl"
        href="https://angular.cocokits.com/?path=/docs/ui-components-button--docs"
        target="_blank"
        rel="noopener noreferrer">
        <Button>Explore all components</Button>
      </Link>
    </div>
  );
}

// eslint-disable-next-line react/display-name
const TabBrandLabel = (themeName: 'cocokits' | 'frames-x') => (selected: boolean) => {
  return (
    <Brand name={themeName} highlight={selected} />
  );
};
