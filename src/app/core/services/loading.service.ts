import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService implements OnDestroy {
  private _loading = new BehaviorSubject<boolean>(false);
  private readonly loading$ = this._loading.asObservable();

  constructor() {}

  ngOnDestroy(): void {
    this._loading.complete();
  }

  show(): Observable<boolean> {
    this._loading.next(true);
    return this.loading$;
  }

  hide(): Observable<boolean> {
    this._loading.next(false);
    return this.loading$;
  }
}
