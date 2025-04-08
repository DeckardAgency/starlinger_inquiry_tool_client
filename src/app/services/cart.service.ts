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

  // Quick cart panel state
  private readonly openStateSubject = new BehaviorSubject<boolean>(false);
  public readonly isOpen$ = this.openStateSubject.asObservable();

  // Notification state
  private readonly notificationVisibleSubject = new BehaviorSubject<boolean>(false);
  public readonly notificationVisible$ = this.notificationVisibleSubject.asObservable();

  // Last added product message
  private lastAddedProductSubject = new BehaviorSubject<string>('Product added to cart.');
  public readonly lastAddedProduct$ = this.lastAddedProductSubject.asObservable();

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

  // Cart panel UI methods
  public get isOpen(): boolean {
    return this.openStateSubject.value;
  }

  public openCart(): void {
    this.openStateSubject.next(true);
    this.hideNotification(); // Hide notification when cart is opened
  }

  public closeCart(): void {
    this.openStateSubject.next(false);
  }

  public toggleCart(): void {
    this.openStateSubject.next(!this.openStateSubject.value);
    if (this.openStateSubject.value) {
      this.hideNotification();
    }
  }

  // Notification methods
  public showNotification(message?: string): void {
    if (message) {
      this.lastAddedProductSubject.next(message);
    }
    this.notificationVisibleSubject.next(true);
  }

  public hideNotification(): void {
    this.notificationVisibleSubject.next(false);
  }

  public get isNotificationVisible(): boolean {
    return this.notificationVisibleSubject.value;
  }

  public get lastAddedProductMessage(): string {
    return this.lastAddedProductSubject.value;
  }

  // Cart data methods
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

  // Calculate discounted price (20% discount)
  getDiscountedPrice(originalPrice: number): number {
    // Ensure price is a valid number
    const price = Number(originalPrice) || 0;
    return price * 0.8;
  }

  // Format price to two decimal places
  formatPrice(price: number): string {
    // Ensure price is a valid number
    const validPrice = Number(price) || 0;
    return validPrice.toFixed(2);
  }

  // Calculate and format the discounted total for an item
  getFormattedItemTotal(item: CartItem): string {
    if (!item || !item.product || typeof item.product.price !== 'number') {
      console.warn('Invalid cart item or missing price:', item);
      return '0.00';
    }

    const quantity = Number(item.quantity) || 0;
    const discountedPrice = this.getDiscountedPrice(item.product.price);
    const total = discountedPrice * quantity;
    return this.formatPrice(total);
  }

  // Cart manipulation methods
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

    // Show notification instead of opening the cart
    this.showNotification('Product added to cart.');
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
