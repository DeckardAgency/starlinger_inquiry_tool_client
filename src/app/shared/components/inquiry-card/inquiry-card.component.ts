import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface Inquiry {
  id: string;
  machine?: string;
  dateCreated: string;
  partsOrdered: number;
  status: string;
  internalReference?: string;
}

@Component({
  selector: 'app-inquiry-card',
  templateUrl: './inquiry-card.component.html',
  styleUrls: ['./inquiry-card.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class InquiryCardComponent {
  @Input() inquiry!: Inquiry;
}
