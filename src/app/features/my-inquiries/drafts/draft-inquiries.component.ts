import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BreadcrumbsComponent } from '@shared/components/ui/breadcrumbs/breadcrumbs.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { catchError, finalize } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';
import { OrderService } from '@services/http/order.service';
import { AuthService } from '@core/auth/auth.service';
import { CartService } from '@services/cart/cart.service';
import { ManualQuickCartService } from '@services/cart/manual-quick-cart.service';
import { InquiryService } from '@services/http/inquiry.service';

interface DraftItem {
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
  // Store the original data for later use
  originalData?: any;
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

  draftItems: DraftItem[] = [];
  isLoading = false;
  error: string | null = null;
  sortField: string = 'dateCreated';
  sortDirection: 'asc' | 'desc' = 'desc';

  constructor(
    private orderService: OrderService,
    private inquiryService: InquiryService,
    private authService: AuthService,
    private cartService: CartService,
    private manualQuickCartService: ManualQuickCartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDraftItems();
  }

  loadDraftItems(): void {
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

    // Fetch both draft orders and draft inquiries using forkJoin
    forkJoin({
      orders: this.orderService.getDraftOrdersByUserEmail(currentUser.email).pipe(
        catchError(err => {
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
        })
      ),
      inquiries: this.inquiryService.getDraftInquiriesByUserEmail(currentUser.email).pipe(
        catchError(err => {
          console.error('Error loading draft inquiries:', err);
          return of({
            '@context': '',
            '@id': '',
            '@type': '',
            'totalItems': 0,
            'member': [],
            'view': { '@id': '', '@type': '' },
            'search': { '@type': '', 'template': '', 'variableRepresentation': '', 'mapping': [] }
          });
        })
      )
    })
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe(({ orders, inquiries }) => {
        this.draftItems = [];

        // Add draft orders to the array
        if (orders.member && orders.member.length > 0) {
          const mappedOrders = orders.member.map(order => this.mapOrderToDraftItem(order));
          this.draftItems.push(...mappedOrders);
        }

        // Add draft inquiries to the array
        if (inquiries.member && inquiries.member.length > 0) {
          const mappedInquiries = inquiries.member.map(inquiry => this.mapInquiryToDraftItem(inquiry));
          this.draftItems.push(...mappedInquiries);
        }

        // If there was an error loading either orders or inquiries, show warning
        if (this.draftItems.length === 0) {
          this.error = 'No draft items found';
        }

        this.sortItems();
      });
  }

  private mapOrderToDraftItem(order: any): DraftItem {
    const userName = order.user?.name || order.user?.email || 'Unknown User';
    const initials = this.getInitials(userName);

    return {
      id: order.id,
      dateCreated: order.createdAt,
      type: 'Order',
      internalReference: order.orderNumber || '-',
      customer: {
        initials: initials,
        name: userName,
        avatar: order.user?.avatar
      },
      status: order.status || 'draft',
      originalData: order
    };
  }

  private mapInquiryToDraftItem(inquiry: any): DraftItem {
    const userName = inquiry.user?.name || inquiry.user?.email || 'Unknown User';
    const initials = this.getInitials(userName);

    return {
      id: inquiry.id,
      dateCreated: inquiry.createdAt,
      type: 'Inquiry',
      internalReference: inquiry.inquiryNumber || '-',
      customer: {
        initials: initials,
        name: userName,
        avatar: inquiry.user?.avatar
      },
      status: inquiry.status || 'draft',
      originalData: inquiry
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
    this.sortItems();
  }

  private sortItems(): void {
    this.draftItems.sort((a, b) => {
      let aValue: any = a[this.sortField as keyof DraftItem];
      let bValue: any = b[this.sortField as keyof DraftItem];

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

  onEdit(item: DraftItem): void {
    if (item.type === 'Order') {
      this.editDraftOrder(item);
    } else if (item.type === 'Inquiry') {
      this.editDraftInquiry(item);
    }
  }

  private editDraftOrder(item: DraftItem): void {
    // Check if we have the original order data with items
    if (item.originalData && item.originalData.items) {
      // Clear the current cart
      this.cartService.clearCart();

      // Add each item from the draft order to the cart
      item.originalData.items.forEach((orderItem: any) => {
        if (orderItem.product) {
          const product = {
            id: orderItem.product.id,
            name: orderItem.product.name,
            price: orderItem.product.price,
            clientPrice: orderItem.product.price,
          };

          this.cartService.addToCart(product as any, orderItem.quantity);
        }
      });

      // Store draft order ID in sessionStorage
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.setItem('draftOrderId', item.id);
        sessionStorage.setItem('draftOrderNumber', item.internalReference);
      }

      // Navigate to cart page
      this.router.navigate(['/cart']);
    } else {
      // Fetch the order details
      this.orderService.getOrder(item.id)
        .pipe(
          catchError(err => {
            console.error('Error loading draft order details:', err);
            alert('Failed to load draft order details. Please try again.');
            return of(null);
          })
        )
        .subscribe(order => {
          if (order && order.items) {
            this.cartService.clearCart();

            order.items.forEach((orderItem: any) => {
              if (orderItem.product) {
                const product = {
                  id: orderItem.product.id,
                  name: orderItem.product.name,
                  price: orderItem.product.price,
                  clientPrice: orderItem.product.price,
                };

                this.cartService.addToCart(product as any, orderItem.quantity);
              }
            });

            if (typeof window !== 'undefined' && window.sessionStorage) {
              sessionStorage.setItem('draftOrderId', item.id);
              sessionStorage.setItem('draftOrderNumber', item.internalReference);
            }

            this.router.navigate(['/cart']);
          }
        });
    }
  }

  private editDraftInquiry(item: DraftItem): void {
    // Check if we have the original inquiry data with machines
    if (item.originalData && item.originalData.machines) {
      const cartItems = this.transformInquiryToCartItems(item.originalData);

      if (cartItems.length > 0) {
        this.manualQuickCartService.addToCart(cartItems);

        if (typeof window !== 'undefined' && window.sessionStorage) {
          sessionStorage.setItem('draftInquiryId', item.id);
          sessionStorage.setItem('draftInquiryNumber', item.internalReference);
        }

        this.router.navigate(['/manual-entry']);
      } else {
        alert('No items found in this draft inquiry.');
      }
    } else {
      // Fetch the inquiry details
      this.inquiryService.getInquiryById(item.id)
        .pipe(
          catchError(err => {
            console.error('Error loading draft inquiry details:', err);
            alert('Failed to load draft inquiry details. Please try again.');
            return of(null);
          })
        )
        .subscribe(inquiryData => {
          if (inquiryData && inquiryData.machines) {
            const cartItems = this.transformInquiryToCartItems(inquiryData);

            if (cartItems.length > 0) {
              this.manualQuickCartService.addToCart(cartItems);

              if (typeof window !== 'undefined' && window.sessionStorage) {
                sessionStorage.setItem('draftInquiryId', item.id);
                sessionStorage.setItem('draftInquiryNumber', item.internalReference);
              }

              this.router.navigate(['/manual-entry']);
            } else {
              alert('No items found in this draft inquiry.');
            }
          }
        });
    }
  }

  private transformInquiryToCartItems(inquiry: any): any[] {
    const cartItems: any[] = [];

    if (!inquiry.machines || inquiry.machines.length === 0) {
      return cartItems;
    }

    inquiry.machines.forEach((machine: any) => {
      const machineId = machine.machine?.id || machine.machine;
      const machineName = machine.machine?.articleDescription || 'Unknown Machine';

      if (machine.products && machine.products.length > 0) {
        machine.products.forEach((product: any, index: number) => {
          const cartItem = {
            id: `${machineId}-${index}`,
            machineId: machineId,
            machineName: machineName,
            partData: {
              partName: product.partName,
              partNumber: product.partNumber,
              shortDescription: product.shortDescription,
              additionalNotes: product.additionalNotes
            },
            files: []
          };

          cartItems.push(cartItem);
        });
      }
    });

    return cartItems;
  }

  onDelete(item: DraftItem): void {
    if (confirm(`Are you sure you want to delete this draft ${item.type.toLowerCase()}?`)) {
      console.log('Delete item:', item);
      // TODO: Implement delete functionality
    }
  }

  onMoreOptions(item: DraftItem): void {
    console.log('More options for item:', item);
  }
}
