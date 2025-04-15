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

  // Notification state
  private notificationVisibleSubject = new BehaviorSubject<boolean>(false);
  public readonly notificationVisible$ = this.notificationVisibleSubject.asObservable();

  // Notification message
  private notificationMessageSubject = new BehaviorSubject<string>('Part removed from inquiry.');
  public readonly notificationMessage$ = this.notificationMessageSubject.asObservable();

  // Notification type
  private notificationTypeSubject = new BehaviorSubject<'success' | 'remove'>('remove');
  public readonly notificationType$ = this.notificationTypeSubject.asObservable();

  constructor(private manualCartService: ManualCartService) {}

  // Open the cart
  public open(): void {
    this.openStateSubject.next(true);
    this.hideNotification(); // Hide notification when cart is opened
  }

  // Close the cart
  public close(): void {
    this.openStateSubject.next(false);
  }

  // Toggle cart visibility
  public toggle(): void {
    this.openStateSubject.next(!this.openStateSubject.value);
    if (this.openStateSubject.value) {
      this.hideNotification();
    }
  }

  // Show notification
  public showNotification(message: string, type: 'success' | 'remove' = 'remove'): void {
    this.notificationMessageSubject.next(message);
    this.notificationTypeSubject.next(type);
    this.notificationVisibleSubject.next(true);
  }

  // Hide notification
  public hideNotification(): void {
    this.notificationVisibleSubject.next(false);
  }

  // Add inquiry parts to the cart
  public addToCart(items: ManualCartItem[]): void {
    this.manualCartService.addToCart(items);
    this.open(); // Open the cart after adding items
  }

  // Remove a part from the cart with notification
  public removeFromCart(index: number): void {
    // Get items to find the part name before removing
    let partName = "Part";
    this.manualCartService.getCartItems().subscribe(items => {
      if (items.length > index) {
        partName = items[index].partName || `Part ${index + 1}`;
      }
    }).unsubscribe();

    // Remove the item
    this.manualCartService.removeFromCart(index);

    // Show notification
    this.showNotification(`${partName} removed from inquiry.`, 'remove');
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
