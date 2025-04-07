import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BreadcrumbsComponent, Breadcrumb } from '../components/breadcrumbs/breadcrumbs.component';
import { CartService, CartItem } from '../services/cart.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, BreadcrumbsComponent],
  templateUrl: 'cart.component.html',
  styleUrls: ['cart.component.scss']
})
export class CartComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  cartSubtotal: number = 0;
  discountAmount: number = 0;
  shippingCost: number = 0;
  totalAmount: number = 0;

  private cartSubscription: Subscription | null = null;

  breadcrumbs: Breadcrumb[] = [
    { label: 'Home', link: '/' },
    { label: 'Cart' }
  ];

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    // Subscribe to cart changes
    this.cartSubscription = this.cartService.getCartItems().subscribe(items => {
      this.cartItems = items;
      this.calculateTotals();
    });

    // Get shipping cost
    this.shippingCost = this.cartService.getShippingCost();
  }

  ngOnDestroy(): void {
    // Clean up subscription
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
      (total, item) => total + (item.product.price * item.quantity),
      0
    );

    // Calculate total with discount applied
    const discountedTotal = this.cartItems.reduce(
      (total, item) => total + (this.getDiscountedPrice(item.product.price) * item.quantity),
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
    return price * 0.8;
  }

  /**
   * Calculate the total for a specific item
   */
  getItemTotal(item: CartItem): number {
    return this.getDiscountedPrice(item.product.price) * item.quantity;
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
   * Proceed to checkout
   */
  checkout(): void {
    // This would typically navigate to a checkout page or process
    console.log('Proceeding to checkout with items:', this.cartItems);
    // You could add router navigation here
  }
}
