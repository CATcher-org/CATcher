import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { DialogService } from '../services/dialog.service';

@Injectable({
  providedIn: 'root'
})
export class CanDeactivateIssueGuard implements CanDeactivate<any> {

  // Messages for the modal dialog view
  private readonly modalDialogMessages = ["Do you wish to leave the page?", "You have unsaved changes that will be discarded."];
  private readonly yesButtonDialogMessage = "Yes, I wish to leave";
  private readonly noButtonDialogMessage = "No, I don't wish to leave";

  constructor(private location: Location, private router: Router,
              private dialogService: DialogService) {}

  /**
   * Makes the dialog visible to the user.
   * @return The Promise of a User Selected boolean.
   */
  openDialog(): Observable<boolean> {
    const dialogRef = this.dialogService.openUserConfirmationModal(
      this.modalDialogMessages, this.yesButtonDialogMessage, this.noButtonDialogMessage);

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
