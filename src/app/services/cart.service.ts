import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Product } from '../interfaces/product.interface';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems = new BehaviorSubject<CartItem[]>([]);
  private shippingCost = 49.00; // Default shipping cost
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);

    // Load cart from localStorage only in browser environment
    if (this.isBrowser) {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        this.cartItems.next(JSON.parse(savedCart));
      }
    }
  }

  getCartItems(): Observable<CartItem[]> {
    return this.cartItems.asObservable();
  }

  getCartCount(): Observable<number> {
    return this.cartItems.pipe(
      map(items => items.reduce((total, item) => total + item.quantity, 0))
    );
  }

  getCartTotal(): Observable<number> {
    return this.cartItems.pipe(
      map(items => items.reduce((total, item) =>
        total + (item.product.price * item.quantity), 0))
    );
  }

  getShippingCost(): number {
    return this.shippingCost;
  }

  getFinalTotal(): Observable<number> {
    return this.getCartTotal().pipe(
      map(total => total + this.shippingCost)
    );
  }

  addToCart(product: Product, quantity: number = 1): void {
    const currentItems = this.cartItems.value;
    const existingItem = currentItems.find(item => item.product.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
      this.cartItems.next([...currentItems]);
    } else {
      this.cartItems.next([...currentItems, { product, quantity }]);
    }

    this.saveCartToStorage();
  }

  updateQuantity(productId: string, quantity: number): void {
    const currentItems = this.cartItems.value;
    const itemIndex = currentItems.findIndex(item => item.product.id === productId);

    if (itemIndex > -1) {
      if (quantity <= 0) {
        currentItems.splice(itemIndex, 1);
      } else {
        currentItems[itemIndex].quantity = quantity;
      }
      this.cartItems.next([...currentItems]);
      this.saveCartToStorage();
    }
  }

  removeFromCart(productId: string): void {
    const currentItems = this.cartItems.value;
    const updatedItems = currentItems.filter(item => item.product.id !== productId);
    this.cartItems.next(updatedItems);
    this.saveCartToStorage();
  }

  clearCart(): void {
    this.cartItems.next([]);
    if (this.isBrowser) {
      localStorage.removeItem('cart');
    }
  }

  private saveCartToStorage(): void {
    if (this.isBrowser) {
      localStorage.setItem('cart', JSON.stringify(this.cartItems.value));
    }
  }
}
