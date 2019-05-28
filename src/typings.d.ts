/* SystemJS module definition */
declare var nodeModule: NodeModule;
interface NodeModule {
  id: string;
}

declare module '*.json'
{ const value: any;
  export default value;
}

declare var window: Window;
interface Window {
  process: any;
  require: any;
}
