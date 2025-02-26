/* SystemJS module definition */
// eslint-disable-next-line no-var -- Please revisit this eslint rule in the future
declare var nodeModule: NodeModule;
interface NodeModule {
  id: string;
}

// eslint-disable-next-line no-var -- Please revisit this eslint rule in the future
declare var window: Window & typeof globalThis;
interface Window {
  process: any;
  require: any;
}
