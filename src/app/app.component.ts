import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { TopBarComponent } from './layout/topbar/top-bar.component';
import { SidebarService } from './services/sidebar.service';
import { QuickCartService } from './services/quick-cart.service';
import { AsyncPipe } from '@angular/common';
import { QuickCartComponent } from './components/quick-cart/quick-cart.component';
import { ManualQuickCartComponent } from './components/manual-quick-cart/manual-quick-cart.component';
import { CartNotificationComponent } from './components/cart-notification/cart-notification.component';
import { ManualNotificationComponent } from './components/manual-notification/manual-notification.component';
import { ManualQuickCartService } from './services/manual-quick-cart.service';
import { filter } from 'rxjs/operators';

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
    AsyncPipe
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'starlinger_inquiry_tool_client';
  currentRoute: string = '';

  constructor(
    public sidebarService: SidebarService,
    public quickCartService: QuickCartService,
    public manualQuickCartService: ManualQuickCartService,
    private router: Router
  ) {
    // Subscribe to router events to keep track of current route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentRoute = event.url;
    });

    // Initialize current route
    this.currentRoute = this.router.url;
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
}
