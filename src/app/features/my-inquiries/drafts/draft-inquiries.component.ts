import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BreadcrumbsComponent } from '@shared/components/ui/breadcrumbs/breadcrumbs.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { catchError, finalize, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { OrderService } from '@services/http/order.service';
import { AuthService } from '@core/auth/auth.service';
import {CartService} from '@services/cart/cart.service';

interface DraftInquiry {
  id: string;
  dateCreated: string;
  type: 'Order' | 'Inquiry';
  internalReference: string;
  customer: {
    initials: string;
    name: string;
    avatar?: string;
  };
  status: string;
  // Store the original order data for later use
  originalOrder?: any;
}

@Component({
  selector: 'app-draft-inquiries',
  standalone: true,
  imports: [CommonModule, BreadcrumbsComponent, IconComponent],
  templateUrl: './draft-inquiries.component.html',
  styleUrls: ['./draft-inquiries.component.scss']
})
export class DraftInquiriesComponent implements OnInit {
  breadcrumbs = [
    { label: 'My inquiries', link: '/my-inquiries' },
    { label: 'Drafts' }
  ];

  draftInquiries: DraftInquiry[] = [];
  isLoading = false;
  error: string | null = null;
  sortField: string = 'dateCreated';
  sortDirection: 'asc' | 'desc' = 'desc';

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDraftOrders();
  }

  loadDraftOrders(): void {
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

    // Use the getDraftOrdersByUserEmail method which already filters by isDraft=true
    this.orderService.getDraftOrdersByUserEmail(currentUser.email)
      .pipe(
        catchError(err => {
          this.error = 'Failed to load draft orders. Please try again later.';
          console.error('Error loading draft orders:', err);
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
          this.isLoading = false;
        })
      )
      .subscribe(ordersCollection => {
        if (ordersCollection.member && ordersCollection.member.length > 0) {
          this.draftInquiries = ordersCollection.member.map(order => this.mapOrderToDraftInquiry(order));
          this.sortInquiries();
        } else {
          this.draftInquiries = [];
        }
      });
  }

  private mapOrderToDraftInquiry(order: any): DraftInquiry {
    // Get user initials from the order user data
    const userName = order.user?.name || order.user?.email || 'Unknown User';
    const initials = this.getInitials(userName);

    return {
      id: order.id,
      dateCreated: order.createdAt,
      type: 'Order', // Based on the table image, all entries are 'Order' type
      internalReference: order.orderNumber || '-',
      customer: {
        initials: initials,
        name: userName,
        avatar: order.user?.avatar // Optional avatar URL if available
      },
      status: order.status || 'draft',
      originalOrder: order // Store the original order data
    };
  }

  private getInitials(name: string): string {
    if (!name) return 'UN';

    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  sortBy(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.sortInquiries();
  }

  private sortInquiries(): void {
    this.draftInquiries.sort((a, b) => {
      let aValue: any = a[this.sortField as keyof DraftInquiry];
      let bValue: any = b[this.sortField as keyof DraftInquiry];

      // Handle nested customer property
      if (this.sortField === 'customer') {
        aValue = a.customer.name;
        bValue = b.customer.name;
      }

      // Handle date comparison
      if (this.sortField === 'dateCreated') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      // Handle string comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  onEdit(inquiry: DraftInquiry): void {
    // First, clear the current cart
    this.cartService.clearCart();

    // Check if we have the original order data with items
    if (inquiry.originalOrder && inquiry.originalOrder.items) {
      // Add each item from the draft order to the cart
      inquiry.originalOrder.items.forEach((item: any) => {
        if (item.product) {
          // Create a product object compatible with the cart service
          const product = {
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            clientPrice: item.product.price, // Use price as clientPrice if not available
            // Add any other required product properties here
            // You may need to adjust these based on your Product model
          };

          // Add the product to cart with the saved quantity
          this.cartService.addToCart(product as any, item.quantity);
        }
      });

      // Store draft order ID in sessionStorage for reference in cart page
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.setItem('draftOrderId', inquiry.id);
        sessionStorage.setItem('draftOrderNumber', inquiry.internalReference);
      }

      // Navigate to cart page
      this.router.navigate(['/cart']);
    } else {
      // If we don't have the order items in memory, fetch them first
      this.orderService.getOrder(inquiry.id)
        .pipe(
          catchError(err => {
            console.error('Error loading draft order details:', err);
            alert('Failed to load draft order details. Please try again.');
            return of(null);
          })
        )
        .subscribe(order => {
          if (order && order.items) {
            // Clear cart first
            this.cartService.clearCart();

            // Add items to cart
            order.items.forEach((item: any) => {
              if (item.product) {
                const product = {
                  id: item.product.id,
                  name: item.product.name,
                  price: item.product.price,
                  clientPrice: item.product.price,
                  // Add other required product properties
                };

                this.cartService.addToCart(product as any, item.quantity);
              }
            });

            // Store draft order reference
            if (typeof window !== 'undefined' && window.sessionStorage) {
              sessionStorage.setItem('draftOrderId', inquiry.id);
              sessionStorage.setItem('draftOrderNumber', inquiry.internalReference);
            }

            // Navigate to cart
            this.router.navigate(['/cart']);
          }
        });
    }
  }

  onDelete(inquiry: DraftInquiry): void {
    // Implement delete functionality with confirmation
    if (confirm(`Are you sure you want to delete this draft inquiry?`)) {
      console.log('Delete inquiry:', inquiry);
      // TODO: Call delete service method here
      // this.orderService.deleteOrder(inquiry.id).subscribe(...);
    }
  }

  onMoreOptions(inquiry: DraftInquiry): void {
    // Open context menu or dropdown with more options
    console.log('More options for inquiry:', inquiry);
  }
}
