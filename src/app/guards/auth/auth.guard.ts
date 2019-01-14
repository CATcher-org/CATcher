import { Injectable } from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from '@angular/router';
import { Observable } from 'rxjs';
import {AuthService} from '../../services/auth/auth.service';
import {ElectronService} from '../../services/electron.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private auth: AuthService, private router: Router, private electronService: ElectronService) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    if (this.auth.isAuthenticated()) {
      return true;
    }

    const currentUrl = this.electronService.getCurrentUrl();

    if (currentUrl.includes('callback')) {
      this.auth.handleCallback(currentUrl).then((value) => {
        this.router.navigate(['/']);
      }).catch((error) => {
        this.router.navigate(['/login']);
      });
    } else {
      this.router.navigate(['/login']);
    }
    return false;
  }
}
