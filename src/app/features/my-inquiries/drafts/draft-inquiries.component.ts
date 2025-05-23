import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbsComponent } from '@shared/components/ui/breadcrumbs/breadcrumbs.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { InquiryCardComponent } from '@shared/components/inquiry-card/inquiry-card.component';
import { RouterLink } from '@angular/router';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { OrderResponse, OrderService } from '@services/http/order.service';
import { AuthService } from '@core/auth/auth.service';
import { Inquiry } from '@core/models/inquiry.model';
import {
  DraftOrderTableComponent,
  DraftOrderTableItem
} from '@shared/components/draft-order-table/draft-order-table.component';

@Component({
    selector: 'app-draft-inquiries',
    imports: [CommonModule, BreadcrumbsComponent, IconComponent, DraftOrderTableComponent],
    templateUrl: './draft-inquiries.component.html',
    styleUrls: ['./draft-inquiries.component.scss']
})
export class DraftInquiriesComponent implements OnInit {
  breadcrumbs = [
    { label: 'My inquiries', link: '/my-inquiries' },
    { label: 'Drafts' }
  ];

  draftInquiries: Inquiry[] = [];
  isLoading = false;
  error: string | null = null;

  draftOrderItems: DraftOrderTableItem[] = [
    {
      dateCreated: '28-04-2025',
      type: 'Order',
      referenceNumber: '000123-ABC',
      customer: {
        initials: 'AK',
        name: 'Anes Kapetanovic'
      },
      status: 'Draft'
    },
    {
      dateCreated: '27-04-2025',
      type: 'Order',
      referenceNumber: '000124-XYZ',
      customer: {
        initials: 'MK',
        name: 'Mira Kulic'
      },
      status: 'Draft'
    },
    {
      dateCreated: '26-04-2025',
      type: 'Inquiry',
      referenceNumber: '004231-UGR',
      customer: {
        initials: 'ME',
        name: 'Martin Ertl'
      },
      status: 'Draft'
    },
    {
      dateCreated: '25-04-2025',
      type: 'Inquiry',
      referenceNumber: '001456-ZXY',
      customer: {
        initials: 'IJ',
        name: 'Ivan Jozic'
      },
      status: 'Draft'
    },
    {
      dateCreated: '24-04-2025',
      type: 'Order',
      referenceNumber: '000125-DEF',
      customer: {
        initials: 'SK',
        name: 'Sara Kovač',
        avatar: 'assets/avatar1.jpg'
      },
      status: 'Draft'
    },
    {
      dateCreated: '23-04-2025',
      type: 'Order',
      referenceNumber: '000126-GHI',
      customer: {
        initials: 'TM',
        name: 'Tomislav Marić'
      },
      status: 'Draft'
    },
    {
      dateCreated: '22-04-2025',
      type: 'Inquiry',
      referenceNumber: '003234-LJK',
      customer: {
        initials: 'ZP',
        name: 'Zoran Petrović',
        avatar: 'assets/avatar2.jpg'
      },
      status: 'Draft'
    },
    {
      dateCreated: '21-04-2025',
      type: 'Order',
      referenceNumber: '007890-QWE',
      customer: {
        initials: 'LB',
        name: 'Lucia Babić'
      },
      status: 'Draft'
    },
    {
      dateCreated: '20-04-2025',
      type: 'Order',
      referenceNumber: '008901-RTY',
      customer: {
        initials: 'DH',
        name: 'Damir Horvat'
      },
      status: 'Draft'
    },
    {
      dateCreated: '19-04-2025',
      type: 'Inquiry',
      referenceNumber: '005678-MNB',
      customer: {
        initials: 'JP',
        name: 'Jana Pavlović',
        avatar: 'assets/avatar3.jpg'
      },
      status: 'Draft'
    },
    {
      dateCreated: '18-04-2025',
      type: 'Order',
      referenceNumber: '009012-VCX',
      customer: {
        initials: 'NR',
        name: 'Nikola Radić'
      },
      status: 'Draft'
    },
    {
      dateCreated: '17-04-2025',
      type: 'Inquiry',
      referenceNumber: '006789-POI',
      customer: {
        initials: 'MM',
        name: 'Marko Matić'
      },
      status: 'Draft'
    }
  ];

  // API status values that exist in the system
  readonly API_STATUSES = ['draft', 'pending', 'paid', 'processing', 'shipped', 'delivered', 'canceled'];

  constructor(
    private orderService: OrderService,
    private authService: AuthService
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

    // Use the current user's email to fetch draft orders
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
          this.draftInquiries = ordersCollection.member.map(order => this.mapOrderToInquiry(order));
        } else {
          this.draftInquiries = [];
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
      id: order.orderNumber,
      machine: machineName,
      dateCreated: formattedDate,
      partsOrdered: totalItems,
      status: status,
      internalReference: order.id
    };
  }
}
