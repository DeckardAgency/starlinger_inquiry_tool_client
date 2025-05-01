import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inquiry-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inquiry-history.component.html',
  styleUrls: ['./inquiry-history.component.scss']
})
export class InquiryHistoryComponent implements OnInit {
  inquiryHistory: any[] = [];
  filteredHistory: any[] = [];
  statusFilter: string = 'all';
  dateFilter: string = 'all';

  constructor() { }

  ngOnInit(): void {
    // Initialize inquiry history or fetch from a service
    this.loadInquiryHistory();
    this.applyFilters();
  }

  loadInquiryHistory(): void {
    // This would typically come from a service
    this.inquiryHistory = [
      {
        id: 201,
        title: 'Product Return Request',
        status: 'Resolved',
        dateCreated: new Date(Date.now() - 7 * 86400000),
        dateClosed: new Date(Date.now() - 2 * 86400000),
        category: 'Returns'
      },
      {
        id: 202,
        title: 'Shipping Delay Inquiry',
        status: 'Closed',
        dateCreated: new Date(Date.now() - 14 * 86400000),
        dateClosed: new Date(Date.now() - 10 * 86400000),
        category: 'Shipping'
      },
      {
        id: 203,
        title: 'Account Verification Issue',
        status: 'Resolved',
        dateCreated: new Date(Date.now() - 30 * 86400000),
        dateClosed: new Date(Date.now() - 28 * 86400000),
        category: 'Account'
      },
      {
        id: 204,
        title: 'Payment Processing Error',
        status: 'Escalated',
        dateCreated: new Date(Date.now() - 5 * 86400000),
        dateClosed: new Date(Date.now() - 1 * 86400000),
        category: 'Billing'
      }
    ];
  }

  applyFilters(): void {
    this.filteredHistory = this.inquiryHistory.filter(inquiry => {
      // Status filter
      if (this.statusFilter !== 'all' && inquiry.status !== this.statusFilter) {
        return false;
      }

      // Date filter
      if (this.dateFilter === 'week') {
        const oneWeekAgo = new Date(Date.now() - 7 * 86400000);
        return new Date(inquiry.dateClosed) >= oneWeekAgo;
      } else if (this.dateFilter === 'month') {
        const oneMonthAgo = new Date(Date.now() - 30 * 86400000);
        return new Date(inquiry.dateClosed) >= oneMonthAgo;
      }

      return true;
    });
  }

  setStatusFilter(status: string): void {
    this.statusFilter = status;
    this.applyFilters();
  }

  setDateFilter(date: string): void {
    this.dateFilter = date;
    this.applyFilters();
  }

  viewInquiryDetails(id: number): void {
    // Logic to view inquiry details
    console.log(`View details for inquiry with ID: ${id}`);
  }
}
