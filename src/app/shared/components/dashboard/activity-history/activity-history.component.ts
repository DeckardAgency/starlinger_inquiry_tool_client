import {Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {InquiryTableComponent} from '@shared/components/inquiry-table/inquiry-table.component';
import {InquiryHistory} from '@core/models';

@Component({
  selector: 'app-activity-history',
  standalone: true,
  imports: [CommonModule, RouterModule, InquiryTableComponent],
  templateUrl: "activity-history.component.html",
  styleUrls: ['./activity-history.component.scss']
})
export class ActivityHistoryComponent implements OnInit {
  loading = true;

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
  cancelledInquiries: InquiryHistory[] = [];

  // Combine all inquiries for the "All Inquiries" tab
  allInquiries: InquiryHistory[] = [];

  ngOnInit(): void {
    // Simulate data loading with a delay
    this.loading = true;
    setTimeout(() => {
      this.allInquiries = [
        ...this.completedInquiries,
        ...this.confirmedInquiries,
        ...this.processingInquiries,
        ...this.cancelledInquiries
      ].sort((a, b) => b.id.localeCompare(a.id)); // Sort by ID in descending order

      this.loading = true;
    }, 2000); // 2 second delay to simulate loading
  }
}
