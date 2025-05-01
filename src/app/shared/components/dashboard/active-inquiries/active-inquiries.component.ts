import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
// import { Inquiry, InquiryStatus } from '@core/models';
import { InquiryCardComponent } from '@shared/components/inquiry-card/inquiry-card.component';

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
  imports: [CommonModule, RouterModule, InquiryCardComponent],
  templateUrl: './active-inquiries.component.html',
  styleUrls: ['./active-inquiries.component.scss']
})
export class ActiveInquiriesComponent {
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
      id: '0001',
      machine: 'CNC-5000',
      dateCreated: '14-03-2024',
      partsOrdered: 12,
      status: 'Submitted',
      internalReference: '000123-ABC'
    },
    {
      id: '0001',
      machine: 'CNC-5000',
      dateCreated: '14-03-2024',
      partsOrdered: 12,
      status: 'Submitted',
      internalReference: '000123-ABC'
    }
  ];
}
