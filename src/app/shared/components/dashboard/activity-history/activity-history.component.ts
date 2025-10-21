import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { catchError, finalize, forkJoin, of } from 'rxjs';
import { OrderInquiryTableComponent } from '@shared/components/order-inquiry-table/order-inquiry-table.component';
import {
  DATA_SOURCE,
  DataSource,
  INQUIRY_TYPE,
  ORDER_STATUS,
  OrderStatus,
  OrderInquiryAction,
  OrderInquiryItem,
  OrderInquiryTab,
  OrderInquiryTableConfig,
  TabChangeEvent
} from '@shared/components/order-inquiry-table/order-inquiry-table.types';
import { OrderService, OrderResponse, OrdersCollection } from '@services/http/order.service';
import { InquiryService, InquiryResponse, InquiriesCollection } from '@services/http/inquiry.service';
import { AuthService } from '@core/auth/auth.service';

@Component({
  selector: 'app-activity-history',
  standalone: true,
  imports: [CommonModule, RouterModule, OrderInquiryTableComponent],
  templateUrl: './activity-history.component.html',
  styleUrls: ['./activity-history.component.scss']
})
export class ActivityHistoryComponent implements OnInit {
  inquiries: OrderInquiryItem[] = [];
  orders: OrderInquiryItem[] = [];
  loading = false;
  error: string | null = null;
  currentDataSource: DataSource = DATA_SOURCE.BOTH;

  tableConfig: Partial<OrderInquiryTableConfig> = {
    loadDataOnTabChange: false, // Set to false since we're loading all data at once
    dataSource: DATA_SOURCE.BOTH,
    enableSorting: true,
    enableFiltering: true,
    pageSize: 10,
    showPagination: true
  };

  constructor(
    private orderService: OrderService,
    private inquiryService: InquiryService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    this.loading = true;
    this.error = null;

    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      this.error = 'User not authenticated';
      this.loading = false;
      return;
    }

    // Get current user from auth service
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser || !currentUser.email) {
      this.error = 'User information not available';
      this.loading = false;
      return;
    }

    // Fetch both orders and inquiries in parallel
    forkJoin({
      orders: this.orderService.getOrdersByUserEmail(currentUser.email).pipe(
        catchError(err => {
          console.error('Error loading orders:', err);
          return of(this.getEmptyOrdersCollection());
        })
      ),
      inquiries: this.inquiryService.getInquiriesByUserEmail(currentUser.email).pipe(
        catchError(err => {
          console.error('Error loading inquiries:', err);
          return of(this.getEmptyInquiriesCollection());
        })
      )
    })
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(({ orders, inquiries }) => {
        // Map orders to OrderInquiryItem format
        if (orders.member && orders.member.length > 0) {
          this.orders = orders.member.map(order => this.mapOrderToInquiryItem(order));
        }

        // Map inquiries to OrderInquiryItem format
        if (inquiries.member && inquiries.member.length > 0) {
          this.inquiries = inquiries.member.map(inquiry => this.mapInquiryToInquiryItem(inquiry));
        }
      });
  }

  private mapOrderToInquiryItem(order: OrderResponse): OrderInquiryItem {
    // Determine the type based on some logic (you might need to adjust this)
    const type = order.items && order.items.length > 1 ? INQUIRY_TYPE.ORDER : INQUIRY_TYPE.ORDER;

    // Map API status to component status
    const status = this.mapApiStatusToComponentStatus(order.status);

    // Count the number of distinct products (not the sum of quantities)
    const partsOrdered = order.items ? order.items.length : 0;

    // Extract customer info from order (you might need to adjust based on actual data structure)
    const customerName = this.extractCustomerName(order);

    return {
      id: order.orderNumber,
      type: type,
      dateCreated: order.createdAt,
      internalReferenceNumber: order.id,
      customer: {
        id: "",
        name: customerName,
        initials: this.getInitials(customerName),
        image: undefined
      },
      partsOrdered: partsOrdered,
      status: status,
      source: 'order' as const
    };
  }

  private mapInquiryToInquiryItem(inquiry: InquiryResponse): OrderInquiryItem {
    // Determine the type based on inquiry data
    const type = inquiry.isDraft ? INQUIRY_TYPE.MANUAL : INQUIRY_TYPE.ORDER;

    // Map inquiry status to component status
    const status = this.mapApiStatusToComponentStatus(inquiry.status);

    // Count total parts from all machines
    const partsOrdered = inquiry.machines
      ? inquiry.machines.reduce((sum, machine) => sum + (machine.products ? machine.products.length : 0), 0)
      : 0;

    // Extract customer info
    const customerName = this.extractCustomerNameFromInquiry(inquiry);

    return {
      id: inquiry.inquiryNumber,
      type: type,
      dateCreated: inquiry.createdAt,
      internalReferenceNumber: inquiry.id,
      customer: {
        id: inquiry.user.split('/').pop() || '',
        name: customerName,
        initials: this.getInitials(customerName),
        image: undefined
      },
      partsOrdered: partsOrdered,
      status: status,
      source: 'inquiry' as const
    };
  }

  private mapApiStatusToComponentStatus(apiStatus: string): OrderStatus {
    // Map API statuses to component statuses
    const statusMap: Record<string, OrderStatus> = {
      'canceled': ORDER_STATUS.CANCELED,
      'completed': ORDER_STATUS.COMPLETED,
      'dispatched': ORDER_STATUS.DISPATCHED,
      'confirmed': ORDER_STATUS.CONFIRMED,
      'submitted': ORDER_STATUS.SUBMITTED,
    };

    return statusMap[apiStatus.toLowerCase()] || ORDER_STATUS.SUBMITTED;
  }

  private extractCustomerName(order: OrderResponse): string {
    // Try to extract customer name from order data
    // This is a placeholder - adjust based on your actual data structure
    if (order.shippingAddress) {
      // Parse shipping address to get name
      const addressLines = order.shippingAddress.split('\n');
      if (addressLines.length > 0) {
        return addressLines[0];
      }
    }
    return 'Unknown Customer';
  }

  private extractCustomerNameFromInquiry(inquiry: InquiryResponse): string {
    // Extract name from email if available
    if (inquiry.contactEmail) {
      const namePart = inquiry.contactEmail.split('@')[0];
      return namePart
        .split(/[._-]/)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
    }
    return 'Unknown Customer';
  }

  private getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  private getEmptyOrdersCollection(): OrdersCollection {
    return {
      '@context': '',
      '@id': '',
      '@type': '',
      'totalItems': 0,
      'member': [],
      'view': { '@id': '', '@type': '' },
      'search': { '@type': '', 'template': '', 'variableRepresentation': '', 'mapping': [] }
    };
  }

  private getEmptyInquiriesCollection(): InquiriesCollection {
    return {
      '@context': '',
      '@id': '',
      '@type': '',
      'totalItems': 0,
      'member': [],
      'view': { '@id': '', '@type': '' },
      'search': { '@type': '', 'template': '', 'variableRepresentation': '', 'mapping': [] }
    };
  }

  onTabChange(event: TabChangeEvent): void {
    // Since we load all data at once, we don't need to reload on tab change
  }

  onItemAction(action: OrderInquiryAction): void {
    switch (action.type) {
      case 'view':
        this.viewItem(action.item);
        break;
      case 'edit':
        this.editItem(action.item);
        break;
      case 'delete':
        this.deleteItem(action.item);
        break;
      case 'export':
        this.exportItem(action.item);
        break;
    }
  }

  onLoadData(tab: OrderInquiryTab): void {
    // Since we load all data at once, we can skip this
  }

  onConfigChange(config: OrderInquiryTableConfig): void {
    // Save configuration preferences
    localStorage.setItem('orderInquiryTableConfig', JSON.stringify(config));
  }

  private viewItem(item: OrderInquiryItem): void {
    // Navigate to detail view based on source
    if (item.source === 'order') {
      // Navigate to order detail
      // this.router.navigate(['/orders', item.internalReferenceNumber]);
    } else {
      // Navigate to inquiry detail
      // this.router.navigate(['/inquiries', item.internalReferenceNumber]);
    }
  }

  private editItem(item: OrderInquiryItem): void {
    // Open edit dialog based on source
  }

  private deleteItem(item: OrderInquiryItem): void {
    // Show confirmation dialog
  }

  private exportItem(item: OrderInquiryItem): void {
    // Export to CSV/PDF
  }
}
