import { Injectable } from '@angular/core';
import {Location} from '@angular/common';
import {ActivatedRouteSnapshot, CanDeactivate, Router, RouterStateSnapshot} from '@angular/router';
import {DescriptionComponent} from '../../shared/issue/description/description.component';

@Injectable({
  providedIn: 'root'
})
export class CanDeactivateIssueGuard implements CanDeactivate<DescriptionComponent> {
  constructor(private location: Location, private router: Router) {}

  canDeactivate(component: DescriptionComponent, currentRoute: ActivatedRouteSnapshot, currentState: RouterStateSnapshot,
                nextState?: RouterStateSnapshot): boolean {

    if (component.isEditing && nextState.url !== '/') {
      const currentUrlTree = this.router.createUrlTree([], currentRoute);
      const currentUrl = currentUrlTree.toString();
      this.location.go(currentUrl);
      return confirm('Are you sure you want to leave the page?\n\nYour unsaved changes will be discarded.');
    }
    return true;
  }
}
