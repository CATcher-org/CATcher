import { DOCUMENT } from '@angular/common';
import { ComponentFactory, ComponentFactoryResolver, ComponentRef, ElementRef, Injector, Renderer2, ViewContainerRef } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { MatSpinner } from '@angular/material/progress-spinner';
import { distinctUntilChanged } from 'rxjs/operators';
import { LoadingService } from '../../src/app/core/services/loading.service';
import { MockMatSpinner } from '../helper/mock.mat.spinner';

describe('LoadingService', () => {
  let service: LoadingService;
  let mockComponentFactory: jasmine.SpyObj<ComponentFactory<MatSpinner>>;
  let mockComponentFactoryResolver: jasmine.SpyObj<ComponentFactoryResolver>;
  let document: Document;

  beforeEach(async () => {
    const mockMatSpinnerInstance = new MockMatSpinner();

    const mockRenderer = jasmine.createSpyObj<Renderer2>('Renderer2', ['createElement', 'appendChild', 'setStyle', 'addClass']);
    mockRenderer.addClass.and.callFake((el: any, className: string) => {
      // Simulate adding the class by appending it to the element's classList
      // el.classList.add(className);
    });

    const mockComponentInjector = jasmine.createSpyObj('Injector', {
      get: mockRenderer
    });

    const elementRef: ElementRef = {
      nativeElement: {
        classList: {
          add: jasmine.createSpy('classList.add'),
          remove: jasmine.createSpy('classList.remove'),
          contains: jasmine.createSpy('classList.contains'),
          toggle: jasmine.createSpy('classList.toggle'),
          length: 0,
          item: jasmine.createSpy('classList.item'),
          toString: jasmine.createSpy('classList.toString'),
          entries: jasmine.createSpy('classList.entries'),
          forEach: jasmine.createSpy('classList.forEach'),
          keys: jasmine.createSpy('classList.keys'),
          values: jasmine.createSpy('classList.values')
        }
      }
    };

    const mockComponentRef: ComponentRef<MatSpinner> = ({
      location: elementRef,
      changeDetectorRef: jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']),
      hostView: null as any,
      instance: mockMatSpinnerInstance,
      injector: mockComponentInjector,
      onDestroy: null as any,
      destroy: () => {},
      componentType: MatSpinner
    } as unknown) as ComponentRef<MatSpinner>;

    mockComponentFactory = jasmine.createSpyObj<ComponentFactory<MatSpinner>>({
      create: mockComponentRef
    });

    mockComponentFactoryResolver = jasmine.createSpyObj<ComponentFactoryResolver>({
      resolveComponentFactory: mockComponentFactory
    });
    const mockInjector = jasmine.createSpyObj('Injector', {
      get: mockRenderer
    });

    await TestBed.configureTestingModule({
      providers: [
        { provide: ComponentFactoryResolver, useValue: mockComponentFactoryResolver },
        { provide: Injector, useValue: mockInjector },
        { provide: MatSpinner, useClass: MockMatSpinner },
        LoadingService
      ]
    }).compileComponents();

    service = TestBed.inject(LoadingService);
    document = TestBed.inject(DOCUMENT);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it(
    'should add CSS class to spinner',
    waitForAsync(() => {
      const testClass = 'test-class';

      service.addAnimationMode('indeterminate').addSpinnerOptions({ diameter: 42, strokeWidth: 6 }).addCssClasses([testClass]);

      service.showLoader();

      service.isLoading$.subscribe((isLoading) => {
        expect(isLoading).toBeTrue();
      });

      setTimeout(() => {
        if (service.spinnerComponentRef) {
          const spinnerElement = service.spinnerComponentRef.location.nativeElement;
          expect(spinnerElement.classList.add).toHaveBeenCalledWith(testClass);
          expect(spinnerElement.classList.contains(testClass)).toBeTrue();
        }
      }, 1000);
    })
  );
});
