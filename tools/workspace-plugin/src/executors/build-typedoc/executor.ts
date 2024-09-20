import { BuildTypedocExecutorSchema } from './schema';

export default async function runExecutor(options: BuildTypedocExecutorSchema) {
  console.log('Executor ran for BuildStorybookUtilsDoc', options);
  return {
    success: true,
  };
}
