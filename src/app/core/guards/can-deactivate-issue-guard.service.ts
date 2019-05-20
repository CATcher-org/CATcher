import { Injectable } from '@angular/core';
import {Location} from '@angular/common';
import {ActivatedRouteSnapshot, CanDeactivate, Router, RouterStateSnapshot} from '@angular/router';
import {MatDialog} from '@angular/material';
import {UserConfirmationComponent} from './user-confirmation/user-confirmation.component';
import {Observable, of} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CanDeactivateIssueGuard implements CanDeactivate<any> {
  constructor(private location: Location, private router: Router, private dialog: MatDialog) {}

  openDialog(): Observable<boolean> {
    const dialogRef = this.dialog.open(UserConfirmationComponent);
    return dialogRef.afterClosed();
  }

  canDeactivate(component: any, currentRoute: ActivatedRouteSnapshot, currentState: RouterStateSnapshot,
                nextState?: RouterStateSnapshot): Observable<boolean> {

    if (component.canDeactivate && !component.canDeactivate() && nextState.url !== '/') {
      const currentUrlTree = this.router.createUrlTree([], currentRoute);
      const currentUrl = currentUrlTree.toString();
      this.location.go(currentUrl);
      return this.openDialog();
    }
    return of(true);
  }

}
