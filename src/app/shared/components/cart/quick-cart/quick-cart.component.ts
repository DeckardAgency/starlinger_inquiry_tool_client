import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import {CartItem} from '@models/cart-item.model';
import {QuickCartService} from '@services/cart/quick-cart.service';
import { environment } from '@env/environment';

@Component({
  selector: 'app-quick-cart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quick-cart.component.html',
  styleUrls: ['./quick-cart.component.scss']
})
export class QuickCartComponent implements OnInit, OnDestroy {
  @Input() isOpen = false;
  cartItems$: Observable<CartItem[]> = new Observable<CartItem[]>();

  // Track total price from cart service
  private totalPrice: number = 0;
  private cartItems: CartItem[] = [];
  private subscriptions: Subscription[] = [];

  constructor(
    public quickCartService: QuickCartService
  ) {}

  ngOnInit(): void {
    // Initialize the observable in ngOnInit to avoid the "used before initialization" error
    this.cartItems$ = this.quickCartService.cartItems$;

    // Subscribe to the final total with shipping
    this.subscriptions.push(
      this.quickCartService.cartService.getFinalTotal().subscribe(total => {
        this.totalPrice = total;
      })
    );

    // Also subscribe to cart items for our calculation backup
    this.subscriptions.push(
      this.quickCartService.cartItems$.subscribe(items => {
        this.cartItems = items;
      })
    );
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  onClose(): void {
    this.quickCartService.close();
  }

  incrementItemQuantity(productId: string, currentQuantity: number): void {
    this.quickCartService.updateItemQuantity(productId, currentQuantity + 1);
  }

  decrementItemQuantity(productId: string, currentQuantity: number): void {
    if (currentQuantity > 1) {
      this.quickCartService.updateItemQuantity(productId, currentQuantity - 1);
    }
  }

  updateItemQuantity(productId: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const quantity = parseInt(input.value, 10);

    if (!isNaN(quantity) && quantity >= 1) {
      this.quickCartService.updateItemQuantity(productId, quantity);
    }
  }

  removeItem(productId: string): void {
    this.quickCartService.removeFromCart(productId);
  }

  // Calculate item price with discount
  calculateItemPrice(price: number, quantity: number): number {
    // Apply 20% discount
    const discountedPrice = price * 0.8;
    return discountedPrice * quantity;
  }

  // Calculate total price including shipping
  calculateTotal(): string {
    // Get cart items to ensure we're working with the actual data
    let itemTotal = 0;

    // Calculate manually if we have access to the items
    if (this.cartItems && this.cartItems.length > 0) {
      for (const item of this.cartItems) {
        const discountedPrice = item.product.price * 0.8;
        itemTotal += (discountedPrice * item.quantity);
      }
    } else {
      // Fallback to service method
      itemTotal = this.quickCartService.getTotalPrice();
    }

    // Add shipping cost
    const totalWithShipping = itemTotal + 49;

    // Format and return
    return this.formatPrice(totalWithShipping);
  }

  // Get total price with shipping
  getTotalWithShipping(): string {
    // If we have the total from subscription
    if (this.totalPrice > 0) {
      return this.formatPrice(this.totalPrice);
    }

    // Fallback calculation if subscription hasn't updated yet
    let itemTotal = 0;

    // Manual calculation from cart items
    if (this.cartItems && this.cartItems.length > 0) {
      for (const item of this.cartItems) {
        const discountedPrice = item.product.price * 0.8;
        itemTotal += (discountedPrice * item.quantity);
      }
    }

    // Add shipping cost
    const shippingCost = 49;
    const totalWithShipping = itemTotal + shippingCost;

    return this.formatPrice(totalWithShipping);
  }

  formatPrice(price: number): string {
    return price.toLocaleString('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  protected readonly environment = environment;
}
