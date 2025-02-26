import {
  ComponentRef,
  ElementRef,
  EmbeddedViewRef,
  Injector,
  NgModuleRef,
  TemplateRef,
  Type,
  ViewContainerRef,
  ViewRef
} from '@angular/core';

export class MockViewContainerRef implements ViewContainerRef {
  element: ElementRef;
  injector: Injector;
  parentInjector: any;
  length: number;

  _views: ViewRef[] = [];

  constructor(injector: Injector) {
    this.injector = injector;
  }
  createEmbeddedView<C>(templateRef: TemplateRef<C>, context?: C, index?: number): EmbeddedViewRef<C> {
    // Implement the required method with a fake return value or logic.
    return null as any;
  }

  createComponent<C>(componentType: any, options?: any): ComponentRef<C> {
    return null as any;
  }

  insert(viewRef: EmbeddedViewRef<any>, index?: number): EmbeddedViewRef<any> {
    if (index == null || index > this._views.length) {
      index = this._views.length;
    }

    this._views.splice(index, 0, viewRef);
    this.length = this._views.length;

    return viewRef;
  }
  remove(index?: number): void {
    if (index == null || index >= this._views.length) {
      index = this._views.length - 1;
    }

    if (index >= 0) {
      this._views.splice(index, 1);
      this.length = this._views.length;
    }
  }
  clear(): void {
    throw new Error('Method not implemented.');
  }
  get(index: number): ViewRef | null {
    throw new Error('Method not implemented.');
  }
  indexOf(viewRef: ViewRef): number {
    throw new Error('Method not implemented.');
  }
  detach(index?: number | undefined): ViewRef | null {
    throw new Error('Method not implemented.');
  }

  move(viewRef: ViewRef, currentIndex: number): ViewRef {
    throw new Error('Method not implemented.');
  }
}
