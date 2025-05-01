import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {BreadcrumbsComponent} from '@shared/components/ui/breadcrumbs/breadcrumbs.component';
import {IconComponent} from '@shared/components/icon/icon.component';
import {InquiryCardComponent} from '@shared/components/inquiry-card/inquiry-card.component';
import {RouterLink} from '@angular/router';
import {InquiryTableComponent} from '@shared/components/inquiry-table/inquiry-table.component';
import {InquiryHistory} from '@core/models';

@Component({
  selector: 'app-inquiry-history',
  standalone: true,
  imports: [CommonModule, BreadcrumbsComponent, IconComponent, InquiryCardComponent, RouterLink, InquiryTableComponent],
  templateUrl: './inquiry-history.component.html',
  styleUrls: ['./inquiry-history.component.scss']
})
export class InquiryHistoryComponent implements OnInit {
  ngOnInit(): void {
      // throw new Error('Method not implemented.');
  }
  breadcrumbs = [
    { label: 'My inquiries', link: '/my-inquiries' },
    { label: 'History' }
  ];

  tabs = ['All Inquiries', 'Completed', 'Confirmed', 'Processing', 'Cancelled'];
  activeTab = 'All Inquiries';

  // Completed inquiries
  completedInquiries: InquiryHistory[] = [
    {
      id: '0001',
      machine: 'ad*starKON SX+ 120',
      dateCreated: '14-03-2024',
      customer: {
        initials: 'AK',
        name: 'Anes Kapetanovic'
      },
      partsOrdered: 12,
      status: 'Completed'
    },
    {
      id: '0002',
      machine: 'ad*starKON SX+ 120',
      dateCreated: '14-03-2024',
      customer: {
        initials: 'AK',
        name: 'Anes Kapetanovic'
      },
      partsOrdered: 192,
      status: 'Completed'
    },
    {
      id: '0006',
      machine: 'ad*starKON SX+ 120',
      dateCreated: '14-03-2024',
      customer: {
        initials: 'AK',
        name: 'Anes Kapetanovic'
      },
      partsOrdered: 60,
      status: 'Completed'
    },
    {
      id: '0007',
      machine: 'ad*starKON SX+ 120',
      dateCreated: '14-03-2024',
      customer: {
        initials: 'IJ',
        name: 'Ivan Jozic'
      },
      partsOrdered: 72,
      status: 'Completed'
    }
  ];

  // Confirmed inquiries
  confirmedInquiries: InquiryHistory[] = [
    {
      id: '0003',
      machine: 'ad*starKON SX+ 120',
      dateCreated: '14-03-2024',
      customer: {
        initials: 'ME',
        name: 'Martin Ertl'
      },
      partsOrdered: 48,
      status: 'Confirmed'
    },
    {
      id: '0008',
      machine: 'ad*starKON SX+ 120',
      dateCreated: '14-03-2024',
      customer: {
        initials: 'JK',
        name: 'John Kowalski'
      },
      partsOrdered: 35,
      status: 'Confirmed'
    },
    {
      id: '0009',
      machine: 'ad*starKON SX+ 120',
      dateCreated: '13-03-2024',
      customer: {
        initials: 'RM',
        name: 'Robert Miller'
      },
      partsOrdered: 89,
      status: 'Confirmed'
    }
  ];

  // Processing inquiries
  processingInquiries: InquiryHistory[] = [
    {
      id: '0004',
      machine: 'ad*starKON SX+ 120',
      dateCreated: '14-03-2024',
      customer: {
        initials: 'ME',
        name: 'Martin Ertl'
      },
      partsOrdered: 36,
      status: 'Processing'
    },
    {
      id: '0010',
      machine: 'ad*starKON SX+ 120',
      dateCreated: '13-03-2024',
      customer: {
        initials: 'LB',
        name: 'Lucy Brown'
      },
      partsOrdered: 156,
      status: 'Processing'
    },
    {
      id: '0011',
      machine: 'ad*starKON SX+ 120',
      dateCreated: '13-03-2024',
      customer: {
        initials: 'TS',
        name: 'Tom Smith'
      },
      partsOrdered: 42,
      status: 'Processing'
    }
  ];

  // Cancelled inquiries
  cancelledInquiries: InquiryHistory[] = [
    {
      id: '0005',
      machine: 'ad*starKON SX+ 120',
      dateCreated: '14-03-2024',
      customer: {
        initials: 'AK',
        name: 'Anes Kapetanovic'
      },
      partsOrdered: 24,
      status: 'Cancelled'
    },
    {
      id: '0012',
      machine: 'ad*starKON SX+ 120',
      dateCreated: '12-03-2024',
      customer: {
        initials: 'PW',
        name: 'Peter Wilson'
      },
      partsOrdered: 18,
      status: 'Cancelled'
    },
    {
      id: '0013',
      machine: 'ad*starKON SX+ 120',
      dateCreated: '12-03-2024',
      customer: {
        initials: 'SD',
        name: 'Sarah Davis'
      },
      partsOrdered: 67,
      status: 'Cancelled'
    }
  ];

  // Combine all inquiries for the "All Inquiries" tab
  allInquiries: InquiryHistory[] = [
    ...this.completedInquiries,
    ...this.confirmedInquiries,
    ...this.processingInquiries,
    ...this.cancelledInquiries
  ].sort((a, b) => b.id.localeCompare(a.id)); // Sort by ID in descending order

  get inquiryHistory(): InquiryHistory[] {
    switch (this.activeTab) {
      case 'Completed':
        return this.completedInquiries;
      case 'Confirmed':
        return this.confirmedInquiries;
      case 'Processing':
        return this.processingInquiries;
      case 'Cancelled':
        return this.cancelledInquiries;
      default:
        return this.allInquiries;
    }
  }
}
