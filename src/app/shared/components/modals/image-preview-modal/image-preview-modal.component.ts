import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image-preview-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="image-modal-overlay" (click)="close()">
      <div class="image-modal-content" (click)="$event.stopPropagation()">
        <button class="image-modal-close" (click)="close()">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <div class="image-modal-body">
          <img [src]="imageSrc" [alt]="imageAlt" class="preview-image">
        </div>
      </div>
    </div>
  `,
  styles: [`
    .image-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .image-modal-content {
      background-color: white;
      border-radius: 8px;
      position: relative;
      max-width: 90vw;
      max-height: 90vh;
      overflow: hidden;
    }

    .image-modal-close {
      position: absolute;
      top: 12px;
      right: 12px;
      background-color: white;
      border: none;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      z-index: 1;
    }

    .image-modal-body {
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .preview-image {
      max-width: 100%;
      max-height: 80vh;
      object-fit: contain;
    }
  `]
})
export class ImagePreviewModalComponent {
  @Input() imageSrc: string = '';
  @Input() imageAlt: string = 'Image preview';
  @Output() closeModal = new EventEmitter<void>();

  close(): void {
    this.closeModal.emit();
  }
}
