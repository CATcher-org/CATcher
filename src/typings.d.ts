/* SystemJS module definition */
declare let nodeModule: NodeModule;
interface NodeModule {
  id: string;
}

declare let window: Window & typeof globalThis;
interface Window {
  process: any;
  require: any;
}
