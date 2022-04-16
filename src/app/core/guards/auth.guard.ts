import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanLoad, Route, Router, RouterStateSnapshot, UrlSegment } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, first, map, single, tap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanLoad {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (this.auth.isProcessingAutoLogin.getValue()) {
      return this.auth.isProcessingAutoLogin.pipe(
        filter((val) => !val), // wait until it is no longer processing,
        first(),
        map(() => this.auth.isAuthenticated()),
        tap((isAuth) => {
          if (!isAuth) {
            this.router.navigate(['']);
          }
        })
      );
    }
    if (this.auth.isAuthenticated()) {
      return true;
    } else {
      this.router.navigate(['']);
      return false;
    }
  }

  canLoad(route: Route, segments: UrlSegment[]): Observable<boolean> | Promise<boolean> | boolean {
    if (this.auth.isProcessingAutoLogin.getValue()) {
      return this.auth.isProcessingAutoLogin.pipe(
        single((val) => !val), // wait until it is no longer processing,
        map(() => this.auth.isAuthenticated()),
        tap((isAuth) => {
          if (!isAuth) {
            this.router.navigate(['']);
          }
        })
      );
    }
    if (this.auth.isAuthenticated()) {
      return true;
    } else {
      this.router.navigate(['']);
      return false;
    }
  }
}
