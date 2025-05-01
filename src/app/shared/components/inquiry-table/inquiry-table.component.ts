import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inquiry-table.component.html',
  styleUrls: ['./inquiry-table.component.scss']
})
export class InquiryTableComponent {
  @Input() inquiries: InquiryHistory[] = [];
}
