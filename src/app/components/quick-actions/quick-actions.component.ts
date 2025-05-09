import { Component, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InquiryModalService } from '../../services/inquiry-modal.service';
import { Subscription } from 'rxjs';
import {InquiryModalComponent} from './inquiry-modal.component';

@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [CommonModule, RouterModule, InquiryModalComponent],
  templateUrl: "quick-actions.component.html",
  styleUrls: ["quick-actions.component.scss"]
})
export class QuickActionsComponent implements OnDestroy {
  isModalOpen = false;
  private subscription: Subscription;

  // Make modalService public so it can be accessed from the template
  public modalService = inject(InquiryModalService);

  constructor() {
    this.subscription = this.modalService.isOpen$.subscribe(isOpen => {
      this.isModalOpen = isOpen;
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  openInquiryModal(event: Event): void {
    event.preventDefault();
    this.modalService.open();
  }
}
