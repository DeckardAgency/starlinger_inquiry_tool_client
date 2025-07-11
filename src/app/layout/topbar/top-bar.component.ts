import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import {SearchComponent} from '@shared/components/ui/search/search.component';
import {CartService} from '@services/cart/cart.service';
import {QuickCartService} from '@services/cart/quick-cart.service';
import {ManualCartService} from '@services/cart/manual-cart.service';
import {ManualQuickCartService} from '@services/cart/manual-quick-cart.service';
import {MobileMenuService} from '@services/mobile-menu.service';

@Component({
    selector: 'app-top-bar',
    imports: [SearchComponent],
    templateUrl: './top-bar.component.html',
    styleUrls: ['./top-bar.component.scss']
})
export class TopBarComponent implements OnInit {
  currentRoute: string = '';

  constructor(
    public cartService: CartService,
    public quickCartService: QuickCartService,
    public manualCartService: ManualCartService,
    public manualQuickCartService: ManualQuickCartService,
    private router: Router,
    private mobileMenuService: MobileMenuService
  ) {}

  ngOnInit(): void {
    // Subscribe to router events to keep track of the current route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentRoute = event.url;
    });

    // Initialize current route
    this.currentRoute = this.router.url;
  }

  toggleCart() {
    // Determine which cart to toggle based on the current route
    if (this.isManualEntryRoute()) {
      this.manualQuickCartService.toggle();
    } else {
      this.quickCartService.toggle();
    }
  }

  navigateToCart() {
    // Navigate to the appropriate cart based on the current route
    if (this.isManualEntryRoute()) {
      this.router.navigate(['/manual-entry-cart']);
    } else {
      this.router.navigate(['/cart']);
    }
  }

  // Helper method to check if current route is in the manual entry section
  private isManualEntryRoute(): boolean {
    return this.currentRoute.includes('/manual-entry');
  }

  // Get total cart items based on current route
  getTotalItems(): number {
    if (this.isManualEntryRoute()) {
      // For manual cart, we'll count each part as 1 item
      // You may need to subscribe and store the value if using Observable
      let count = 0;
      this.manualCartService.getCartCount().subscribe(value => {
        count = value;
      });
      return count;
    } else {
      return this.quickCartService.getTotalItems();
    }
  }

  toggleMobileMenu(): void {
    this.mobileMenuService.toggle();
  }
}
