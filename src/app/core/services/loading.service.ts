import { Platform } from '@angular/cdk/platform';
import { Injectable, OnDestroy } from '@angular/core';
import { ElementRef } from '@angular/core';
import { MatProgressSpinnerDefaultOptions, MatSpinner } from '@angular/material/progress-spinner';
import { BehaviorSubject, Observable } from 'rxjs';

// Use a builder pattern to build the type of spinner we want our
// loading spinner to display

@Injectable({
  providedIn: 'root'
})
export class LoadingService implements OnDestroy {
  private isLoading = new BehaviorSubject<boolean>(false);
  public readonly isLoading$ = this.isLoading.asObservable();
  private platform: Platform;
  private spinnerRef: MatSpinner = null;
  private elementRef: ElementRef<HTMLElement> = new ElementRef(document.body);
  private animationMode = 'indeterminate';
  private options?: MatProgressSpinnerDefaultOptions;

  constructor(platform: Platform) {
    this.platform = platform;
    this.buildSpinner();
  }

  ngOnDestroy(): void {
    this.isLoading.complete();
  }

  addAnimationMode(animationMode: string) {
    this.animationMode = animationMode;
    return this;
  }

  addSpinnerOptions(options: MatProgressSpinnerDefaultOptions) {
    this.options = options;
    return this;
  }

  addElementRef(elementRef: ElementRef<HTMLElement>) {
    this.elementRef = elementRef;
    return this;
  }

  buildSpinner() {
    this.spinnerRef = new MatSpinner(this.elementRef, this.platform, null, this.animationMode, this.options);
    return this;
  }

  getSpinnerRef() {
    return this.spinnerRef;
  }

  showLoader(): Observable<boolean> {
    this.isLoading.next(true);
    return this.isLoading$;
  }

  hideLoader(): Observable<boolean> {
    this.isLoading.next(false);
    return this.isLoading$;
  }
}

// <ng-container *ngIf="spinnerRef">{{ spinnerRef }}</ng-container>
