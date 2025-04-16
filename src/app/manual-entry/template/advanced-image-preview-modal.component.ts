// src/app/components/advanced-image-preview-modal/advanced-image-preview-modal.component.ts
import { Component, Input, Output, EventEmitter, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

enum DrawingMode {
  None = 'none',
  Freehand = 'freehand',
  Circle = 'circle',
  Text = 'text'
}

interface Annotation {
  type: string;
  x: number;
  y: number;
  text?: string;
  radius?: number;
  color: string;
  fontSize?: number;
  rotation?: number;
}

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
            <button class="toolbar-button" [class.toolbar-button-active]="drawingMode === DrawingMode.Freehand" title="Freehand Draw" (click)="toggleDrawingMode(DrawingMode.Freehand)">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 21c3-3 5-6 12-10M9 3l1.5 1.5M11 5.5l1.5 1.5M13 8l1.5 1.5M15 10.5l1.5 1.5M17 13l1.5 1.5M19 15.5l1.5 1.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>

            <button class="toolbar-button" [class.toolbar-button-active]="drawingMode === DrawingMode.Circle" title="Circle" (click)="toggleDrawingMode(DrawingMode.Circle)">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>

            <button class="toolbar-button" [class.toolbar-button-active]="drawingMode === DrawingMode.Text" title="Add Text" (click)="toggleDrawingMode(DrawingMode.Text)">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 7V4h16v3M9 20h6M12 4v16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>

            <!-- Crop button -->
            <button class="toolbar-button" [class.toolbar-button-active]="isCropMode" title="Crop" (click)="toggleCropMode()">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 2v4h12v12h4M16 16H4V4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>

            <!-- Rotate buttons -->
            <button class="toolbar-button" title="Rotate Left" (click)="rotateImage(-90)">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 12a10 10 0 1 1 10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 12h10M2 12l4-4M2 12l4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>

            <button class="toolbar-button" title="Rotate Right" (click)="rotateImage(90)">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 12a10 10 0 1 0-10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M22 12H12M22 12l-4-4M22 12l-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>

          <div class="toolbar-divider"></div>

          <!-- Color picker for annotations -->
          <div class="toolbar-group">
            <div class="color-picker-container">
              <label>Color:</label>
              <input type="color" [(ngModel)]="currentColor" class="color-picker">
            </div>
          </div>

          <div class="toolbar-divider"></div>

          <!-- Text controls (visible only in text mode) -->
          <div *ngIf="drawingMode === DrawingMode.Text" class="toolbar-group text-controls">
            <div class="font-size-control">
              <label>Font Size:</label>
              <input type="number" [(ngModel)]="fontSize" min="10" max="72" step="2" class="font-size-input">
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
          </div>
        </div>

        <!-- Image Container -->
        <div class="image-container">
          <div class="image-wrapper"
               [class.drawing-active]="drawingMode !== DrawingMode.None"
               [class.crop-active]="isCropMode"
               [style.transform]="'rotate(' + imageRotation + 'deg)'">

            <img [src]="imageSrc" [alt]="imageAlt" class="preview-image" #previewImage
                 (load)="onImageLoad()">

            <!-- Annotation overlay if needed -->
            <canvas #annotationCanvas class="annotation-canvas"
                    [class.active]="drawingMode !== DrawingMode.None || isCropMode"
                    (mousedown)="startDrawing($event)"
                    (mousemove)="draw($event)"
                    (mouseup)="stopDrawing()"
                    (mouseleave)="stopDrawing()"></canvas>

            <!-- Text input overlay (only visible when adding text) -->
            <div *ngIf="isAddingText" class="text-input-overlay"
                 [style.left.px]="textPosition.x"
                 [style.top.px]="textPosition.y">
              <input #textInput type="text" [(ngModel)]="currentText"
                     (keyup.enter)="confirmTextInput()"
                     (blur)="confirmTextInput()"
                     class="text-annotation-input"
                     [style.font-size.px]="fontSize">
            </div>

            <!-- Crop overlay if needed -->
            <div *ngIf="isCropMode && cropStarted" class="crop-overlay"
                 [style.left.px]="Math.min(cropStart.x, cropEnd.x)"
                 [style.top.px]="Math.min(cropStart.y, cropEnd.y)"
                 [style.width.px]="Math.abs(cropEnd.x - cropStart.x)"
                 [style.height.px]="Math.abs(cropEnd.y - cropStart.y)">
              <div class="crop-handles">
                <div class="crop-handle top-left"></div>
                <div class="crop-handle top-right"></div>
                <div class="crop-handle bottom-left"></div>
                <div class="crop-handle bottom-right"></div>
              </div>
            </div>
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

          <!-- Apply crop button only visible in crop mode -->
          <button *ngIf="isCropMode && cropStarted" class="btn-primary" (click)="applyCrop()">
            Apply Crop
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

    .color-picker-container {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .color-picker {
      width: 32px;
      height: 32px;
      padding: 0;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .text-controls {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .font-size-control {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .font-size-input {
      width: 60px;
      padding: 4px 8px;
      border: 1px solid var(--toolbar-border);
      border-radius: 4px;
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
      transition: transform 0.3s ease;
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

    .drawing-active .preview-image {
      cursor: crosshair;
    }

    .text-input-overlay {
      position: absolute;
      z-index: 10;
    }

    .text-annotation-input {
      background: rgba(255, 255, 255, 0.8);
      border: 1px solid #ddd;
      padding: 4px;
      min-width: 100px;
    }

    .crop-active .preview-image {
      cursor: crosshair;
    }

    .crop-overlay {
      position: absolute;
      border: 2px dashed var(--primary-color);
      background-color: rgba(220, 53, 69, 0.1);
      z-index: 5;
      pointer-events: none;
    }

    .crop-handles {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }

    .crop-handle {
      position: absolute;
      width: 10px;
      height: 10px;
      background-color: white;
      border: 1px solid var(--primary-color);
    }

    .top-left {
      top: -5px;
      left: -5px;
    }

    .top-right {
      top: -5px;
      right: -5px;
    }

    .bottom-left {
      bottom: -5px;
      left: -5px;
    }

    .bottom-right {
      bottom: -5px;
      right: -5px;
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
  @ViewChild('textInput') textInput!: ElementRef<HTMLInputElement>;

  // Drawing modes
  readonly DrawingMode = DrawingMode;
  drawingMode: DrawingMode = DrawingMode.None;

  // Drawing state
  isDrawing: boolean = false;
  ctx: CanvasRenderingContext2D | null = null;
  lastX: number = 0;
  lastY: number = 0;
  currentColor: string = '#dc3545';

  // Text annotation properties
  isAddingText: boolean = false;
  currentText: string = '';
  textPosition = { x: 0, y: 0 };
  fontSize: number = 24;

  // Circle annotation properties
  circleStartX: number = 0;
  circleStartY: number = 0;

  // Crop properties
  isCropMode: boolean = false;
  cropStarted: boolean = false;
  cropStart = { x: 0, y: 0 };
  cropEnd = { x: 0, y: 0 };

  // Rotation properties
  imageRotation: number = 0;

  // Annotations storage
  annotations: Annotation[] = [];

  // History for undo/redo
  history: ImageData[] = [];
  historyIndex: number = -1;

  // Make Math available in the template
  Math: any = Math;

  constructor() {}

  ngOnInit(): void {
    // Initialization
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

    // Save initial state in history
    this.saveToHistory();
  }

  onImageLoad(): void {
    this.setupCanvas();
  }

  // Toggle drawing modes
  toggleDrawingMode(mode: DrawingMode): void {
    if (this.drawingMode === mode) {
      this.drawingMode = DrawingMode.None;
    } else {
      this.drawingMode = mode;
      this.isCropMode = false; // Disable crop mode when switching to drawing
    }

    // Reset text input if switching away from text mode
    if (this.isAddingText && mode !== DrawingMode.Text) {
      this.isAddingText = false;
    }
  }

  // Toggle crop mode
  toggleCropMode(): void {
    this.isCropMode = !this.isCropMode;
    if (this.isCropMode) {
      this.drawingMode = DrawingMode.None;
      this.cropStarted = false;
    }
  }

  // Rotate image
  rotateImage(degrees: number): void {
    this.imageRotation = (this.imageRotation + degrees) % 360;

    // Need to update canvas setup after rotation
    setTimeout(() => {
      this.setupCanvas();
    }, 300);
  }

  // Drawing methods
  startDrawing(event: MouseEvent): void {
    if (!this.ctx) return;

    const rect = this.annotationCanvas.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (this.isCropMode) {
      // Start crop selection
      this.cropStarted = true;
      this.cropStart = { x, y };
      this.cropEnd = { x, y };
      return;
    }

    if (this.drawingMode === DrawingMode.None) return;

    if (this.drawingMode === DrawingMode.Text) {
      // Set position for text input
      this.textPosition = { x, y };
      this.isAddingText = true;

      // Focus the text input
      setTimeout(() => {
        if (this.textInput) {
          this.textInput.nativeElement.focus();
        }
      }, 0);
      return;
    }

    if (this.drawingMode === DrawingMode.Circle) {
      // Start a circle
      this.circleStartX = x;
      this.circleStartY = y;
    }

    this.isDrawing = true;
    this.lastX = x;
    this.lastY = y;

    // Start a new path for freehand drawing
    if (this.drawingMode === DrawingMode.Freehand) {
      this.ctx.beginPath();
    }
  }

  draw(event: MouseEvent): void {
    const rect = this.annotationCanvas.nativeElement.getBoundingClientRect();
    const currentX = event.clientX - rect.left;
    const currentY = event.clientY - rect.top;

    // Handle crop mode differently
    if (this.isCropMode && this.cropStarted) {
      this.cropEnd = { x: currentX, y: currentY };
      return;
    }

    if (!this.isDrawing || !this.ctx || this.drawingMode === DrawingMode.None || this.drawingMode === DrawingMode.Text) return;

    if (this.drawingMode === DrawingMode.Circle) {
      // Clear the previous frame to redraw the circle
      this.redrawFromHistory();

      // Draw the new circle
      const radius = Math.sqrt(
        Math.pow(currentX - this.circleStartX, 2) +
        Math.pow(currentY - this.circleStartY, 2)
      );

      this.ctx.beginPath();
      this.ctx.arc(this.circleStartX, this.circleStartY, radius, 0, Math.PI * 2);
      this.ctx.strokeStyle = this.currentColor;
      this.ctx.lineWidth = 3;
      this.ctx.stroke();
      return;
    }

    // Freehand drawing
    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(currentX, currentY);
    this.ctx.strokeStyle = this.currentColor;
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
      if (this.drawingMode !== DrawingMode.None) {
        this.saveToHistory();
      }

      // Save circle annotation if in circle mode
      if (this.drawingMode === DrawingMode.Circle) {
        // Could save circle data here if needed for future manipulation
      }
    }

    // Handle crop completion
    if (this.isCropMode && this.cropStarted && !this.isDrawing) {
      // Just keep the crop overlay visible, actual cropping happens
      // when user clicks "Apply Crop" button
    }
  }

  // Text handling methods
  confirmTextInput(): void {
    if (!this.ctx || !this.currentText.trim()) {
      this.isAddingText = false;
      return;
    }

    // Draw the text on the canvas
    this.ctx.font = `${this.fontSize}px Arial`;
    this.ctx.fillStyle = this.currentColor;
    this.ctx.fillText(this.currentText, this.textPosition.x, this.textPosition.y);

    // Save the annotation for potential future reference
    this.annotations.push({
      type: 'text',
      x: this.textPosition.x,
      y: this.textPosition.y,
      text: this.currentText,
      color: this.currentColor,
      fontSize: this.fontSize
    });

    // Clear the input and hide it
    this.currentText = '';
    this.isAddingText = false;

    // Save state to history
    this.saveToHistory();
  }

  // Crop methods
  applyCrop(): void {
    if (!this.ctx || !this.cropStarted) return;

    const width = Math.abs(this.cropEnd.x - this.cropStart.x);
    const height = Math.abs(this.cropEnd.y - this.cropStart.y);

    if (width < 10 || height < 10) {
      alert('Crop area too small');
      return;
    }

    const x = Math.min(this.cropStart.x, this.cropEnd.x);
    const y = Math.min(this.cropStart.y, this.cropEnd.y);

    // Create a temporary canvas for the cropped image
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');

    if (!tempCtx) return;

    // Get both the image and annotations
    const image = this.previewImage.nativeElement;
    const annotations = this.annotationCanvas.nativeElement;

    // Draw the cropped portion of the image
    tempCtx.drawImage(
      image,
      x, y, width, height,
      0, 0, width, height
    );

    // Draw the annotations on top
    tempCtx.drawImage(
      annotations,
      x, y, width, height,
      0, 0, width, height
    );

    // Create a new image with the cropped data
    const newImage = new Image();
    newImage.onload = () => {
      // Reset canvas dimensions
      const canvas = this.annotationCanvas.nativeElement;
      canvas.width = width;
      canvas.height = height;

      // Reset the image source
      this.previewImage.nativeElement.src = tempCanvas.toDataURL('image/png');

      // Reset crop mode
      this.isCropMode = false;
      this.cropStarted = false;

      // Clear history and save new state
      this.history = [];
      this.historyIndex = -1;
      this.saveToHistory();
    };
    newImage.src = tempCanvas.toDataURL('image/png');
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

  redrawFromHistory(): void {
    if (!this.ctx || this.historyIndex < 0 || this.historyIndex >= this.history.length) return;

    // Redraw from the current history state
    this.ctx.putImageData(this.history[this.historyIndex], 0, 0);
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

    // Reset image rotation
    this.imageRotation = 0;

    // Reset crop mode
    this.isCropMode = false;
    this.cropStarted = false;

    // Reset annotations
    this.annotations = [];

    // Save this state to history
    this.saveToHistory();
  }

  // Modal action handlers
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
      // Apply rotation if needed
      if (this.imageRotation !== 0) {
        ctx.save();
        // Translate to center, rotate, and translate back
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(this.imageRotation * Math.PI / 180);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
      }

      // Draw the original image
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

      // Draw the annotations on top
      if (this.ctx) {
        ctx.drawImage(this.annotationCanvas.nativeElement, 0, 0);
      }

      if (this.imageRotation !== 0) {
        ctx.restore();
      }

      // Convert to data URL
      const dataUrl = canvas.toDataURL('image/jpeg');
      this.saveImage.emit(dataUrl);
    }

    this.closeModal.emit();
  }
}
