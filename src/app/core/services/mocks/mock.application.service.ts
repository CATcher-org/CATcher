import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MockApplicationService {

  constructor() {
  }

  /**
   * Ensures that application is always 'Recent'.
   */
  isApplicationOutdated(): Observable<boolean> {
    return of(false);
  }
}
