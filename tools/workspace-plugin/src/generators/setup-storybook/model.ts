import { LibraryFramework } from '../generator.model';

export interface SetupStorybookOption {
  libraryName: string;
  libraryRoot: string;
  offsetPathToRoot: string; // For Example: `../../..`
  framework: LibraryFramework;
  projectJson: string;
  eslintrcJson: string;
  tsconfigJson: string;
  tsconfigLibJson: string;
}
