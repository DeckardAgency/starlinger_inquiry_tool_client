import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BreadcrumbsComponent, Breadcrumb } from '../components/breadcrumbs/breadcrumbs.component';
import { ManualCartService, ManualCartItem } from '../services/manual-cart.service';
import { ManualQuickCartService } from '../services/manual-quick-cart.service';
import { Subscription } from 'rxjs';
import { UploadedFile } from '../manual-entry/manual-entry.component';

interface SectionState {
  details: boolean;
  files: boolean;
  notes: boolean;
}

@Component({
  selector: 'app-manual-entry-cart',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, BreadcrumbsComponent],
  templateUrl: './manual-entry-cart.component.html',
  styleUrls: ['./manual-entry-cart.component.scss']
})
export class ManualEntryCartComponent implements OnInit, OnDestroy {
  cartItems: ManualCartItem[] = [];
  private cartSubscription: Subscription | null = null;

  // Track the expanded/collapsed state of each section for each item
  sectionStates: { [key: number]: SectionState } = {};

  breadcrumbs: Breadcrumb[] = [
    { label: 'Dashboard', link: '/dashboard' },
    { label: 'Manual Entry', link: '/manual-entry' },
    { label: 'Inquiry Overview' }
  ];

  constructor(
    private manualCartService: ManualCartService,
    public manualQuickCartService: ManualQuickCartService
  ) {}

  ngOnInit(): void {
    // Subscribe to cart changes
    this.cartSubscription = this.manualCartService.getCartItems().subscribe(items => {
      this.cartItems = items;

      // Initialize section states for each item
      items.forEach((_, index) => {
        if (!this.sectionStates[index]) {
          this.sectionStates[index] = {
            details: false, // Open details by default
            files: false,  // Files section collapsed by default
            notes: false   // Notes section collapsed by default
          };
        }
      });
    });
  }

  ngOnDestroy(): void {
    // Clean up subscription
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  /**
   * Remove an item from the cart
   */
  removeItem(index: number): void {
    this.manualQuickCartService.removeFromCart(index);
  }

  /**
   * Edit an item in the cart
   */
  editItem(index: number): void {
    // Navigate back to manual entry with the item pre-loaded for editing
    console.log('Edit item:', index);
    // This would typically navigate back to manual entry page with this item loaded
  }

  /**
   * Clear the entire cart
   */
  clearCart(): void {
    this.manualQuickCartService.clearCart();
  }

  /**
   * Place the inquiry
   */
  placeInquiry(): void {
    // This would typically submit the inquiry to the backend
    console.log('Placing inquiry with items:', this.cartItems);
    // You could add router navigation here
  }

  /**
   * Save draft of the inquiry
   */
  saveDraft(): void {
    // This would typically save the inquiry as a draft
    console.log('Saving inquiry draft');
  }

  /**
   * Check if a file is an image based on extension
   */
  isImageFile(fileName: string): boolean {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extension || '');
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  /**
   * Track by function for ngFor loops - improve performance by tracking items by index
   */
  trackByFn(index: number, item: any): number {
    return index;
  }

  /**
   * Track by function for file items - track by file name
   */
  trackByFileName(index: number, file: any): string {
    return file.name;
  }

  /**
   * Toggle the expanded/collapsed state of a section
   */
  toggleSection(itemIndex: number, sectionName: 'details' | 'files' | 'notes', event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    if (!this.sectionStates[itemIndex]) {
      this.sectionStates[itemIndex] = {
        details: false,
        files: false,
        notes: false
      };
    }

    // Toggle the current state
    this.sectionStates[itemIndex][sectionName] = !this.sectionStates[itemIndex][sectionName];
  }

  /**
   * Get the current state of a section
   */
  getSectionState(itemIndex: number, sectionName: 'details' | 'files' | 'notes'): boolean {
    // Return false if the section state doesn't exist yet
    if (!this.sectionStates[itemIndex]) {
      return false;
    }

    return this.sectionStates[itemIndex][sectionName];
  }
}
