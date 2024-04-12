/* SystemJS module definition */
declare let nodeModule: NodeModule;
interface NodeModule {
  id: string;
}

// eslint-disable-next-line no-var
declare var window: Window & typeof globalThis;
interface Window {
  process: any;
  require: any;
}
