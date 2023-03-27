import { DOCUMENT } from '@angular/common';
import { ComponentFactory, ComponentFactoryResolver, ComponentRef, ElementRef, Injector, Renderer2, ViewContainerRef } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { MatSpinner } from '@angular/material/progress-spinner';
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

    const mockComponentRef: ComponentRef<MatSpinner> = ({
      location: new ElementRef(null),
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
    'should show and hide loader',
    waitForAsync(() => {
      const mockContainerRef = jasmine.createSpyObj<ViewContainerRef>('ViewContainerRef', ['insert']);
      const mockSpinnerComponentRef = jasmine.createSpyObj<ComponentRef<MatSpinner>>('ComponentRef', ['destroy']);

      service.addViewContainerRef(mockContainerRef);
      service.showLoader();

      service.isLoading$.subscribe((isLoading) => {
        expect(isLoading).toBeTrue();
      });

      setTimeout(() => {
        service.spinnerComponentRef = mockSpinnerComponentRef;
        service.hideLoader();

        service.isLoading$.subscribe((isLoading) => {
          expect(isLoading).toBeFalse();
        });

        expect(mockSpinnerComponentRef.destroy).toHaveBeenCalled();
      }, 1000);
    })
  );

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
          expect(spinnerElement.classList.contains(testClass)).toBeTrue();
        }
      }, 1000);
    })
  );
});
