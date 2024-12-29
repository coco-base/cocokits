import sdk from '@stackblitz/sdk';
import { PreparedStory } from "@storybook/types";

import { Button } from "@cocokits/react-button";
import { SvgIcon } from "@cocokits/react-icon";

import { angularJson } from './files-angular/stackblitz-file-angularJson';
import { globalStyles } from './files-angular/stackblitz-file-global_styles';
import { index } from './files-angular/stackblitz-file-index';
import { main } from './files-angular/stackblitz-file-main';
import { npmrc } from './files-angular/stackblitz-file-npmrc';
import { packageJson } from './files-angular/stackblitz-file-package-json';
import { tsconfigAppJson } from './files-angular/stackblitz-file-tsconfig-app-json';
import { tsconfigJson } from './files-angular/stackblitz-file-tsconfig-json';
import { AddonParameters } from "../../model/addon.model";
import { Icons } from "../../utils/icons";

interface StoryStackblitzButtonProps {
  story: PreparedStory;
}

export function StoryStackblitzButton({story}: StoryStackblitzButtonProps) {

  const parameters = story.parameters as AddonParameters;
  const stackblitz = parameters.cckAddon?.stackblitz;

  if(!stackblitz) {
    throw new Error('Stackblitz config has not found for story id: ' + story.id);
  }


  const framework = stackblitz.framework;

  if(!framework) {
    throw new Error('Stackblitz framework has not found for story id: ' + story.id);
  }
  if(framework !== 'angular') {
    throw new Error('Stackblitz framework is not supported: ' + framework);
  }

  const tsFile = stackblitz.tsFile;
  
  if(!tsFile) {
    throw new Error('Stackblitz example files has not found for story id: ' + story.id);
  }

  const files = stackblitz.extraFiles ?? {}; 

  const onButtonClick = () => {
    sdk.openProject({
      title: stackblitz.title || 'CocoKits Angular',
      template: 'angular-cli',
      dependencies: {
        '@angular/animations': '18.2.0',
        '@angular/common': '18.2.0',
        '@angular/compiler': '18.2.0',
        '@angular/core': '18.2.0',
        '@angular/forms': '18.2.0',
        '@angular/platform-browser': '18.2.0',
        '@angular/router': '18.2.0',
        '@cocokits/angular-components': 'latest',
        '@cocokits/theme-cocokits': 'latest',
        '@cocokits/theme-frames-x': 'latest',
        '@cocokits/angular-utils': 'latest',
        '@cocokits/common-utils': 'latest',
        '@cocokits/core': 'latest',
        '@cocokits/angular-core': 'latest',
        '@cocokits/angular-icon': 'latest',
        '@cocokits/angular-button': 'latest',
        '@cocokits/angular-checkbox': 'latest',
        '@cocokits/angular-radio': 'latest',
        '@cocokits/angular-form-field': 'latest',
        '@cocokits/angular-divider': 'latest',
        '@cocokits/angular-menu': 'latest',
        '@cocokits/angular-toggle': 'latest',
        "@swc/helpers": "~0.5.2",
        'rxjs': '7.8.1',
        'tslib': '2.5.0',
        'zone.js': '0.15.0'
      },
      files: {
        ...files,
        'src/example/example.component.ts': tsFile,
        'src/global_styles.css': globalStyles,
        'src/index.html': index,
        'src/main.ts': main,
        '.npmrc': npmrc,
        'angular.json': angularJson,
        'package.json': packageJson,
        'tsconfig.app.json': tsconfigAppJson,
        'tsconfig.json': tsconfigJson,
      }
    }, {
      openFile: 'example/example.component.ts',
      newWindow: true,
      startScript: 'npm i && npm start'
    });
  };
  

  return (
    <Button onClick={onButtonClick}>
      <SvgIcon icon={Icons.stackblitz}/>
      Stackblitz
    </Button>
  );

}