import { DOCUMENT } from '@angular/common';
import { ComponentRef, ElementRef, Injector, Renderer2, ViewContainerRef } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { LoadingService } from '../../src/app/core/services/loading.service';
import { MockMatSpinner } from '../helper/mock.mat.spinner';
import { MockViewContainerRef } from '../helper/mock.view.container.ref';

describe('LoadingService', () => {
  let mockMatSpinnerInstance: MockMatSpinner;
  let mockRenderer: jasmine.SpyObj<Renderer2>;
  let mockComponentInjector: jasmine.SpyObj<Injector>;
  let elementRef: ElementRef;
  let mockComponentRef: ComponentRef<MatProgressSpinner>;
  let mockInjector: jasmine.SpyObj<Injector>;
  let loadingService: LoadingService;
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
      componentType: MatProgressSpinner
    } as unknown) as ComponentRef<MatProgressSpinner>;

    mockInjector = jasmine.createSpyObj('Injector', {
      get: mockRenderer
    });

    mockViewContainerRef = new MockViewContainerRef(mockInjector);
    spyOn(mockViewContainerRef, 'createComponent').and.returnValue(mockComponentRef);

    await TestBed.configureTestingModule({
      providers: [
        { provide: ViewContainerRef, useValue: mockViewContainerRef },
        { provide: Injector, useValue: mockInjector },
        { provide: MatProgressSpinner, useClass: MockMatSpinner },
        LoadingService
      ]
    }).compileComponents();

    loadingService = TestBed.inject(LoadingService);
    document = TestBed.inject(DOCUMENT);
  });

  describe('.new()', () => {
    it('should create a new loading service', () => {
      expect(loadingService).toBeTruthy();
    });
  });

  describe('.addCssClasses()', () => {
    it(
      'should add CSS Classes to the spinner reference',
      waitForAsync(() => {
        const testClassList = ['test-class-1', 'test-class-2', 'test-class-3'];

        loadingService.addCssClasses(testClassList);

        loadingService.showLoader();

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
  });

  describe('.addAnimationMode()', () => {
    it(
      'should add an animation mode to the spinner reference',
      waitForAsync(() => {
        loadingService.addAnimationMode('determinate');

        loadingService.showLoader();

        expect(loadingService.spinnerComponentRef).not.toBeNull();
        if (loadingService.spinnerComponentRef) {
          const spinnerRef = loadingService.spinnerComponentRef;
          expect(spinnerRef.instance.mode).toEqual('determinate');
        }
      })
    );
  });

  describe('.addSpinnerOptions()', () => {
    it(
      'should add a diameter to the spinner reference',
      waitForAsync(() => {
        const testDiameter = 20;
        loadingService.addSpinnerOptions({ diameter: testDiameter });

        loadingService.showLoader();

        expect(loadingService.spinnerComponentRef).not.toBeNull();
        if (loadingService.spinnerComponentRef) {
          const spinnerRef = loadingService.spinnerComponentRef;
          expect(spinnerRef.instance.diameter).toEqual(testDiameter);
        }
      })
    );

    it(
      'should add stroke width to the spinner reference',
      waitForAsync(() => {
        const testStrokeWidth = 20;
        loadingService.addSpinnerOptions({ strokeWidth: testStrokeWidth });

        loadingService.showLoader();

        expect(loadingService.spinnerComponentRef).not.toBeNull();
        if (loadingService.spinnerComponentRef) {
          const spinnerRef = loadingService.spinnerComponentRef;
          expect(spinnerRef.instance.strokeWidth).toEqual(testStrokeWidth);
        }
      })
    );
  });

  describe('.addTheme()', () => {
    it(
      'should add a theme to the spinner reference',
      waitForAsync(() => {
        const testTheme = 'accent';
        loadingService.addTheme(testTheme);

        loadingService.showLoader();

        expect(loadingService.spinnerComponentRef).not.toBeNull();
        if (loadingService.spinnerComponentRef) {
          const spinnerRef = loadingService.spinnerComponentRef;
          expect(spinnerRef.instance.color).toEqual(testTheme);
        }
      })
    );
  });

  describe('.hideLoader()', () => {
    it(
      'should remove the spinner',
      waitForAsync(() => {
        loadingService.showLoader();

        expect(loadingService.spinnerComponentRef).not.toBeNull();

        loadingService.hideLoader();

        expect(loadingService.spinnerComponentRef).toBeNull();
      })
    );
  });

  describe('.addViewContainerRef()', () => {
    it(
      'should add the view container ref',
      waitForAsync(() => {
        loadingService.addViewContainerRef(mockViewContainerRef);

        expect(loadingService.spinnerContainerRef).not.toBeNull();

        expect(loadingService.spinnerContainerRef).toEqual(mockViewContainerRef);

        loadingService.showLoader();

        expect(mockViewContainerRef._views.length).toBe(1);

        expect(mockViewContainerRef._views[0]).toEqual(loadingService.spinnerComponentRef?.hostView);
      })
    );

    it(
      'should remove the spinner from the view container ref',
      waitForAsync(() => {
        loadingService.hideLoader();

        expect(mockViewContainerRef._views.length).toBe(0);

        expect(loadingService.spinnerComponentRef).toBeNull();
      })
    );
  });

  describe('.ngOnDestroy()', () => {
    it(
      'destroy existing subscriptions and reset spinner refs',
      waitForAsync(() => {
        loadingService.addViewContainerRef(mockViewContainerRef);

        loadingService.showLoader();

        loadingService.ngOnDestroy();

        expect(loadingService.spinnerComponentRef).toBeNull();

        expect(loadingService.spinnerContainerRef).toBeNull();
      })
    );
  });
});
