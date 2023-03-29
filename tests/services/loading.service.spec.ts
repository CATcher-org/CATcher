import { DOCUMENT } from '@angular/common';
import { ComponentFactory, ComponentFactoryResolver, ComponentRef, ElementRef, Injector, Renderer2, ViewContainerRef } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { MatSpinner } from '@angular/material/progress-spinner';
import { take } from 'rxjs/operators';
import { LoadingService } from '../../src/app/core/services/loading.service';
import { MockMatSpinner } from '../helper/mock.mat.spinner';
import { MockViewContainerRef } from '../helper/mock.view.container.ref';

describe('LoadingService', () => {
  let mockMatSpinnerInstance: MockMatSpinner;
  let mockRenderer: jasmine.SpyObj<Renderer2>;
  let mockComponentInjector: jasmine.SpyObj<Injector>;
  let elementRef: ElementRef;
  let mockComponentRef: ComponentRef<MatSpinner>;
  let mockInjector: jasmine.SpyObj<Injector>;
  let loadingService: LoadingService;
  let mockComponentFactory: jasmine.SpyObj<ComponentFactory<MatSpinner>>;
  let mockComponentFactoryResolver: jasmine.SpyObj<ComponentFactoryResolver>;
  let mockViewContainerRef: MockViewContainerRef;
  let document: Document;

  beforeEach(async () => {
    mockMatSpinnerInstance = new MockMatSpinner();

    mockRenderer = jasmine.createSpyObj<Renderer2>('Renderer2', ['createElement', 'appendChild', 'setStyle', 'addClass']);
    mockRenderer.addClass.and.callFake((el: any, className: string) => {
      // Simulate adding the class by appending it to the element's classList
      el.classList.add(className);
    });

    mockComponentInjector = jasmine.createSpyObj('Injector', {
      get: mockRenderer
    });

    elementRef = {
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

    mockComponentRef = ({
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
    mockInjector = jasmine.createSpyObj('Injector', {
      get: mockRenderer
    });

    mockViewContainerRef = new MockViewContainerRef(mockInjector);

    await TestBed.configureTestingModule({
      providers: [
        { provide: ComponentFactoryResolver, useValue: mockComponentFactoryResolver },
        { provide: Injector, useValue: mockInjector },
        { provide: MatSpinner, useClass: MockMatSpinner },
        LoadingService
      ]
    }).compileComponents();

    loadingService = TestBed.inject(LoadingService);
    document = TestBed.inject(DOCUMENT);
  });

  it('should create', () => {
    expect(loadingService).toBeTruthy();
  });

  it(
    'should add CSS class to spinner',
    waitForAsync(() => {
      const testClassList = ['test-class-1', 'test-class-2', 'test-class-3'];

      loadingService.addCssClasses(testClassList);

      loadingService.showLoader();

      loadingService.isLoading$.pipe(take(1)).subscribe((isLoading) => {
        expect(isLoading).toBeTrue();
      });

      expect(loadingService.spinnerComponentRef).not.toBeNull();
      if (loadingService.spinnerComponentRef) {
        const spinnerElement = loadingService.spinnerComponentRef.location.nativeElement;
        expect(spinnerElement.classList.add).toHaveBeenCalledTimes(testClassList.length);
        for (const className of testClassList) {
          expect(spinnerElement.classList.add).toHaveBeenCalledWith(className);
        }
      }
    })
  );

  it(
    'should add animation mode to spinner',
    waitForAsync(() => {
      loadingService.addAnimationMode('determinate');

      loadingService.showLoader();

      loadingService.isLoading$.pipe(take(1)).subscribe((isLoading) => {
        expect(isLoading).toBeTrue();
      });

      expect(loadingService.spinnerComponentRef).not.toBeNull();
      if (loadingService.spinnerComponentRef) {
        const spinnerRef = loadingService.spinnerComponentRef;
        expect(spinnerRef.instance.mode).toEqual('determinate');
      }
    })
  );

  it(
    'should add spinner options diameter to spinner',
    waitForAsync(() => {
      const testDiameter = 20;
      loadingService.addSpinnerOptions({ diameter: testDiameter });

      loadingService.showLoader();

      loadingService.isLoading$.pipe(take(1)).subscribe((isLoading) => {
        expect(isLoading).toBeTrue();
      });

      expect(loadingService.spinnerComponentRef).not.toBeNull();
      if (loadingService.spinnerComponentRef) {
        const spinnerRef = loadingService.spinnerComponentRef;
        expect(spinnerRef.instance.diameter).toEqual(testDiameter);
      }
    })
  );

  it(
    'should add spinner options strokeWidth to spinner',
    waitForAsync(() => {
      const testStrokeWidth = 20;
      loadingService.addSpinnerOptions({ strokeWidth: testStrokeWidth });

      loadingService.showLoader();

      loadingService.isLoading$.pipe(take(1)).subscribe((isLoading) => {
        expect(isLoading).toBeTrue();
      });

      expect(loadingService.spinnerComponentRef).not.toBeNull();
      if (loadingService.spinnerComponentRef) {
        const spinnerRef = loadingService.spinnerComponentRef;
        expect(spinnerRef.instance.strokeWidth).toEqual(testStrokeWidth);
      }
    })
  );

  it(
    'should add a theme to spinner',
    waitForAsync(() => {
      const testTheme = 'accent';
      loadingService.addTheme(testTheme);

      loadingService.showLoader();

      loadingService.isLoading$.pipe(take(1)).subscribe((isLoading) => {
        expect(isLoading).toBeTrue();
      });

      expect(loadingService.spinnerComponentRef).not.toBeNull();
      if (loadingService.spinnerComponentRef) {
        const spinnerRef = loadingService.spinnerComponentRef;
        expect(spinnerRef.instance.color).toEqual(testTheme);
      }
    })
  );

  it(
    'should remove the spinner',
    waitForAsync(() => {
      loadingService.showLoader();

      loadingService.isLoading$.pipe(take(1)).subscribe((isLoading) => {
        expect(isLoading).toBeTrue();
      });

      expect(loadingService.spinnerComponentRef).not.toBeNull();

      loadingService.hideLoader();

      loadingService.isLoading$.subscribe((isLoading) => {
        expect(isLoading).toBeFalse();
      });

      expect(loadingService.spinnerComponentRef).toBeNull();
    })
  );

  it(
    'should add the view container ref',
    waitForAsync(() => {
      loadingService.addViewContainerRef(mockViewContainerRef);

      expect(loadingService.spinnerContainerRef).not.toBeNull();

      expect(loadingService.spinnerContainerRef).toEqual(mockViewContainerRef);

      loadingService.showLoader();

      loadingService.isLoading$.pipe(take(1)).subscribe((isLoading) => {
        expect(isLoading).toBeTrue();
      });

      expect(mockViewContainerRef._views.length).toBe(1);

      expect(mockViewContainerRef._views[0]).toEqual(loadingService.spinnerComponentRef?.hostView);

      loadingService.hideLoader();

      loadingService.isLoading$.pipe(take(1)).subscribe((isLoading) => {
        expect(isLoading).toBeFalse();
      });

      expect(mockViewContainerRef._views.length).toBe(0);

      expect(loadingService.spinnerComponentRef).toBeNull();
    })
  );

  it(
    'destroy existing subscriptions and reset spinner refs',
    waitForAsync(() => {
      loadingService.addViewContainerRef(mockViewContainerRef);

      loadingService.showLoader();

      loadingService.isLoading$.pipe(take(1)).subscribe((isLoading) => {
        expect(isLoading).toBeTrue();
      });

      let hasCompleted = false;

      loadingService.isLoading$.subscribe({
        next: () => {},
        error: () => {},
        complete: () => {
          hasCompleted = true;
        }
      });

      loadingService.ngOnDestroy();

      expect(hasCompleted).toBeTrue();

      expect(loadingService.spinnerComponentRef).toBeNull();

      expect(loadingService.spinnerContainerRef).toBeNull();
    })
  );
});