// src/app/components/advanced-image-preview-modal/advanced-image-preview-modal.component.ts
import { Component, Input, Output, EventEmitter, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-advanced-image-preview-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="image-modal-overlay" (click)="handleClose()">
      <div class="image-modal-content" (click)="$event.stopPropagation()">
        <!-- Modal header with image name and edit title -->
        <div class="image-modal-header">
          <div class="image-title">
            <h2>Edit image</h2>
            <div class="image-filename">{{ imageFileName }}</div>
          </div>
          <button class="close-button" (click)="handleClose()">×</button>
        </div>

        <!-- Toolbar -->
        <div class="image-toolbar">
          <div class="toolbar-group">
            <button class="toolbar-button" title="Link">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>

            <div class="dropdown-button">
              <button class="toolbar-button" title="User Options">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <svg class="dropdown-arrow" width="12" height="12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="m2 4 4 4 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>

            <div class="dropdown-button">
              <button class="toolbar-button" title="Text Formatting">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 7V4h16v3M9 20h6M12 4v16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <svg class="dropdown-arrow" width="12" height="12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="m2 4 4 4 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>

            <div class="dropdown-button">
              <button class="toolbar-button" title="Alignment">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 10H3M21 6H3M21 14H3M21 18H3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <svg class="dropdown-arrow" width="12" height="12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="m2 4 4 4 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="toolbar-divider"></div>

          <div class="toolbar-group">
            <div class="dropdown-button">
              <button class="toolbar-button toolbar-button-active" title="Border Style">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                </svg>
                <svg class="dropdown-arrow" width="12" height="12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="m2 4 4 4 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>

            <div class="dropdown-button">
              <button class="toolbar-button" title="Background Color">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor"/>
                </svg>
                <svg class="dropdown-arrow" width="12" height="12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="m2 4 4 4 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="toolbar-divider"></div>

          <div class="toolbar-group">
            <button class="toolbar-button" title="Undo" (click)="handleUndo()">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 10h10c4 0 7 3 7 7v0c0 4-3 7-7 7H9M3 10l5-5M3 10l5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>

            <button class="toolbar-button" title="Redo" (click)="handleRedo()">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 10H11c-4 0-7 3-7 7v0c0 4 3 7 7 7h4M21 10l-5-5M21 10l-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>

            <button class="toolbar-button" title="Reset" (click)="handleReset()">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9 9h6v6H9z" fill="currentColor"/>
              </svg>
            </button>

            <button class="toolbar-button" [class.toolbar-button-active]="isDrawingMode" title="Comment" (click)="handleComment()">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Image Container -->
        <div class="image-container">
          <div class="image-wrapper" [class.drawing-active]="isDrawingMode">
            <img [src]="imageSrc" [alt]="imageAlt" class="preview-image" #previewImage
                 (load)="onImageLoad()">

            <!-- Annotation overlay if needed -->
            <canvas #annotationCanvas class="annotation-canvas"
                    [class.active]="isDrawingMode"
                    (mousedown)="startDrawing($event)"
                    (mousemove)="draw($event)"
                    (mouseup)="stopDrawing()"
                    (mouseleave)="stopDrawing()"></canvas>

            <!-- Circle annotation like in the example -->
            <div class="annotation-circle" *ngIf="showDemoAnnotation"
                 [style.top.px]="demoAnnotation.y - demoAnnotation.radius"
                 [style.left.px]="demoAnnotation.x - demoAnnotation.radius"
                 [style.width.px]="demoAnnotation.radius * 2"
                 [style.height.px]="demoAnnotation.radius * 2"></div>
          </div>
        </div>

        <!-- Footer with action buttons -->
        <div class="image-modal-footer">
          <button class="btn-secondary" (click)="discardChanges()">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            Discard changes
          </button>
          <button class="btn-primary" (click)="saveChanges()">
            Save
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 9v3a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h3M8 12L16 4M12 4h4v4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --modal-bg: #ffffff;
      --modal-border: #e0e0e0;
      --toolbar-bg: #f8f9fa;
      --toolbar-hover: #e9ecef;
      --toolbar-active: #e2e6ea;
      --toolbar-border: #dee2e6;
      --primary-color: #dc3545;
      --secondary-color: #6c757d;
      --text-color: #343a40;
      --text-light: #6c757d;
    }

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
      z-index: 1050;
    }

    .image-modal-content {
      background-color: var(--modal-bg);
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      width: 90vw;
      max-width: 1200px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .image-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid var(--toolbar-border);
    }

    .image-title {
      display: flex;
      flex-direction: column;
    }

    .image-title h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-color);
    }

    .image-filename {
      font-size: 0.875rem;
      color: var(--text-light);
      margin-top: 4px;
    }

    .close-button {
      background: transparent;
      border: none;
      font-size: 1.5rem;
      line-height: 1;
      color: var(--text-light);
      cursor: pointer;
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: background-color 0.2s;
    }

    .close-button:hover {
      background-color: var(--toolbar-hover);
    }

    .image-toolbar {
      display: flex;
      align-items: center;
      padding: 8px 16px;
      background-color: var(--toolbar-bg);
      border-bottom: 1px solid var(--toolbar-border);
      overflow-x: auto;
    }

    .toolbar-group {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .toolbar-divider {
      width: 1px;
      height: 24px;
      background-color: var(--toolbar-border);
      margin: 0 8px;
    }

    .toolbar-button {
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      width: 36px;
      height: 36px;
      border-radius: 4px;
      cursor: pointer;
      color: var(--text-color);
      padding: 0;
      transition: background-color 0.2s;
    }

    .toolbar-button:hover {
      background-color: var(--toolbar-hover);
    }

    .toolbar-button-active {
      background-color: var(--toolbar-active);
    }

    .dropdown-button {
      position: relative;
    }

    .dropdown-button .toolbar-button {
      display: flex;
      align-items: center;
      padding: 0 8px;
      width: auto;
    }

    .dropdown-arrow {
      margin-left: 4px;
    }

    .image-container {
      flex: 1;
      overflow: auto;
      position: relative;
      padding: 24px;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #f0f0f0;
      min-height: 300px;
    }

    .image-wrapper {
      position: relative;
      display: inline-block;
      max-width: 100%;
      max-height: 100%;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .preview-image {
      display: block;
      max-width: 100%;
      max-height: 60vh;
      object-fit: contain;
    }

    .annotation-canvas {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }

    .annotation-canvas.active {
      pointer-events: auto;
      cursor: crosshair;
    }

    .annotation-circle {
      position: absolute;
      border: 3px solid #dc3545;
      border-radius: 50%;
      pointer-events: none;
    }

    .image-modal-footer {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 12px;
      padding: 16px 20px;
      border-top: 1px solid var(--toolbar-border);
    }

    .btn-primary, .btn-secondary {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 4px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .btn-primary {
      background-color: var(--primary-color);
      color: white;
      border: none;
    }

    .btn-primary:hover {
      background-color: #c82333;
    }

    .btn-secondary {
      background-color: white;
      color: var(--text-color);
      border: 1px solid var(--secondary-color);
    }

    .btn-secondary:hover {
      background-color: var(--toolbar-hover);
    }

    .drawing-active .preview-image {
      cursor: crosshair;
    }
  `]
})
export class AdvancedImagePreviewModalComponent implements OnInit, AfterViewInit {
  @Input() imageSrc: string = '';
  @Input() imageAlt: string = 'Image preview';
  @Input() imageFileName: string = 'image.jpg';
  @Output() closeModal = new EventEmitter<void>();
  @Output() saveImage = new EventEmitter<string>();

  // Canvas references for drawing
  @ViewChild('previewImage') previewImage!: ElementRef<HTMLImageElement>;
  @ViewChild('annotationCanvas') annotationCanvas!: ElementRef<HTMLCanvasElement>;

  // Drawing state
  isDrawingMode: boolean = false;
  isDrawing: boolean = false;
  ctx: CanvasRenderingContext2D | null = null;
  lastX: number = 0;
  lastY: number = 0;

  // History for undo/redo
  history: ImageData[] = [];
  historyIndex: number = -1;

  // Demo annotation (like in the image)
  showDemoAnnotation: boolean = true;
  demoAnnotation = {
    x: 680,
    y: 460,
    radius: 40
  };

  constructor() {}

  ngOnInit(): void {
    // Initialize with demo annotation shown
  }

  ngAfterViewInit(): void {
    // Setup canvas after view is initialized
    setTimeout(() => {
      this.setupCanvas();
    }, 300);
  }

  setupCanvas(): void {
    if (!this.annotationCanvas || !this.previewImage) return;

    const canvas = this.annotationCanvas.nativeElement;
    const img = this.previewImage.nativeElement;

    // Set canvas dimensions to match the image
    canvas.width = img.width;
    canvas.height = img.height;

    // Get the canvas context for drawing
    this.ctx = canvas.getContext('2d');

    // Position the demo annotation
    this.demoAnnotation = {
      x: img.width * 0.75,
      y: img.height * 0.65,
      radius: 40
    };

    // Save initial state in history
    this.saveToHistory();
  }

  onImageLoad(): void {
    this.setupCanvas();
  }

  // Drawing methods
  startDrawing(event: MouseEvent): void {
    if (!this.isDrawingMode || !this.ctx) return;

    this.isDrawing = true;
    const rect = this.annotationCanvas.nativeElement.getBoundingClientRect();
    this.lastX = event.clientX - rect.left;
    this.lastY = event.clientY - rect.top;

    // Start a new path
    this.ctx.beginPath();
  }

  draw(event: MouseEvent): void {
    if (!this.isDrawingMode || !this.isDrawing || !this.ctx) return;

    const rect = this.annotationCanvas.nativeElement.getBoundingClientRect();
    const currentX = event.clientX - rect.left;
    const currentY = event.clientY - rect.top;

    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(currentX, currentY);
    this.ctx.strokeStyle = '#dc3545';
    this.ctx.lineWidth = 3;
    this.ctx.lineCap = 'round';
    this.ctx.stroke();

    this.lastX = currentX;
    this.lastY = currentY;
  }

  stopDrawing(): void {
    if (this.isDrawing) {
      this.isDrawing = false;
      // Save state to history when stroke is complete
      if (this.isDrawingMode) {
        this.saveToHistory();
      }
    }
  }

  // History management
  saveToHistory(): void {
    if (!this.ctx) return;

    const canvas = this.annotationCanvas.nativeElement;

    // Get current state
    const currentState = this.ctx.getImageData(0, 0, canvas.width, canvas.height);

    // If we made changes and aren't at the end of history, truncate the future
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }

    // Add current state to history
    this.history.push(currentState);
    this.historyIndex = this.history.length - 1;
  }

  // Toolbar action handlers
  handleUndo(): void {
    if (!this.ctx || this.historyIndex <= 0) return;

    this.historyIndex--;
    this.ctx.putImageData(this.history[this.historyIndex], 0, 0);
  }

  handleRedo(): void {
    if (!this.ctx || this.historyIndex >= this.history.length - 1) return;

    this.historyIndex++;
    this.ctx.putImageData(this.history[this.historyIndex], 0, 0);
  }

  handleReset(): void {
    if (!this.ctx) return;

    // Clear canvas
    const canvas = this.annotationCanvas.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Reset demo annotation
    this.showDemoAnnotation = false;

    // Save this state to history
    this.saveToHistory();
  }

  handleComment(): void {
    // Toggle drawing mode
    this.isDrawingMode = !this.isDrawingMode;

    // If entering drawing mode, hide the demo annotation
    if (this.isDrawingMode) {
      this.showDemoAnnotation = false;
    }
  }

  // Modal action handlers - renamed method to avoid the duplicate name
  handleClose(): void {
    this.closeModal.emit();
  }

  discardChanges(): void {
    // Discard all changes and close
    this.closeModal.emit();
  }

  saveChanges(): void {
    // Save the edited image
    if (!this.annotationCanvas || !this.previewImage) {
      this.closeModal.emit();
      return;
    }

    const canvas = document.createElement('canvas');
    const image = this.previewImage.nativeElement;

    canvas.width = image.width;
    canvas.height = image.height;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Draw the original image
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

      // Draw the annotations on top
      if (this.ctx) {
        ctx.drawImage(this.annotationCanvas.nativeElement, 0, 0);
      }

      // Draw the circle annotation if visible
      if (this.showDemoAnnotation) {
        ctx.beginPath();
        ctx.arc(this.demoAnnotation.x, this.demoAnnotation.y, this.demoAnnotation.radius, 0, Math.PI * 2);
        ctx.strokeStyle = '#dc3545';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Convert to data URL
      const dataUrl = canvas.toDataURL('image/jpeg');
      this.saveImage.emit(dataUrl);
    }

    this.closeModal.emit();
  }
}
