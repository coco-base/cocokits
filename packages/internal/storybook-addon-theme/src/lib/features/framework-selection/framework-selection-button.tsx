import styled from 'styled-components';

import { Option, Select, SelectPreview } from '@cocokits/react-form-field';

import { useFramework } from './framework-selection.hooks';
import { AddonThemeConfig } from '../../model/addon.model';
import { ColorMode } from '../../model/theme.model';
import { useColorMode } from '../../utils/use-preview-color-mode';

const CustomPreview = ({ framework }: { framework: AddonThemeConfig['framework'] }) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === ColorMode.Dark;

  if (framework === 'angular') {
    return (
      <StyledSelectPreview>
        <StyledOptionAngularImage
          src={isDark ? 'logos/angular-icon-logo_white.png' : 'logos/angular-icon-logo_black.png'}
          alt="Angular" />
        Angular
      </StyledSelectPreview>
    );
  }

  if (framework === 'react') {
    return (
      <StyledSelectPreview>
        <StyledOptionReactImage
          src={isDark ? 'logos/react-icon-logo-light.svg' : 'logos/react-icon-logo-dark.svg'}
          alt="React"
        />
        React
      </StyledSelectPreview>
    );
  }

  return null;
};

export function FrameworkSelectionButton() {
  const framework = useFramework();
  const { colorMode } = useColorMode();
  const isDark = colorMode === ColorMode.Dark;

  if (!framework) {
    return;
  }

  const onFrameworkChange = ([selectedFramework]: string[]) => {
    if (framework.toLocaleLowerCase() === selectedFramework.toLocaleLowerCase()) {
      return;
    }

    const currentUrl = window.parent.location.href;
    const newUrl = currentUrl.replace(framework.toLocaleLowerCase(), selectedFramework.toLocaleLowerCase());
    const windowRoot = window.top ?? window;
    windowRoot.location.href = newUrl;
  };

  return (
    <StyledHost>
      <StyledSelected
        // Value is just to force to render custom preview instead of placeholder. We don't use the selected value.
        value={framework}
        onlyEmitOnValueChange={false}
        selectPreview={() => <CustomPreview framework={framework} />}
        onChange={onFrameworkChange}>
        <Option value="angular">
          <StyledOptionAngularImage
            src={isDark ? 'logos/angular-icon-logo_white.png' : 'logos/angular-icon-logo_black.png'}
            alt="Angular" />
          Angular
        </Option>
        <Option value="react">
          <StyledOptionReactImage
            src={isDark ? 'logos/react-icon-logo-light.svg' : 'logos/react-icon-logo-dark.svg'}
            alt="React"
          />
          React
        </Option>
      </StyledSelected>
    </StyledHost>
  );
}

const StyledSelectPreview = styled(SelectPreview)`
  display: flex;
  align-items: center;
  font: var(--cck-doc-text-sm-medium);
  margin-right: 4px;
`;

const StyledHost = styled.div`
  border-radius: 500px;
  padding: 0 12px 0 12px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: var(--cck-doc-color-bg-hover-2);
  }
`;

const StyledSelected = styled(Select<string>)`
  height: 100%;
`;

const StyledOptionAngularImage = styled.img`
  width: 28px;
  margin-right: 10px;
`;

const StyledOptionReactImage = styled.img`
  width: 24px;
  margin-right: 12px;
  margin-left: 2px;
`;
