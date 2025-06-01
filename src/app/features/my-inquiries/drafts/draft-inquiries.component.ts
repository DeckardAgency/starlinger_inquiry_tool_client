import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbsComponent } from '@shared/components/ui/breadcrumbs/breadcrumbs.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { OrderService } from '@services/http/order.service';
import { AuthService } from '@core/auth/auth.service';
import { Order } from '@models/order.model';

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
      status: order.status || 'draft'
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
    // Navigate to edit page or open edit modal
    console.log('Edit inquiry:', inquiry);
    // this.router.navigate(['/inquiries/edit', inquiry.id]);
  }

  onDelete(inquiry: DraftInquiry): void {
    // Implement delete functionality with confirmation
    if (confirm(`Are you sure you want to delete this draft inquiry?`)) {
      console.log('Delete inquiry:', inquiry);
      // Call delete service method here
    }
  }

  onMoreOptions(inquiry: DraftInquiry): void {
    // Open context menu or dropdown with more options
    console.log('More options for inquiry:', inquiry);
  }
}
