import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { TopBarComponent } from './layout/topbar/top-bar.component';
import { SidebarService } from './services/sidebar.service';
import { QuickCartService } from './services/quick-cart.service';
import { AsyncPipe } from '@angular/common';
import { QuickCartComponent } from './components/quick-cart/quick-cart.component';
import { CartNotificationComponent } from './components/cart-notification/cart-notification.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    SidebarComponent,
    TopBarComponent,
    QuickCartComponent,
    CartNotificationComponent,
    AsyncPipe
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'starlinger_inquiry_tool_client';

  constructor(
    public sidebarService: SidebarService,
    public quickCartService: QuickCartService
  ) {}

  onViewCart(): void {
    this.quickCartService.hideNotification();
    this.quickCartService.open();
  }

  hideNotification(): void {
    this.quickCartService.hideNotification();
  }
}
