import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {CartService} from './cart.service';
import {CartItem, Product} from '@core/models';

@Injectable({
  providedIn: 'root'
})
export class QuickCartService {
  // Access cart open state from CartService
  public get isOpen$(): Observable<boolean> {
    return this.cartService.isOpen$;
  }

  // Access notification state from CartService
  public get notificationVisible$(): Observable<boolean> {
    return this.cartService.notificationVisible$;
  }

  // Access last added product message
  public get lastAddedProduct$(): Observable<string> {
    return this.cartService.lastAddedProduct$;
  }

  // Access notification type
  public get notificationType$(): Observable<'success' | 'remove'> {
    return this.cartService.notificationType$;
  }

  constructor(public cartService: CartService) {}

  // Open the cart
  public open(): void {
    this.cartService.openCart();
  }

  // Close the cart
  public close(): void {
    this.cartService.closeCart();
  }

  // Toggle cart visibility
  public toggle(): void {
    this.cartService.toggleCart();
  }

  // Show notification
  public showNotification(message?: string, type: 'success' | 'remove' = 'success'): void {
    this.cartService.showNotification(message, type);
  }

  // Show remove notification
  public showRemoveNotification(message?: string): void {
    this.cartService.showRemoveNotification(message);
  }

  // Hide notification
  public hideNotification(): void {
    this.cartService.hideNotification();
  }

  // Alias for toggle() to maintain compatibility with existing code
  public toggleCart(): void {
    this.toggle();
  }

  // Add a product to the cart - delegates to CartService
  public addToCart(product: Product, quantity: number): void {
    this.cartService.addToCart(product, quantity);
    // Now shows notification instead of directly opening the cart
  }

  // Update the quantity of a cart item - delegates to CartService
  public updateItemQuantity(productId: string, quantity: number): void {
    this.cartService.updateQuantity(productId, quantity);
  }

  // Remove a product from the cart - delegates to CartService
  public removeFromCart(productId: string): void {
    this.cartService.removeFromCart(productId);
  }

  // Get cart items - delegates to CartService
  public get cartItems$(): Observable<CartItem[]> {
    return this.cartService.getCartItems();
  }

  // Calculate total items in cart
  public getTotalItems(): number {
    // Use the CartService's count method if available
    let count = 0;
    this.cartService.getCartCount().subscribe(total => {
      count = total;
    }).unsubscribe();

    return count;
  }

  // Calculate total price of items in cart
  public getTotalPrice(): number {
    // Use the CartService's total method
    let total = 0;
    this.cartService.getCartTotal().subscribe(price => {
      total = price;
    }).unsubscribe();

    return total;
  }

  // Clear the cart - delegates to CartService
  public clearCart(): void {
    this.cartService.clearCart();
  }
}
