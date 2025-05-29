import { Component, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { InquiryModalComponent } from '../../modals/inquiry-modal/inquiry-modal.component';
import { InquiryModalService } from '@services/inquiry-modal.service';
import { IconComponent } from '@shared/components/icon/icon.component';

@Component({
    selector: 'app-quick-actions',
    imports: [CommonModule, RouterModule, InquiryModalComponent, IconComponent],
    templateUrl: "quick-actions.component.html",
    styleUrls: ["quick-actions.component.scss"]
})
export class QuickActionsComponent implements OnDestroy {
  isModalOpen = false;
  private subscription: Subscription;

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
