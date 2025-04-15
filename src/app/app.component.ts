import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
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

  constructor(
    public sidebarService: SidebarService,
    public quickCartService: QuickCartService,
    public manualQuickCartService: ManualQuickCartService
  ) {}

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
}
