import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { TopBarComponent } from './layout/topbar/top-bar.component';
import { AsyncPipe } from '@angular/common';
import { filter } from 'rxjs/operators';
import {QuickCartComponent} from '@shared/components/cart/quick-cart/quick-cart.component';
import {ManualQuickCartComponent} from '@shared/components/cart/manual-quick-cart/manual-quick-cart.component';
import {
  CartNotificationComponent
} from '@shared/components/notifications/cart-notification/cart-notification.component';
import {
  ManualNotificationComponent
} from '@shared/components/notifications/manual-notification/manual-notification.component';
import {SidebarService} from '@services/sidebar.service';
import {QuickCartService} from '@services/cart/quick-cart.service';
import {ManualQuickCartService} from '@services/cart/manual-quick-cart.service';
import {LoginModalService} from '@services/login-modal.service';
import {LoginModalComponent} from '@shared/components/modals/login-modal/login-modal.component';
import {AuthService} from '@core/auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    SidebarComponent,
    TopBarComponent,
    QuickCartComponent,
    ManualQuickCartComponent,
    CartNotificationComponent,
    ManualNotificationComponent,
    AsyncPipe,
    LoginModalComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'starlinger_inquiry_tool_client';
  currentRoute: string = '';
  isAuthenticated: boolean = false

  constructor(
    public sidebarService: SidebarService,
    public quickCartService: QuickCartService,
    public manualQuickCartService: ManualQuickCartService,
    private router: Router,
    public loginModalService: LoginModalService,
    private authService: AuthService
  ) {
    // Subscribe to router events to keep track of current route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentRoute = event.url;
    });

    // Initialize current route
    this.currentRoute = this.router.url;

    // Subscribe to authentication state changes
    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
    });
  }

  onViewCart(): void {
    this.quickCartService.hideNotification();
    this.quickCartService.open();
  }

  hideNotification(): void {
    this.quickCartService.hideNotification();
  }

  onViewInquiry(): void {
    this.manualQuickCartService.hideNotification();
    this.manualQuickCartService.open();
  }

  hideManualNotification(): void {
    this.manualQuickCartService.hideNotification();
  }

  // Check if current route is in the manual entry section
  isManualEntryRoute(): boolean {
    return this.currentRoute.includes('/manual-entry');
  }

  // Navigate to the appropriate cart based on current route
  navigateToCart(): void {
    if (this.isManualEntryRoute()) {
      this.router.navigate(['/manual-entry-cart']);
    } else {
      this.router.navigate(['/cart']);
    }
  }

  onLoginModalOpenChange(isOpen: boolean): void {
    if (!isOpen) {
      this.loginModalService.close();
    }
  }

  onLoginSuccess(): void {
    // Handle successful login - e.g., redirect to dashboard
    this.router.navigate(['/dashboard']);
  }

}
