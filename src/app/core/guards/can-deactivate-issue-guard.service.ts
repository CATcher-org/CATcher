import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRouteSnapshot, CanDeactivate, Router, RouterStateSnapshot } from '@angular/router';
import { DialogService } from '../services/dialog.service';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CanDeactivateIssueGuard implements CanDeactivate<any> {
  constructor(private location: Location, private router: Router,
              private dialogService: DialogService) {}

  /**
   * Makes the dialog visible to the user.
   * @return The Promise of a User Selected boolean.
   */
  openDialog(): Observable<boolean> {
    const dialogRef = this.dialogService.openUserConfirmationModal();
    return dialogRef.afterClosed();
  }

  canDeactivate(component: any, currentRoute: ActivatedRouteSnapshot,
                currentState: RouterStateSnapshot,
                nextState?: RouterStateSnapshot): Observable<boolean> {
    if (component.canDeactivate && !component.canDeactivate()
      && nextState.url !== '/') {
      const currentUrlTree =
        this.router.createUrlTree([], currentRoute);
      const currentUrl = currentUrlTree.toString();
      this.location.go(currentUrl);
      return this.openDialog();
    }
    return of(true);
  }

}
