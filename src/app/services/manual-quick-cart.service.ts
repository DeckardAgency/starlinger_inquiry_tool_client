// src/app/services/manual-quick-cart.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ManualCartService, ManualCartItem } from './manual-cart.service';

@Injectable({
  providedIn: 'root'
})
export class ManualQuickCartService {
  // Open state
  private openStateSubject = new BehaviorSubject<boolean>(false);
  public readonly isOpen$ = this.openStateSubject.asObservable();

  constructor(private manualCartService: ManualCartService) {}

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

  // Add inquiry parts to the cart
  public addToCart(items: ManualCartItem[]): void {
    this.manualCartService.addToCart(items);
    this.open(); // Open the cart after adding items
  }

  // Remove a part from the cart
  public removeFromCart(index: number): void {
    this.manualCartService.removeFromCart(index);
  }

  // Get cart items
  public get cartItems$(): Observable<ManualCartItem[]> {
    return this.manualCartService.getCartItems();
  }

  // Get cart item count
  public getCartCount(): Observable<number> {
    return this.manualCartService.getCartCount();
  }

  // Clear the cart
  public clearCart(): void {
    this.manualCartService.clearCart();
  }

  // Get open state value directly
  public get isOpen(): boolean {
    return this.openStateSubject.value;
  }
}
