import { Injectable } from '@angular/core';
import {Location} from '@angular/common';
import {ActivatedRouteSnapshot, CanDeactivate, Router, RouterStateSnapshot} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class CanDeactivateIssueGuard implements CanDeactivate<any> {
  constructor(private location: Location, private router: Router) {}

  canDeactivate(component: any, currentRoute: ActivatedRouteSnapshot, currentState: RouterStateSnapshot,
                nextState?: RouterStateSnapshot): boolean {

    if (component.canDeactivate && !component.canDeactivate() && nextState.url !== '/') {
      const currentUrlTree = this.router.createUrlTree([], currentRoute);
      const currentUrl = currentUrlTree.toString();
      this.location.go(currentUrl);
      return confirm('Are you sure you want to leave the page?\n\nYour unsaved changes will be discarded.');
    }
    return true;
  }
}
