import { AppConfig as ProdAppConfig } from './environment.prod';

export const AppConfig = {
  ...ProdAppConfig,
  clientId: '54b9dcc49069dc2f018e',
  origin: 'https://catcher-org.github.io'
};
