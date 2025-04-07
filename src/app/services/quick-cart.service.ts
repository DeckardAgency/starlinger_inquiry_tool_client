// src/app/services/quick-cart.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartService, CartItem } from './cart.service';
import { Product } from '../interfaces/product.interface';

@Injectable({
  providedIn: 'root'
})
export class QuickCartService {
  // Cart open state
  private readonly openStateSubject = new BehaviorSubject<boolean>(false);
  public readonly isOpen$ = this.openStateSubject.asObservable();

  public get isOpen(): boolean {
    return this.openStateSubject.value;
  }

  constructor(private cartService: CartService) {}

  // Open the cart
  public open(): void {
    this.openStateSubject.next(true);
  }

  // Close the cart
  public close(): void {
    this.openStateSubject.next(false);
  }

  // Toggle cart visibility
  public toggle(): void {
    this.openStateSubject.next(!this.openStateSubject.value);
  }

  // Alias for toggle() to maintain compatibility with existing code
  public toggleCart(): void {
    this.toggle();
  }

  // Add a product to the cart - delegates to CartService
  public addToCart(product: Product, quantity: number): void {
    this.cartService.addToCart(product, quantity);
    // Open the cart panel
    this.open();
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
