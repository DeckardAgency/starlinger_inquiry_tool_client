import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '@core/auth/auth.service';
import { LoginModalService } from '@services/login-modal.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  constructor(
    private authService: AuthService,
    private router: Router,
    private loginModalService: LoginModalService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // First check if user is already authenticated
    if (this.authService.isAuthenticated()) {
      return true;
    }

    // Store the attempted URL for redirecting after login
    const returnUrl = state.url;
    this.loginModalService.setReturnUrl(returnUrl);

    // Delay opening the modal slightly to avoid showing it during page refresh
    // when authentication might still be in progress
    setTimeout(() => {
      if (!this.authService.isAuthenticated()) {
        this.loginModalService.open();
      }
    }, 100);

    // Return false to prevent navigation when not authenticated
    return false;
  }
}
