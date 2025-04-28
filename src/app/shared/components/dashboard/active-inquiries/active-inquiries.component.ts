import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Inquiry {
  id: string;
  machine: string;
  dateCreated: string;
  partsOrdered: number;
  status: 'Submitted' | 'Processing' | 'Confirmed';
}

@Component({
  selector: 'app-active-inquiries',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './active-inquiries.component.html',
  styleUrls: ['./active-inquiries.component.scss']
})
export class ActiveInquiriesComponent {
  activeInquiries: Inquiry[] = [
    {
      id: '0001',
      machine: 'ad*starKON SX+ 120',
      dateCreated: '14-03-2024',
      partsOrdered: 12,
      status: 'Submitted'
    },
    {
      id: '0002',
      machine: 'ad*starKON SX+ 120',
      dateCreated: '14-03-2024',
      partsOrdered: 12,
      status: 'Processing'
    },
    {
      id: '0003',
      machine: 'ad*starKON SX+ 120',
      dateCreated: '14-03-2024',
      partsOrdered: 12,
      status: 'Confirmed'
    }
  ];
}
