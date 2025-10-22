import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { ManualCartItem } from '@models/manual-cart-item.model';
import { ManualQuickCartService } from '@services/cart/manual-quick-cart.service';

@Component({
  selector: 'app-manual-quick-cart',
  imports: [CommonModule, FormsModule],
  templateUrl: './manual-quick-cart.component.html',
  styleUrls: ['./manual-quick-cart.component.scss']
})
export class ManualQuickCartComponent implements OnInit, OnDestroy {
  @Input() isOpen = false;
  cartItems$: Observable<ManualCartItem[]> = new Observable<ManualCartItem[]>();
  loading$: Observable<boolean>;
  notificationVisible$: Observable<boolean>;
  notificationMessage$: Observable<string>;
  notificationType$: Observable<'success' | 'remove' | 'error'>;

  private cartItems: ManualCartItem[] = [];
  private subscriptions: Subscription[] = [];

  // Reference number input
  referenceNumber: string = '';

  // Track which sections are open
  openSections: Set<string> = new Set();

  constructor(
    public manualQuickCartService: ManualQuickCartService,
    private router: Router
  ) {
    this.loading$ = this.manualQuickCartService.loading$;
    this.notificationVisible$ = this.manualQuickCartService.notificationVisible$;
    this.notificationMessage$ = this.manualQuickCartService.notificationMessage$;
    this.notificationType$ = this.manualQuickCartService.notificationType$;
  }

  ngOnInit(): void {
    // Initialize the observable in ngOnInit
    this.cartItems$ = this.manualQuickCartService.cartItems$;

    // Subscribe to cart items for local calculations
    this.subscriptions.push(
      this.manualQuickCartService.cartItems$.subscribe(items => {
        this.cartItems = items;

        // Auto-open first part's details section by default
        if (items.length > 0) {
          this.openSections.add('details-0');
        }
      })
    );
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  onClose(): void {
    this.manualQuickCartService.close();
  }

  removeItem(index: number): void {
    this.manualQuickCartService.removeFromCart(index);
  }

  // Toggle section open/closed state
  toggleSection(sectionId: string): void {
    if (this.openSections.has(sectionId)) {
      this.openSections.delete(sectionId);
    } else {
      this.openSections.add(sectionId);
    }
  }

  // Check if a section is open
  isSectionOpen(sectionId: string): boolean {
    return this.openSections.has(sectionId);
  }

  // Navigate back and close cart
  goBack(): void {
    this.onClose();
  }

  /**
   * Save inquiry as draft
   * Validates and sends to backend
   */
  saveDraft(): void {
    if (!this.validateInput()) {
      return;
    }

    // Call the service to save draft
    this.subscriptions.push(
      this.manualQuickCartService.saveDraft(
        this.cartItems,
        this.referenceNumber || undefined
      ).subscribe({
        next: (response) => {
          console.log('Inquiry saved as draft:', response);
          // Clear inputs after successful save
          this.referenceNumber = '';

          // Optionally navigate after a delay
          setTimeout(() => {
            // this.router.navigate(['/inquiries/drafts']);
          }, 2000);
        },
        error: (error) => {
          console.error('Error saving draft:', error);
          // Error is handled by the service and shown via notification
        }
      })
    );
  }

  /**
   * Submit the inquiry (creates submitted inquiry)
   * Validates and sends to backend
   */
  placeInquiry(): void {
    if (!this.validateInput()) {
      return;
    }

    // Confirm submission
    if (!confirm('Are you sure you want to submit this inquiry? You can save it as draft instead.')) {
      return;
    }

    // Call the service to submit inquiry
    this.subscriptions.push(
      this.manualQuickCartService.submitInquiry(
        this.cartItems,
        this.referenceNumber || undefined
      ).subscribe({
        next: (response) => {
          console.log('Inquiry submitted:', response);

          // Close the cart
          this.onClose();

          // Navigate to inquiries page after a delay
          setTimeout(() => {
            this.router.navigate(['/inquiries']);
          }, 2000);
        },
        error: (error) => {
          console.error('Error submitting inquiry:', error);
          // Error is handled by the service and shown via notification
        }
      })
    );
  }

  /**
   * Validate required input fields
   */
  private validateInput(): boolean {
    // Check if cart is empty
    if (this.cartItems.length === 0) {
      this.manualQuickCartService.showNotification(
        'Your inquiry is empty. Please add parts before saving.',
        'error'
      );
      return false;
    }

    return true;
  }

  // Get part count for display
  getPartCount(): number {
    return this.cartItems.length;
  }

  // Format file size for display
  formatFileSize(bytes: number): string {
    if (!bytes || bytes === 0) return '0 KB';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}
