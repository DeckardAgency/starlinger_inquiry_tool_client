import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-support-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="isOpen" class="modal-overlay" (click)="closeOnBackdrop($event)" [@fadeAnimation]>
      <div class="modal-container" [@slideAnimation]>
        <div class="modal-header">
          <div class="modal-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M4.93 19.07C5.9 20.03 7.25 20.59 8.75 20.59H15.25C16.75 20.59 18.1 20.03 19.07 19.07C20.03 18.1 20.59 16.75 20.59 15.25V8.75C20.59 7.25 20.03 5.9 19.07 4.93C18.1 3.97 16.75 3.41 15.25 3.41H8.75C7.25 3.41 5.9 3.97 4.93 4.93C3.97 5.9 3.41 7.25 3.41 8.75V15.25C3.41 16.75 3.97 18.1 4.93 19.07Z" stroke="#DC2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9 9.41L15 15.41M15 9.41L9 15.41" stroke="#DC2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Contact Service area manager
          </div>
          <button class="modal-close" (click)="close()">
            <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <div class="modal-content">
          <form (ngSubmit)="submitForm()" #supportForm="ngForm">
            <div class="form-group">
              <label for="subject">Subject <span class="required">(Required)</span></label>
              <input
                type="text"
                id="subject"
                name="subject"
                [(ngModel)]="formData.subject"
                required
                placeholder="Summarize your inquiry in one or two sentences."
                class="form-control">
            </div>

            <div class="form-group">
              <label for="message">Message <span class="required">(Required)</span></label>
              <textarea
                id="message"
                name="message"
                [(ngModel)]="formData.message"
                required
                placeholder="Enter your message here. Include any relevant details, questions, or requests."
                class="form-control form-textarea"
                rows="5"></textarea>
            </div>

            <div class="form-group">
              <label for="orderId">Order/Inquiry ID <span class="optional">(Optional)</span></label>
              <input
                type="text"
                id="orderId"
                name="orderId"
                [(ngModel)]="formData.orderId"
                placeholder="Summarize your inquiry in one or two sentences."
                class="form-control">
            </div>

            <div class="form-group">
              <label for="machine">Machine/Product <span class="optional">(Optional)</span></label>
              <input
                type="text"
                id="machine"
                name="machine"
                [(ngModel)]="formData.machine"
                placeholder="Summarize your inquiry in one or two sentences."
                class="form-control">
            </div>

            <div class="form-group">
              <label for="attachment">Attachment <span class="optional">(Optional)</span></label>
              <div class="file-input-wrapper">
                <label for="fileUpload" class="custom-file-upload">
                  Choose file
                </label>
                <input
                  type="file"
                  id="fileUpload"
                  name="fileUpload"
                  (change)="onFileSelected($event)"
                  class="file-input">
                <span class="file-name">{{ fileName }}</span>
              </div>
            </div>

            <div class="form-group">
              <label for="urgency">Urgency</label>
              <div class="select-wrapper">
                <select
                  id="urgency"
                  name="urgency"
                  [(ngModel)]="formData.urgency"
                  class="form-control">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <span class="select-arrow">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 6L8 10L12 6" stroke="#3F3F46" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
              </div>
            </div>

            <button type="submit" [disabled]="!supportForm.valid || isSubmitting" class="submit-button">
              <span *ngIf="!isSubmitting">Send message</span>
              <span *ngIf="isSubmitting">Sending...</span>
              <svg *ngIf="!isSubmitting" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10.0003 18.3334C14.6027 18.3334 18.3337 14.6024 18.3337 10C18.3337 5.39765 14.6027 1.66669 10.0003 1.66669C5.39795 1.66669 1.66699 5.39765 1.66699 10C1.66699 14.6024 5.39795 18.3334 10.0003 18.3334Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M10 13.3333L13.3333 10M13.3333 10L10 6.66666M13.3333 10H6.66667" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-container {
      background: #FFFFFF;
      border-radius: 0.5rem;
      width: 90%;
      max-width: 600px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px;
      border-bottom: 1px solid #F3F4F6;
    }

    .modal-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 1.25rem;
      font-weight: 600;
      color: #18181B;
    }

    .modal-close {
      background: none;
      border: none;
      cursor: pointer;
      color: #71717A;
      display: flex;
      padding: 4px;
      border-radius: 4px;
      transition: background-color 0.2s;
    }

    .modal-close:hover {
      background-color: #F4F4F5;
    }

    .modal-content {
      padding: 24px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      color: #18181B;
      margin-bottom: 8px;
    }

    .required {
      color: #71717A;
      font-weight: normal;
      font-size: 0.75rem;
    }

    .optional {
      color: #71717A;
      font-weight: normal;
      font-size: 0.75rem;
    }

    .form-control {
      width: 100%;
      padding: 10px 12px;
      font-size: 0.875rem;
      border: 1px solid #E4E4E7;
      border-radius: 4px;
      transition: border-color 0.2s;
      box-sizing: border-box;
    }

    .form-control:focus {
      outline: none;
      border-color: #DC2626;
    }

    .form-textarea {
      resize: vertical;
      min-height: 100px;
    }

    .file-input-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .custom-file-upload {
      background-color: #F4F4F5;
      border: 1px solid #E4E4E7;
      padding: 8px 16px;
      border-radius: 4px;
      font-size: 0.875rem;
      cursor: pointer;
      color: #18181B;
    }

    .file-input {
      display: none;
    }

    .file-name {
      font-size: 0.875rem;
      color: #52525B;
    }

    .select-wrapper {
      position: relative;
    }

    .select-arrow {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      pointer-events: none;
    }

    .submit-button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background-color: #18181B;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 12px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
      width: 100%;
    }

    .submit-button:hover {
      background-color: #27272A;
    }

    .submit-button:disabled {
      background-color: #71717A;
      cursor: not-allowed;
    }

    @media screen and (max-width: 480px) {
      .modal-container {
        width: 95%;
        max-height: 95vh;
      }
    }
  `],
  animations: [
    trigger('fadeAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0 }))
      ])
    ]),
    trigger('slideAnimation', [
      transition(':enter', [
        style({ transform: 'translateY(-50px)', opacity: 0 }),
        animate('300ms 100ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'translateY(-50px)', opacity: 0 }))
      ])
    ])
  ]
})
export class SupportModalComponent {
  @Input() isOpen = false;
  @Output() isOpenChange = new EventEmitter<boolean>();

  formData = {
    subject: '',
    message: '',
    orderId: '',
    machine: '',
    urgency: 'medium'
  };

  fileName = 'No file chosen';
  isSubmitting = false;
  selectedFile: File | null = null;

  close(): void {
    this.isOpen = false;
    this.isOpenChange.emit(false);
    this.resetForm();
  }

  closeOnBackdrop(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.close();
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.fileName = this.selectedFile.name;
    } else {
      this.selectedFile = null;
      this.fileName = 'No file chosen';
    }
  }

  submitForm(): void {
    if (this.isSubmitting) return;

    this.isSubmitting = true;

    // Simulate API call
    setTimeout(() => {
      console.log('Form data:', this.formData);
      console.log('Selected file:', this.selectedFile);

      this.isSubmitting = false;
      this.close();

      // You could show a success message here
      alert('Support request sent successfully!');
    }, 1500);
  }

  private resetForm(): void {
    this.formData = {
      subject: '',
      message: '',
      orderId: '',
      machine: '',
      urgency: 'medium'
    };
    this.fileName = 'No file chosen';
    this.selectedFile = null;
  }
}
