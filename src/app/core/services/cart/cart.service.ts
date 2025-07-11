import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { CartItem, Product } from '@core/models';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems = new BehaviorSubject<CartItem[]>([]);
  private shippingCost = 49.00; // Default shipping cost
  private readonly isBrowser: boolean;

  // Quick cart panel state
  private readonly openStateSubject = new BehaviorSubject<boolean>(false); // Open state
  public readonly isOpen$ = this.openStateSubject.asObservable();

  // Notification state
  private readonly notificationVisibleSubject = new BehaviorSubject<boolean>(false);
  public readonly notificationVisible$ = this.notificationVisibleSubject.asObservable();

  // Last added product message
  private lastAddedProductSubject = new BehaviorSubject<string>('Product added to cart.');
  public readonly lastAddedProduct$ = this.lastAddedProductSubject.asObservable();

  // Notification type (success or remove)
  private notificationTypeSubject = new BehaviorSubject<'success' | 'remove'>('success');
  public readonly notificationType$ = this.notificationTypeSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);

    // Load cart from localStorage only in the browser environment
    if (this.isBrowser) {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        this.cartItems.next(JSON.parse(savedCart));
      }
    }
  }

  // Cart panel UI methods

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
  public showNotification(message?: string, type: 'success' | 'remove' = 'success'): void {
    if (message) {
      this.lastAddedProductSubject.next(message);
    }
    this.notificationTypeSubject.next(type);
    this.notificationVisibleSubject.next(true);
  }

  public showRemoveNotification(message: string = 'Product removed from cart.'): void {
    this.showNotification(message, 'remove');
  }

  public hideNotification(): void {
    this.notificationVisibleSubject.next(false);
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
        total + (item.product.clientPrice * item.quantity), 0))
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
    // Find the product name before removal
    const product = currentItems.find(item => item.product.id === productId);
    const productName = product?.product.name || 'Product';

    const updatedItems = currentItems.filter(item => item.product.id !== productId);
    this.cartItems.next(updatedItems);
    this.saveCartToStorage();

    // Show removal notification
    this.showRemoveNotification(`${productName} removed from cart.`);
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
