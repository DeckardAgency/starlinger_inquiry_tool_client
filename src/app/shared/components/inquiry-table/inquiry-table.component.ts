import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {InquiryShimmerComponent} from '@shared/components/inquiry-table/inquiry-shimmer.component';

interface InquiryHistory {
  id: string;
  machine: string;
  dateCreated: string;
  customer: {
    initials: string;
    name: string;
    image?: string;
  };
  partsOrdered: number;
  status: 'Completed' | 'Confirmed' | 'Processing' | 'Cancelled';
}

@Component({
    selector: 'app-inquiry-table',
    imports: [CommonModule, InquiryShimmerComponent],
    templateUrl: './inquiry-table.component.html',
    styleUrls: ['./inquiry-table.component.scss']
})
export class InquiryTableComponent implements OnInit {
  @Input() inquiries: InquiryHistory[] = [];
  @Input() loading: boolean = false;

  tabs = ['Latest', 'Completed', 'Cancelled'];
  activeTab = 'Latest';
  filteredInquiries: InquiryHistory[] = [];

  ngOnInit(): void {
    this.filterInquiries();
  }

  selectTab(tab: string): void {
    this.activeTab = tab;
    this.filterInquiries();
  }

  filterInquiries(): void {
    if (this.activeTab === 'Latest') {
      this.filteredInquiries = [...this.inquiries];
    } else {
      const status = this.activeTab as 'Latest' | 'Completed' | 'Cancelled';
      this.filteredInquiries = this.inquiries.filter(inquiry => inquiry.status === status);
    }
  }

  get hasData(): boolean {
    return !this.loading && this.inquiries.length > 0;
  }
}
