import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-active-inquiries',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './active-inquiries.component.html',
  styleUrls: ['./active-inquiries.component.scss']
})
export class ActiveInquiriesComponent implements OnInit {
  activeInquiries: any[] = [];

  constructor() { }

  ngOnInit(): void {
    // Initialize active inquiries or fetch from a service
    this.loadActiveInquiries();
  }

  loadActiveInquiries(): void {
    // This would typically come from a service
    this.activeInquiries = [
      { id: 1, title: 'Product Inquiry', status: 'In Progress', updatedDate: new Date() },
      { id: 2, title: 'Service Request', status: 'Awaiting Response', updatedDate: new Date() },
      { id: 3, title: 'Technical Support', status: 'Open', updatedDate: new Date() }
    ];
  }
}
