import { generateTestEnv } from './environment.gen';

export const AppConfig = {
  ...generateTestEnv()
};
