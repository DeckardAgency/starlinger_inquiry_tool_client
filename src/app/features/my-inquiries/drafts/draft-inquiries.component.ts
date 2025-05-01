import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-draft-inquiries',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './draft-inquiries.component.html',
  styleUrls: ['./draft-inquiries.component.scss']
})
export class DraftInquiriesComponent implements OnInit {
  draftInquiries: any[] = [];

  constructor() { }

  ngOnInit(): void {
    // Initialize draft inquiries or fetch from a service
    this.loadDraftInquiries();
  }

  loadDraftInquiries(): void {
    // This would typically come from a service
    this.draftInquiries = [
      { id: 101, title: 'New Feature Request', createdDate: new Date(), lastSaved: new Date() },
      { id: 102, title: 'Billing Question', createdDate: new Date(Date.now() - 86400000), lastSaved: new Date() },
      { id: 103, title: 'Account Information Update', createdDate: new Date(Date.now() - 172800000), lastSaved: new Date() }
    ];
  }

  deleteDraft(id: number): void {
    this.draftInquiries = this.draftInquiries.filter(draft => draft.id !== id);
  }

  continueDraft(id: number): void {
    // Logic to continue editing the draft
    console.log(`Continue editing draft with ID: ${id}`);
  }
}
