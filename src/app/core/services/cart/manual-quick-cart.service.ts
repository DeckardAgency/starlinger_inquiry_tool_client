import {Injectable} from '@angular/core';
import {BehaviorSubject, catchError, Observable, tap} from 'rxjs';
import {ManualCartService} from './manual-cart.service';
import {ManualCartItem} from '@models/manual-cart-item.model';
import {InquiryRequest, InquiryResponse, InquiryService} from '@services/http/inquiry.service';
import {AuthService} from '@core/auth/auth.service';

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
  private notificationTypeSubject = new BehaviorSubject<'success' | 'remove' | 'error'>('remove');
  public readonly notificationType$ = this.notificationTypeSubject.asObservable();

  // Loading state
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public readonly loading$ = this.loadingSubject.asObservable();

  // Saved inquiry ID (for tracking)
  private savedInquiryIdSubject = new BehaviorSubject<string | null>(null);
  public readonly savedInquiryId$ = this.savedInquiryIdSubject.asObservable();

  constructor(
    private manualCartService: ManualCartService,
    private inquiryService: InquiryService,
    private authService: AuthService
  ) {}

  // Open the cart
  public open(): void {
    this.openStateSubject.next(true);
    this.hideNotification();
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
  public showNotification(message: string, type: 'success' | 'remove' | 'error' = 'remove'): void {
    this.notificationMessageSubject.next(message);
    this.notificationTypeSubject.next(type);
    this.notificationVisibleSubject.next(true);

    // Auto-hide after 5 seconds
    // setTimeout(() => this.hideNotification(), 5000);
  }

  // Hide notification
  public hideNotification(): void {
    this.notificationVisibleSubject.next(false);
  }

  // Add inquiry parts to the cart
  public addToCart(items: ManualCartItem[]): void {
    this.manualCartService.addToCart(items);
    this.open();
  }

  // Remove a part from the cart with notification
  public removeFromCart(index: number): void {
    let partName = 'Part';

    this.manualCartService.getCartItems().pipe(
      tap(items => {
        if (items.length > index) {
          partName = items[index].partData?.partName || `Part ${index + 1}`;
        }
      })
    ).subscribe(() => {
      // Remove the item
      this.manualCartService.removeFromCart(index);

      // Show notification
      this.showNotification(`${partName} removed from inquiry.`, 'remove');
    });
  }

  // Get cart items
  public get cartItems$(): Observable<ManualCartItem[]> {
    return this.manualCartService.getCartItems();
  }

  // Clear the cart
  public clearCart(): void {
    this.manualCartService.clearCart();
  }

  /**
   * Save inquiry as draft
   * Converts ManualCartItem[] to InquiryRequest format and calls the backend
   */
  public saveDraft(
    cartItems: ManualCartItem[],
    referenceNumber?: string
  ): Observable<InquiryResponse> {
    this.loadingSubject.next(true);

    // Get current user
    const user = this.authService.getCurrentUser();
    if (!user || !user.id) {
      this.loadingSubject.next(false);
      this.showNotification('User not authenticated. Please log in first.', 'error');
      throw new Error('User not authenticated');
    }

    // Transform cart items to inquiry format
    const inquiryRequest = this.transformCartItemsToInquiryRequest(
      cartItems,
      'draft',
      user,
      referenceNumber
    );

    return this.inquiryService.saveDraft(inquiryRequest).pipe(
      tap(response => {
        this.loadingSubject.next(false);
        this.savedInquiryIdSubject.next(response.id);
        this.showNotification(`Inquiry draft saved successfully! Reference: ${response.inquiryNumber}`, 'success');
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        const errorMessage = error?.error?.message || 'Failed to save inquiry draft. Please try again.';
        this.showNotification(errorMessage, 'error');
        throw error;
      })
    );
  }

  /**
   * Submit inquiry (converts draft to submitted)
   * Creates and submits the inquiry in one operation
   */
  public submitInquiry(
    cartItems: ManualCartItem[],
    referenceNumber?: string
  ): Observable<InquiryResponse> {
    this.loadingSubject.next(true);

    // Get current user
    const user = this.authService.getCurrentUser();
    if (!user || !user.id) {
      this.loadingSubject.next(false);
      this.showNotification('User not authenticated. Please log in first.', 'error');
      throw new Error('User not authenticated');
    }

    // Transform cart items to inquiry format (submitted status)
    const inquiryRequest = this.transformCartItemsToInquiryRequest(
      cartItems,
      'submitted',
      user,
      referenceNumber
    );

    return this.inquiryService.createInquiry(inquiryRequest).pipe(
      tap(response => {
        this.loadingSubject.next(false);
        this.savedInquiryIdSubject.next(response.id);
        this.showNotification(
          `Inquiry submitted successfully! Inquiry #${response.inquiryNumber}`,
          'success'
        );
        // Clear the cart after successful submission
        this.clearCart();
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        const errorMessage = error?.error?.message || 'Failed to submit inquiry. Please try again.';
        this.showNotification(errorMessage, 'error');
        throw error;
      })
    );
  }

  /**
   * Transform ManualCartItem[] to InquiryRequest format
   */
  private transformCartItemsToInquiryRequest(
    cartItems: ManualCartItem[],
    status: 'draft' | 'submitted',
    user: any,
    referenceNumber?: string
  ): InquiryRequest {
    // Group items by machine
    const machinesMap = new Map<string, ManualCartItem[]>();

    cartItems.forEach(item => {
      const machineId = item.machineId;
      if (!machinesMap.has(machineId)) {
        machinesMap.set(machineId, []);
      }
      machinesMap.get(machineId)!.push(item);
    });

    // Transform to InquiryMachine format
    const machines = Array.from(machinesMap.entries()).map(([machineId, items]) => {
      return {
        machine: '/api/v1/machines/' + machineId,
        notes: items.map(item => item.partData.additionalNotes).filter(n => n).join('\n'),
        products: items.map(item => ({
          partName: item.partData.partName,
          partNumber: item.partData.partNumber,
          shortDescription: item.partData.shortDescription,
          additionalNotes: item.partData.additionalNotes
        }))
      };
    });

    return {
      status,
      notes: referenceNumber ? `Reference: ${referenceNumber}` : '',
      contactEmail: '',
      contactPhone: '',
      isDraft: status === 'draft',
      user: `/api/v1/users/${user.id}`,
      machines
    };
  }
}
