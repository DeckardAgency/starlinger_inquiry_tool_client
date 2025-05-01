import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbsComponent } from '@shared/components/ui/breadcrumbs/breadcrumbs.component';
import {RouterLink} from '@angular/router';
import {InquiryCardComponent} from '@shared/components/inquiry-card/inquiry-card.component';
import {IconComponent} from '@shared/components/icon/icon.component';

export interface Inquiry {
  id: string;
  machine?: string;
  dateCreated: string;
  partsOrdered: number;
  status: 'Submitted' | 'Processing' | 'Shipped' | 'Completed' | 'Cancelled';
  internalReference?: string;
}

@Component({
  selector: 'app-active-inquiries',
  standalone: true,
  imports: [CommonModule, BreadcrumbsComponent, InquiryCardComponent, IconComponent],
  templateUrl: './active-inquiries.component.html',
  styleUrls: ['./active-inquiries.component.scss']
})
export class ActiveInquiriesComponent implements OnInit {

  ngOnInit(): void {
      // throw new Error('Method not implemented.');
  }

  breadcrumbs = [
    { label: 'My inquiries', link: '/my-inquiries' },
    { label: 'Active Inquiries' }
  ];

  activeInquiries: Inquiry[] = [
    {
      id: '0001',
      machine: 'CNC-5000',
      dateCreated: '14-03-2024',
      partsOrdered: 12,
      status: 'Submitted',
      internalReference: '000123-ABC'
    },
    {
      id: '0002',
      machine: 'Laser-X200',
      dateCreated: '15-03-2024',
      partsOrdered: 5,
      status: 'Processing',
      internalReference: '000124-DEF'
    },
    {
      id: '0003',
      machine: 'Mill-PRO',
      dateCreated: '16-03-2024',
      partsOrdered: 8,
      status: 'Shipped',
      internalReference: '000125-GHI'
    },
    {
      id: '0001',
      machine: 'CNC-5000',
      dateCreated: '14-03-2024',
      partsOrdered: 12,
      status: 'Submitted',
      internalReference: '000123-ABC'
    },
    {
      id: '0002',
      machine: 'Laser-X200',
      dateCreated: '15-03-2024',
      partsOrdered: 5,
      status: 'Processing',
      internalReference: '000124-DEF'
    },
    {
      id: '0003',
      machine: 'Mill-PRO',
      dateCreated: '16-03-2024',
      partsOrdered: 8,
      status: 'Shipped',
      internalReference: '000125-GHI'
    }
  ];
}
