import { GeneratorDirectoryFormat } from '../generator.model';

export interface ComponentGeneratorSchema {
  name: string;
  project: string;
  story: boolean;
  directory: string;
  directoryFormat: GeneratorDirectoryFormat;
}
