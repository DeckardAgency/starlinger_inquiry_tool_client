import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { ManualCartItem } from '@models/manual-cart-item.model';


@Injectable({
  providedIn: 'root'
})
export class ManualCartService {
  private cartItems = new BehaviorSubject<ManualCartItem[]>([]);
  private readonly isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);

    // Load cart from localStorage only in the browser environment
    if (this.isBrowser) {
      const savedCart = localStorage.getItem('manualCart');
      if (savedCart) {
        this.cartItems.next(JSON.parse(savedCart));
      }
    }
  }

  // Cart data methods
  getCartItems(): Observable<ManualCartItem[]> {
    return this.cartItems.asObservable();
  }

  getCartCount(): Observable<number> {
    return this.cartItems.pipe(
      map(items => items.length)
    );
  }

  // Cart manipulation methods
  addToCart(items: ManualCartItem[]): void {
    const currentItems = this.cartItems.value;
    this.cartItems.next([...currentItems, ...items]);
    this.saveCartToStorage();
  }

  removeFromCart(index: number): void {
    const currentItems = [...this.cartItems.value];
    currentItems.splice(index, 1);
    this.cartItems.next(currentItems);
    this.saveCartToStorage();
  }

  clearCart(): void {
    this.cartItems.next([]);
    if (this.isBrowser) {
      localStorage.removeItem('manualCart');
    }
  }

  private saveCartToStorage(): void {
    if (this.isBrowser) {
      localStorage.setItem('manualCart', JSON.stringify(this.cartItems.value));
    }
  }
}
