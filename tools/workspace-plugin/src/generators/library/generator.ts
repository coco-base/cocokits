import { Tree } from '@nx/devkit';
import { LibraryGeneratorSchema } from './schema';

export async function libraryGenerator(tree: Tree, options: LibraryGeneratorSchema) {
  console.log('options.name', options.name);
  console.log('options.type', options.type);
  console.log('options.framework', options.framework);
}

export default libraryGenerator;
