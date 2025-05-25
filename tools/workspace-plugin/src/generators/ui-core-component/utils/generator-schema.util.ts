import { errorMessages } from './errors';
import { UiCoreComponentGeneratorOptions } from '../model';

interface NxGeneratorSchema {
  properties: {
    exitingLibraryName: {
      enum: string[];
    };
  };
}

export function updateGeneratorSchema(options: UiCoreComponentGeneratorOptions) {
  if (options.newLibrary) {
    const schema = getSchemaJson(options);
    schema.properties.exitingLibraryName.enum.push(options.libraryName.fileName);
    options.tree.write(options.generatorSchemaFilePath, JSON.stringify(schema, null, 2));
  }
}

function getSchemaJson(options: UiCoreComponentGeneratorOptions): NxGeneratorSchema {
  const schemaString = options.tree.read(options.generatorSchemaFilePath, 'utf-8');

  if (!schemaString) {
    throw new Error(errorMessages.schema.notFoundOrEmpty(options));
  }

  try {
    return JSON.parse(schemaString);
  } catch {
    throw new Error(errorMessages.schema.invalidJson(options));
  }
}
