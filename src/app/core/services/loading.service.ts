import { DOCUMENT } from '@angular/common';
import {
  ComponentFactory,
  ComponentFactoryResolver,
  ComponentRef,
  Inject,
  Injectable,
  Injector,
  OnDestroy,
  Renderer2,
  ViewContainerRef
} from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { MatProgressSpinnerDefaultOptions, MatSpinner, ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { BehaviorSubject } from 'rxjs';
import { pairwise } from 'rxjs/operators';

// Use a builder pattern to build the type of spinner we want our
// loading spinner to display. This listens to prompts given by components
// to either display or hide the spinner, by inserting it directly into the
// container that it has to be inserted into.
@Injectable({
  providedIn: 'root'
})
export class LoadingService implements OnDestroy {
  private isLoading = new BehaviorSubject<boolean>(false);
  readonly spinnerFactory: ComponentFactory<MatSpinner>;
  spinnerContainerRef: ViewContainerRef | null = null;
  spinnerComponentRef: ComponentRef<MatSpinner> | null = null;

  private animationMode: ProgressSpinnerMode = 'indeterminate';
  private options?: MatProgressSpinnerDefaultOptions;
  private spinnerTheme: ThemePalette = 'primary';
  private classList: string[] = [];

  constructor(
    readonly componentFactoryResolver: ComponentFactoryResolver,
    readonly injector: Injector,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.spinnerFactory = this.componentFactoryResolver.resolveComponentFactory(MatSpinner);
    // Subscribe to changes
    this.isLoading
      .pipe(pairwise())
      .subscribe(([previousIsLoading, currentIsLoading]) => this.onIsLoadingChange(previousIsLoading, currentIsLoading));
  }

  ngOnDestroy(): void {
    this.isLoading.complete();
    this.detachSpinnerFromDom();
    this.spinnerContainerRef = null;
  }

  addAnimationMode(animationMode: ProgressSpinnerMode) {
    this.animationMode = animationMode;
    return this;
  }

  addSpinnerOptions(options: MatProgressSpinnerDefaultOptions) {
    this.options = options;
    return this;
  }

  addViewContainerRef(spinnerContainerRef: ViewContainerRef) {
    if (spinnerContainerRef === undefined) {
      return this;
    }
    this.spinnerContainerRef = spinnerContainerRef;
    return this;
  }

  addTheme(theme: ThemePalette) {
    this.spinnerTheme = theme;
    return this;
  }

  addCssClasses(classNames: string[]) {
    this.classList = [];
    this.classList.push(...classNames);
    return this;
  }

  showLoader(): void {
    this.isLoading.next(true);
  }

  hideLoader(): void {
    this.isLoading.next(false);
  }

  // Event listener that attaches or detaches the spinner from
  // the DOM based on
  private onIsLoadingChange(previousIsLoading: boolean, currentIsLoading: boolean): void {
    // No change, don't edit the dom
    if (previousIsLoading === currentIsLoading) {
      return;
    }

    if (currentIsLoading) {
      return this.attachSpinnerToDom();
    }

    return this.detachSpinnerFromDom();
  }

  // Attaches spinner to the DOM
  private attachSpinnerToDom(): void {
    if (this.spinnerComponentRef !== null) {
      return;
    }

    const injector = this.getInjector();

    const spinnerRef = this.createSpinner(injector);

    if (!this.isAttachableToDocument()) {
      this.spinnerContainerRef.insert(spinnerRef.hostView);
    } else if (spinnerRef.location.nativeElement instanceof Node) {
      this.document.body.appendChild(spinnerRef.location.nativeElement);
    }

    spinnerRef.changeDetectorRef.detectChanges();

    this.spinnerComponentRef = spinnerRef;
  }

  // Detaches spinner from DOM
  private detachSpinnerFromDom(): void {
    if (this.spinnerComponentRef === null) {
      return;
    }

    if (!this.isAttachableToDocument()) {
      this.spinnerContainerRef.remove();
    } else if (this.spinnerComponentRef.location.nativeElement instanceof Node) {
      this.document.body.removeChild(this.spinnerComponentRef.location.nativeElement);
    }

    this.spinnerComponentRef.destroy();
    this.spinnerComponentRef = null;
    return;
  }

  // Gets the Injector to be used to create the spinner
  private getInjector(): Injector {
    if (this.isAttachableToDocument()) {
      return this.injector;
    }
    return this.spinnerContainerRef.injector;
  }

  // Checks if the spinner is to be attached to the Document or a
  // container
  private isAttachableToDocument(): boolean {
    return this.spinnerContainerRef === null;
  }

  // Creates and formats the spinner to the specification provided
  private createSpinner(injector: Injector) {
    const spinnerRef = this.spinnerFactory.create(injector);
    if (this.options) {
      spinnerRef.instance.diameter = this.options.diameter;
      spinnerRef.instance.strokeWidth = this.options.strokeWidth;
    }
    spinnerRef.instance.mode = this.animationMode;
    spinnerRef.instance.color = this.spinnerTheme;
    const renderer = spinnerRef.injector.get(Renderer2);
    for (const classname of this.classList) {
      renderer.addClass(spinnerRef.location.nativeElement, classname);
    }
    return spinnerRef;
  }
}
