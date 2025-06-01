import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InquiryCardComponent } from '@shared/components/inquiry-card/inquiry-card.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { OrderResponse, OrderService } from '@services/http/order.service';
import { AuthService } from '@core/auth/auth.service';
import { Inquiry } from '@core/models/inquiry.model';
import { InquiryCardShimmerComponent } from '@shared/components/inquiry-card/inquiry-card-shimmer.component';

@Component({
    selector: 'app-active-inquiries',
    imports: [
        CommonModule,
        RouterModule,
        InquiryCardComponent,
        IconComponent,
        InquiryCardShimmerComponent
    ],
    templateUrl: './active-inquiries.component.html',
    styleUrls: ['./active-inquiries.component.scss']
})
export class ActiveInquiriesComponent implements OnInit {
  activeInquiries: Inquiry[] = [];
  isLoading = false;
  error: string | null = null;

  // Number of inquiries to display on dashboard
  readonly MAX_DASHBOARD_INQUIRIES = 3;

  // API status values that exist in the system
  readonly API_STATUSES = ['draft', 'pending', 'paid', 'processing', 'shipped', 'delivered', 'canceled'];

  constructor(
    private orderService: OrderService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUserOrders();
  }

  /**
   * Calculate how many shimmer placeholders are needed to fill up to MAX_DASHBOARD_INQUIRIES
   * @returns Array with the number of placeholders needed
   */
  getPlaceholdersNeeded(): number[] {
    const placeholdersCount = Math.max(0, this.MAX_DASHBOARD_INQUIRIES - this.activeInquiries.length);
    return Array(placeholdersCount).fill(0).map((_, i) => i);
  }

  loadUserOrders(): void {
    this.isLoading = true;
    this.error = null;

    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      this.error = 'User not authenticated';
      this.isLoading = false;
      return;
    }

    // Get current user from auth service
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser || !currentUser.email) {
      this.error = 'User information not available';
      this.isLoading = false;
      return;
    }

    // Use the current user's email to fetch orders
    this.orderService.getOrdersByUserEmail(currentUser.email)
      .pipe(
        catchError(err => {
          this.error = 'Failed to load orders. Please try again later.';
          console.error('Error loading orders:', err);
          return of({
            '@context': '',
            '@id': '',
            '@type': '',
            'totalItems': 0,
            'member': [],
            'view': { '@id': '', '@type': '' },
            'search': { '@type': '', 'template': '', 'variableRepresentation': '', 'mapping': [] }
          });
        }),
        finalize(() => {
          setTimeout(() => {
            this.isLoading = false;
          }, 300);
        })
      )
      .subscribe(ordersCollection => {
        if (ordersCollection.member && ordersCollection.member.length > 0) {
          // Map all orders to inquiries but only take the first MAX_DASHBOARD_INQUIRIES
          this.activeInquiries = ordersCollection.member
            .map(order => this.mapOrderToInquiry(order))
            .slice(0, this.MAX_DASHBOARD_INQUIRIES);
        } else {
          this.activeInquiries = [];
        }
      });
  }

  private mapOrderToInquiry(order: OrderResponse): {
    id: string;
    machine: string;
    dateCreated: string;
    partsOrdered: number;
    status: string;
    internalReference: string
  } {
    // Format date from ISO string to DD-MM-YYYY
    const createDate = new Date(order.createdAt);
    const formattedDate = `${createDate.getDate().toString().padStart(2, '0')}-${
      (createDate.getMonth() + 1).toString().padStart(2, '0')}-${
      createDate.getFullYear()}`;

    // Get total items count
    const totalItems = order.items ? order.items.length : 0;

    // Use product name as machine name if available, otherwise use order number
    const machineName = order.items && order.items.length > 0 && order.items[0].product
      ? order.items[0].product.name
      : `Order ${order.orderNumber}`;

    // Apply basic validation to ensure the status is one of the known API statuses
    // This is just a safety check - if an unknown status comes in, we still use it
    const status = this.API_STATUSES.includes(order.status)
      ? order.status
      : order.status; // Still use the original if not in our list, for flexibility

    // Use the status directly from the API response
    return {
      id: order.id,
      machine: machineName,
      dateCreated: formattedDate,
      partsOrdered: totalItems,
      status: status,
      internalReference: order.id
    };
  }
}
