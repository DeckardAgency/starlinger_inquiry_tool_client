import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from '@env/environment';
import { BreadcrumbsComponent } from '@shared/components/ui/breadcrumbs/breadcrumbs.component';
import { CartService } from '@services/cart/cart.service';
import { QuickCartService } from '@services/cart/quick-cart.service';
import { Breadcrumb, CartItem } from '@core/models';
import { OrderResponse, OrderService } from '@services/http/order.service';
import { IconComponent } from '@shared/components/icon/icon.component';
import { AuthService } from '@core/auth/auth.service';
import { CartSwitcherComponent } from '@shared/components/cart-switcher/cart-switcher.component';

@Component({
    selector: 'app-cart',
    imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, BreadcrumbsComponent, IconComponent, CartSwitcherComponent],
    templateUrl: 'cart.component.html',
    styleUrls: ['cart.component.scss']
})
export class CartComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  cartSubtotal: number = 0;
  discountAmount: number = 0;
  shippingCost: number = 0;
  totalAmount: number = 0;
  isSubmitting: boolean = false;
  orderSuccess: boolean = false;
  orderError: string | null = null;
  orderResponse: OrderResponse | null = null;
  referenceNumber: string = '';

  private cartSubscription: Subscription | null = null;
  private currentUser: any = null;

  breadcrumbs: Breadcrumb[] = [
    { label: 'Cart' }
  ];

  constructor(
    private cartService: CartService,
    public quickCartService: QuickCartService,
    private orderService: OrderService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Subscribe to cart changes
    this.cartSubscription = this.cartService.getCartItems().subscribe(items => {
      this.cartItems = items;
      this.calculateTotals();
    });

    // Get shipping cost
    this.shippingCost = this.cartService.getShippingCost();

    // Get current user
    this.currentUser = this.authService.getCurrentUser();

    // If the user is not authenticated, redirect to login
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: '/cart' }
      });
    }
  }

  ngOnDestroy(): void {
    // Cleanup subscription
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  /**
   * Calculate all cart totals
   */
  calculateTotals(): void {
    // Calculate original subtotal
    this.cartSubtotal = this.cartItems.reduce(
      (total, item) => total + (item.product.clientPrice * item.quantity),
      0
    );

    // Calculate total with discount applied
    const discountedTotal = this.cartItems.reduce(
      (total, item) => total + (this.getDiscountedPrice(item.product.clientPrice) * item.quantity),
      0
    );

    // Calculate discount amount
    this.discountAmount = this.cartSubtotal - discountedTotal;

    // Calculate final total with shipping
    this.totalAmount = discountedTotal + this.shippingCost;
  }

  /**
   * Get the discounted price (20% off)
   */
  getDiscountedPrice(price: number): number {
    return price;
  }

  /**
   * Calculate the total for a specific item
   */
  getItemTotal(item: CartItem): number {
    return this.getDiscountedPrice(item.product.clientPrice) * item.quantity;
  }

  /**
   * Update quantity for a cart item
   */
  updateQuantity(productId: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const quantity = parseInt(input.value, 10);

    if (!isNaN(quantity) && quantity > 0) {
      this.cartService.updateQuantity(productId, quantity);
    }
  }

  /**
   * Increment quantity for an item
   */
  incrementQuantity(productId: string): void {
    const item = this.cartItems.find(item => item.product.id === productId);
    if (item) {
      this.cartService.updateQuantity(productId, item.quantity + 1);
    }
  }

  /**
   * Decrement quantity for an item
   */
  decrementQuantity(productId: string): void {
    const item = this.cartItems.find(item => item.product.id === productId);
    if (item && item.quantity > 1) {
      this.cartService.updateQuantity(productId, item.quantity - 1);
    }
  }

  /**
   * Remove an item from the cart
   */
  removeItem(productId: string): void {
    this.cartService.removeFromCart(productId);
  }

  /**
   * Clear the entire cart
   */
  clearCart(): void {
    this.cartService.clearCart();
  }

  /**
   * Proceed to check out by sending order to API
   */
  checkout(): void {
    if (this.isSubmitting || this.cartItems.length === 0) {
      return;
    }

    // Check if user is authenticated
    if (!this.currentUser || !this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: '/cart' }
      });
      return;
    }

    console.log('Proceeding to checkout with items:', this.cartItems);
    console.log(this.currentUser);

    this.isSubmitting = true;
    this.orderError = null;

    // For this example, using static addresses
    // In a real application, you would get these from a form or user profile
    const shippingAddress = "444 Main Street, Anytown, ST 12345";
    const billingAddress = "444 Main Street, Anytown, ST 12345";

    // Use the OrderService to create the order with user ID
    this.orderService.createOrder(
      this.cartItems,
      shippingAddress,
      billingAddress,
      this.referenceNumber || 'Order from cart',  // Use the reference number as notes
      this.currentUser.id  // Pass the user ID
    )
      .subscribe({
        next: (response) => {
          console.log('Order created successfully:', response);
          this.orderResponse = response;
          this.orderSuccess = true;
          this.isSubmitting = false;

          // Clear the cart after a successful order
          this.cartService.clearCart();

          // Redirect to order confirmation page
          this.router.navigate(['/order-confirmation'], {
            queryParams: { orderId: response.id, orderNumber: response.orderNumber }
          });
        },
        error: (error) => {
          console.error('Error creating order:', error);
          this.orderError = error.message || 'Failed to create order. Please try again.';
          this.isSubmitting = false;
        }
      });
  }

  protected readonly environment = environment;

  /**
   * Save the current cart as a draft order
   */
  saveDraft(): void {
    if (this.isSubmitting || this.cartItems.length === 0) {
      return;
    }

    // Check if the user is authenticated
    if (!this.currentUser || !this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: '/cart' }
      });
      return;
    }

    this.isSubmitting = true;
    this.orderError = null;

    // For this example, using static addresses
    const shippingAddress = "444 Main Street, Anytown, ST 12345";
    const billingAddress = "444 Main Street, Anytown, ST 12345";

    // Use the OrderService to create the draft order
    this.orderService.saveDraft(
      this.cartItems,
      shippingAddress,
      billingAddress,
      this.referenceNumber || 'Draft order',
      this.currentUser.id
    )
      .subscribe({
        next: (response) => {
          console.log('Draft saved successfully:', response);
          this.orderResponse = response;
          this.isSubmitting = false;

          // Show notification
          this.cartService.showNotification('Order saved as draft successfully!', 'success');
        },
        error: (error) => {
          console.error('Error saving draft:', error);
          this.orderError = error.message || 'Failed to save draft. Please try again.';
          this.isSubmitting = false;

          // Show error notification
          this.cartService.showNotification('Error saving draft. Please try again.', 'remove');
        }
      });
  }

}
