import { GeneratorDirectoryFormat } from '../generator.model';

export interface ComponentGeneratorSchema {
  name: string;
  project: string;
  story: boolean;
  export: boolean;
  directory: string;
  directoryFormat: GeneratorDirectoryFormat;
}
