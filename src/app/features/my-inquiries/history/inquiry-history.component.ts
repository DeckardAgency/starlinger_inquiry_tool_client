import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbsComponent } from '@shared/components/ui/breadcrumbs/breadcrumbs.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { InquiryTableComponent } from '@shared/components/inquiry-table/inquiry-table.component';
import { InquiryHistory } from '@core/models';
import { OrderService } from '@services/http/order.service';
import { InquiryService } from '@services/http/inquiry.service';
import { AuthService } from '@core/auth/auth.service';
import { catchError, finalize, forkJoin } from 'rxjs';
import { of } from 'rxjs';

interface HistoryItem extends InquiryHistory {
  type: 'Order' | 'Inquiry';
  sourceId: string;
}

@Component({
  selector: 'app-inquiry-history',
  standalone: true,
  imports: [CommonModule, BreadcrumbsComponent, IconComponent, InquiryTableComponent],
  templateUrl: './inquiry-history.component.html',
  styleUrls: ['./inquiry-history.component.scss']
})
export class InquiryHistoryComponent implements OnInit {
  loading = true;
  error: string | null = null;
  activeTab: 'latest' | 'completed' | 'cancelled' = 'latest';

  breadcrumbs = [
    { label: 'My inquiries', link: '/my-inquiries' },
    { label: 'History' }
  ];

  latestInquiries: HistoryItem[] = [];
  completedInquiries: HistoryItem[] = [];
  cancelledInquiries: HistoryItem[] = [];

  constructor(
    private orderService: OrderService,
    private inquiryService: InquiryService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadHistoryData();
  }

  loadHistoryData(): void {
    this.loading = true;
    this.error = null;

    if (!this.authService.isAuthenticated()) {
      this.error = 'User not authenticated';
      this.loading = false;
      return;
    }

    const currentUser = this.authService.getCurrentUser();

    if (!currentUser || !currentUser.email) {
      this.error = 'User information not available';
      this.loading = false;
      return;
    }

    forkJoin({
      orders: this.orderService.getOrdersByUserEmail(currentUser.email).pipe(
        catchError(err => {
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
        })
      ),
      inquiries: this.inquiryService.getSubmittedInquiriesByUserEmail(currentUser.email).pipe(
        catchError(err => {
          console.error('Error loading inquiries:', err);
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
          this.loading = false;
        })
      )
      .subscribe(({ orders, inquiries }) => {
        const historyItems: HistoryItem[] = [];

        // Map orders to HistoryItems
        if (orders.member && orders.member.length > 0) {
          const mappedOrders = orders.member.map(order => this.mapOrderToHistoryItem(order));
          historyItems.push(...mappedOrders);
        }

        // Map inquiries to HistoryItems
        if (inquiries.member && inquiries.member.length > 0) {
          const mappedInquiries = inquiries.member.map(inquiry => this.mapInquiryToHistoryItem(inquiry));
          historyItems.push(...mappedInquiries);
        }

        if (historyItems.length === 0) {
          this.error = 'No history items found';
          return;
        }

        // Sort all items by date descending
        historyItems.sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime());

        // Latest: top 30 items
        this.latestInquiries = historyItems.slice(0, 30);

        // Completed: filter by completed status
        this.completedInquiries = historyItems.filter(item =>
          item.status.toLowerCase() === 'completed'
        );

        // Cancelled: filter by cancelled status
        this.cancelledInquiries = historyItems.filter(item =>
          item.status.toLowerCase() === 'cancelled'
        );
      });
  }

  private mapOrderToHistoryItem(order: any): HistoryItem {
    const userName = order.user?.name || order.user?.email || 'Unknown User';
    const initials = this.getInitials(userName);
    const itemsCount = order.items ? order.items.length : 0;

    return {
      id: order.id,
      sourceId: order.id,
      type: 'Order',
      machine: order.orderNumber || '-',
      dateCreated: order.createdAt,
      customer: {
        initials: initials,
        name: userName,
        image: order.user?.avatar
      },
      partsOrdered: itemsCount,
      status: this.normalizeStatus(order.status)
    } as HistoryItem;
  }

  private mapInquiryToHistoryItem(inquiry: any): HistoryItem {
    const userName = inquiry.user?.name || inquiry.user?.email || 'Unknown User';
    const initials = this.getInitials(userName);
    let partsCount = 0;

    if (inquiry.machines && Array.isArray(inquiry.machines)) {
      partsCount = inquiry.machines.reduce((sum: number, machine: any) => {
        return sum + (machine.products ? machine.products.length : 0);
      }, 0);
    }

    return {
      id: inquiry.id,
      sourceId: inquiry.id,
      type: 'Inquiry',
      machine: inquiry.inquiryNumber || '-',
      dateCreated: inquiry.createdAt,
      customer: {
        initials: initials,
        name: userName,
        image: inquiry.user?.avatar
      },
      partsOrdered: partsCount,
      status: this.normalizeStatus(inquiry.status)
    } as HistoryItem;
  }

  private getInitials(name: string): string {
    if (!name) return 'UN';

    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  private normalizeStatus(status: string): InquiryHistory['status'] {
    const normalizedStatus = status.toLowerCase();

    const mapped: { [key: string]: InquiryHistory['status'] } = {
      'completed': 'Completed',
      'confirmed': 'Confirmed',
      'processing': 'Processing',
      'cancelled': 'Cancelled',
      'submitted': 'Confirmed',
      'pending': 'Processing'
    };

    return mapped[normalizedStatus] || 'Processing';
  }

  setActiveTab(tab: 'latest' | 'completed' | 'cancelled'): void {
    this.activeTab = tab;
  }

  get currentTabInquiries(): HistoryItem[] {
    switch (this.activeTab) {
      case 'completed':
        return this.completedInquiries;
      case 'cancelled':
        return this.cancelledInquiries;
      case 'latest':
      default:
        return this.latestInquiries;
    }
  }

  get currentTabLabel(): string {
    switch (this.activeTab) {
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      case 'latest':
      default:
        return 'Latest';
    }
  }

  retry(): void {
    this.loadHistoryData();
  }
}
