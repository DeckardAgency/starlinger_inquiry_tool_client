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
  private cartItems: ManualCartItem[] = [];
  private subscriptions: Subscription[] = [];

  // Reference number input
  referenceNumber: string = '';

  // Track which sections are open
  openSections: Set<string> = new Set();

  constructor(
    public manualQuickCartService: ManualQuickCartService,
    private router: Router
  ) {}

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
    // The service will now handle showing the notification
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

  // Navigate to dashboard and close cart
  goBack(): void {
    this.onClose();
    // this.router.navigate(['/dashboard']);
  }

  // Save draft action
  saveDraft(): void {
    // Here you would implement logic to save the draft
    console.log('Saving draft of inquiry items with reference:', this.referenceNumber);
    // Show a confirmation message or notification
    alert('Draft saved successfully!');
  }

  // Submit the inquiry
  placeInquiry(): void {
    // Here you would implement logic to submit the inquiry
    console.log('Placing inquiry with items:', this.cartItems);
    console.log('Reference number:', this.referenceNumber);
    // Show a confirmation message or navigate to confirmation page
    alert('Inquiry placed successfully!');
    this.manualQuickCartService.clearCart();
    this.onClose();
    this.router.navigate(['/dashboard']);
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
