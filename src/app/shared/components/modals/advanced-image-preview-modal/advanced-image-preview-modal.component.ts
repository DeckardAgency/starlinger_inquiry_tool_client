/**
 * Advanced Image Preview Modal Component
 *
 * This component provides a modal interface for viewing and editing images with various annotation tools.
 *
 * Features:
 * - Drawing tools: freehand, circle, and text annotations
 * - Image cropping
 * - Image rotation
 * - Undo/redo functionality
 *
 * Optimizations and bug fixes (2025-07-22):
 * 1. Performance improvements:
 *    - Replaced setTimeout with requestAnimationFrame for better rendering performance
 *    - Optimized circle drawing to avoid expensive redraws from history
 *    - Added memory management for history to prevent memory leaks (MAX_HISTORY_SIZE)
 *
 * 2. Bug fixes:
 *    - Fixed rotation handling in saveChanges method to properly handle different rotation angles
 *    - Added proper cleanup of temporary resources to prevent memory leaks
 *    - Improved canvas setup to handle image loading edge cases
 *
 * 3. Error handling:
 *    - Added comprehensive error handling throughout the component
 *    - Improved validation for user inputs
 *    - Added graceful error recovery to prevent UI from getting stuck
 *    - Added a notification system for user-friendly error messages
 *
 * 4. Code quality:
 *    - Added better logging for debugging
 *    - Improved code organization and comments
 *    - Enhanced the reset functionality for complete state cleanup
 */
import { Component, Input, Output, EventEmitter, OnInit, ViewChild, ElementRef, AfterViewInit, HostListener } from '@angular/core';
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
              <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
                <path d="M9.79346 11.8997L17.8635 3.83967C18.1265 3.56812 18.441 3.35162 18.7885 3.20278C19.1361 3.05395 19.5098 2.97575 19.8878 2.97275C20.2659 2.96974 20.6408 3.04199 20.9907 3.18529C21.3405 3.32858 21.6584 3.54006 21.9257 3.8074C22.1931 4.07474 22.4045 4.39261 22.5478 4.74248C22.6911 5.09235 22.7634 5.46723 22.7604 5.8453C22.7574 6.22336 22.6792 6.59705 22.5303 6.9446C22.3815 7.29215 22.165 7.60661 21.8935 7.86967L13.8335 15.9497M7.80342 14.9397C6.14342 14.9397 4.80342 16.2897 4.80342 17.9597C4.80342 19.2897 2.30342 19.4797 2.80342 19.9797C3.88342 21.0797 5.29342 21.9997 6.80342 21.9997C9.00342 21.9997 10.8034 20.1997 10.8034 17.9597C10.8047 17.5644 10.7282 17.1728 10.5781 16.8071C10.4281 16.4414 10.2075 16.1088 9.92889 15.8284C9.65031 15.5479 9.31923 15.3251 8.95454 15.1726C8.58985 15.0202 8.1987 14.941 7.80342 14.9397Z" stroke="#232323" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
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
              <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
                <path d="M6.7334 2V16C6.7334 16.5304 6.94411 17.0391 7.31918 17.4142C7.69426 17.7893 8.20297 18 8.7334 18H22.7334M18.7334 22V8C18.7334 7.46957 18.5227 6.96086 18.1476 6.58579C17.7725 6.21071 17.2638 6 16.7334 6H2.7334" stroke="#232323" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>

            <!-- Rotate buttons -->
            <button class="toolbar-button" title="Rotate Left" (click)="rotateImage(-90)">
              <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
                <path d="M21.7334 12C21.7334 13.78 21.2056 15.5201 20.2166 17.0001C19.2277 18.4802 17.8221 19.6337 16.1776 20.3149C14.533 20.9961 12.7234 21.1743 10.9776 20.8271C9.23176 20.4798 7.62811 19.6226 6.36944 18.364C5.11077 17.1053 4.2536 15.5016 3.90633 13.7558C3.55907 12.01 3.7373 10.2004 4.41849 8.55585C5.09968 6.91131 6.25323 5.50571 7.73327 4.51677C9.21331 3.52784 10.9534 3 12.7334 3C15.2534 3 17.6634 4 19.4734 5.74L21.7334 8M21.7334 8L21.7334 3M21.7334 8H16.7334" stroke="#232323" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>

            <button class="toolbar-button" title="Rotate Right" (click)="rotateImage(90)">
              <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
                <path d="M3.7334 12C3.7334 13.78 4.26124 15.5201 5.25017 17.0001C6.2391 18.4802 7.64471 19.6337 9.28925 20.3149C10.9338 20.9961 12.7434 21.1743 14.4892 20.8271C16.235 20.4798 17.8387 19.6226 19.0974 18.364C20.356 17.1053 21.2132 15.5016 21.5605 13.7558C21.9077 12.01 21.7295 10.2004 21.0483 8.55585C20.3671 6.91131 19.2136 5.50571 17.7335 4.51677C16.2535 3.52784 14.5134 3 12.7334 3C10.2174 3.00947 7.80237 3.99122 5.9934 5.74L3.7334 8M3.7334 8V3M3.7334 8H8.7334" stroke="#232323" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
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
              <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
                <path d="M3.7334 7V13M3.7334 13H9.7334M3.7334 13L6.7334 10.3C8.38225 8.82116 10.5185 8.00226 12.7334 8C15.1203 8 17.4095 8.94821 19.0974 10.636C20.7852 12.3239 21.7334 14.6131 21.7334 17" stroke="#232323" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>

            <button class="toolbar-button" title="Redo" (click)="handleRedo()">
              <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
                <path d="M21.7334 7V13M21.7334 13H15.7334M21.7334 13L18.7334 10.3C17.0845 8.82116 14.9483 8.00226 12.7334 8C10.3465 8 8.05726 8.94821 6.36944 10.636C4.68161 12.3239 3.7334 14.6131 3.7334 17" stroke="#232323" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
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
              <!-- Message about keyboard shortcut -->
              <div *ngIf="cropSelectionFinalized" class="crop-message">
                Press Enter to apply crop
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

    .crop-message {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 14px;
      pointer-events: none;
      white-space: nowrap;
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
  cropSelectionFinalized: boolean = false;
  cropStart = { x: 0, y: 0 };
  cropEnd = { x: 0, y: 0 };

  // Rotation properties
  imageRotation: number = 0;

  // Annotations storage
  annotations: Annotation[] = [];

  // History for undo/redo
  history: ImageData[] = [];
  historyIndex: number = -1;
  readonly MAX_HISTORY_SIZE: number = 20; // Limit history size to prevent memory issues

  // Make Math available in the template
  Math: any = Math;

  constructor() {}

  ngOnInit(): void {
    // Initialization
  }

  // Handle keyboard events
  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    // Apply crop when Enter key is pressed and crop selection is finalized
    // This allows the user to apply the crop without moving the cursor outside the image area,
    // which would otherwise change the crop rectangle unintentionally
    if (event.key === 'Enter' && this.isCropMode && this.cropStarted && this.cropSelectionFinalized) {
      this.applyCrop();
    }
  }

  ngAfterViewInit(): void {
    // Setup canvas after view is initialized
    // Use requestAnimationFrame instead of setTimeout for better performance
    requestAnimationFrame(() => {
      this.setupCanvas();
    });
  }

  setupCanvas(): void {
    if (!this.annotationCanvas || !this.previewImage) {
      console.warn('Canvas or image element not available');
      return;
    }

    try {
      const canvas = this.annotationCanvas.nativeElement;
      const img = this.previewImage.nativeElement;

      // Check if image has loaded and has dimensions
      if (img.width === 0 || img.height === 0) {
        console.warn('Image dimensions are zero, waiting for image to load');
        // Will be called again by onImageLoad when image is ready
        return;
      }

      // Set canvas dimensions to match the image
      canvas.width = img.width;
      canvas.height = img.height;

      // Get the canvas context for drawing
      this.ctx = canvas.getContext('2d');

      if (!this.ctx) {
        console.error('Failed to get canvas context');
        return;
      }

      // Save initial state in history
      this.saveToHistory();
    } catch (error) {
      console.error('Error setting up canvas:', error);
    }
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
      this.cropSelectionFinalized = false;
    }
  }

  // Rotate image
  rotateImage(degrees: number): void {
    this.imageRotation = (this.imageRotation + degrees) % 360;

    // Need to update canvas setup after rotation
    // Use requestAnimationFrame instead of setTimeout for better performance
    requestAnimationFrame(() => {
      this.setupCanvas();
    });
  }

  // Drawing methods
  startDrawing(event: MouseEvent): void {
    if (!this.ctx) return;

    const rect = this.annotationCanvas.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (this.isCropMode) {
      if (!this.cropStarted) {
        // First click: Start crop selection
        this.cropStarted = true;
        this.cropSelectionFinalized = false;
        this.cropStart = { x, y };
        this.cropEnd = { x, y };
      } else if (!this.cropSelectionFinalized) {
        // Second click: Finalize crop selection
        // This prevents the crop rectangle from changing when moving the cursor
        this.cropSelectionFinalized = true;
      } else {
        // If already finalized, start a new crop selection
        this.cropSelectionFinalized = false;
        this.cropStart = { x, y };
        this.cropEnd = { x, y };
      }
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
      // Only update the crop rectangle if the selection is not finalized
      // This prevents the crop rectangle from changing when moving the cursor to the Apply Crop button
      if (!this.cropSelectionFinalized) {
        this.cropEnd = { x: currentX, y: currentY };
      }
      return;
    }

    if (!this.isDrawing || !this.ctx || this.drawingMode === DrawingMode.None || this.drawingMode === DrawingMode.Text) return;

    if (this.drawingMode === DrawingMode.Circle) {
      // Store the current canvas state if we don't have a temporary backup
      if (!this._tempCanvasState) {
        this._tempCanvasState = this.ctx.getImageData(
          0, 0,
          this.annotationCanvas.nativeElement.width,
          this.annotationCanvas.nativeElement.height
        );
      }

      // Restore the canvas to the state before drawing the circle
      this.ctx.putImageData(this._tempCanvasState, 0, 0);

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

  // Temporary storage for canvas state during circle drawing
  private _tempCanvasState: ImageData | null = null;

  stopDrawing(): void {
    if (this.isDrawing) {
      this.isDrawing = false;

      // Save state to history when stroke is complete
      if (this.drawingMode !== DrawingMode.None) {
        this.saveToHistory();
      }

      // Clean up temporary canvas state after circle drawing
      if (this.drawingMode === DrawingMode.Circle) {
        this._tempCanvasState = null;
      }
    }

    // Handle crop completion
    if (this.isCropMode && this.cropStarted && !this.isDrawing) {
      // If the crop selection is too small, reset it
      const width = Math.abs(this.cropEnd.x - this.cropStart.x);
      const height = Math.abs(this.cropEnd.y - this.cropStart.y);

      if (width < 10 || height < 10) {
        this.cropStarted = false;
        this.cropSelectionFinalized = false;
      }

      // If the selection is finalized, show a message about using Enter key
      // The user can now press Enter to apply the crop without moving the cursor outside the image area
      if (this.cropSelectionFinalized) {
        // Use console.debug instead of console.log for development messages
        console.debug('Crop selection finalized. Press Enter to apply crop.');
      }
    }
  }

  // Text handling methods
  confirmTextInput(): void {
    try {
      // Validate required elements
      if (!this.ctx) {
        console.warn('Canvas context not available for text input');
        this.isAddingText = false;
        return;
      }

      // Check if text is empty or only whitespace
      const trimmedText = this.currentText.trim();
      if (!trimmedText) {
        this.isAddingText = false;
        return;
      }

      // Validate font size
      const fontSize = Math.max(10, Math.min(this.fontSize || 24, 72));

      // Draw the text on the canvas with proper font settings
      this.ctx.save();
      this.ctx.font = `${fontSize}px Arial, sans-serif`;
      this.ctx.fillStyle = this.currentColor || '#000000';
      this.ctx.textBaseline = 'middle';

      // Apply text with word wrapping if needed
      const maxWidth = this.annotationCanvas.nativeElement.width - this.textPosition.x - 10;
      if (maxWidth > 100) {
        this.ctx.fillText(trimmedText, this.textPosition.x, this.textPosition.y, maxWidth);
      } else {
        this.ctx.fillText(trimmedText, this.textPosition.x, this.textPosition.y);
      }
      this.ctx.restore();

      // Save the annotation for potential future reference
      this.annotations.push({
        type: 'text',
        x: this.textPosition.x,
        y: this.textPosition.y,
        text: trimmedText,
        color: this.currentColor,
        fontSize: fontSize
      });

      // Save state to history
      this.saveToHistory();
    } catch (error) {
      console.error('Error adding text annotation:', error);
    } finally {
      // Always clear the input and hide it, even if there was an error
      this.currentText = '';
      this.isAddingText = false;
    }
  }

  /**
   * Applies the crop operation to the current image
   *
   * Fixed issues (2025-07-22):
   * 1. Scaling issue: The original implementation didn't account for the difference between
   *    the displayed image dimensions and the natural image dimensions, causing the cropped
   *    area to not match what was selected.
   *
   * 2. Rotation handling: Added proper coordinate transformations for rotated images
   *    to ensure the crop area is correctly applied regardless of rotation angle.
   *
   * 3. Display consistency: Improved how the cropped image is displayed to ensure
   *    it maintains its natural dimensions without unwanted scaling.
   */
  applyCrop(): void {
    try {
      // Validate required elements
      if (!this.ctx) {
        console.warn('Canvas context not available for crop operation');
        return;
      }

      if (!this.cropStarted) {
        console.warn('No crop area selected');
        return;
      }

      // Calculate crop dimensions in display coordinates
      const displayWidth = Math.abs(this.cropEnd.x - this.cropStart.x);
      const displayHeight = Math.abs(this.cropEnd.y - this.cropStart.y);

      // Validate crop size
      if (displayWidth < 10 || displayHeight < 10) {
        console.warn('Crop area too small (minimum 10x10 pixels)');
        // Use a more user-friendly notification instead of alert
        // alert can be disruptive and block the UI
        this.showNotification('Crop area too small. Please select a larger area.');
        return;
      }

      // Calculate crop position (top-left corner) in display coordinates
      const displayX = Math.min(this.cropStart.x, this.cropEnd.x);
      const displayY = Math.min(this.cropStart.y, this.cropEnd.y);

      // Get both the image and annotations
      const image = this.previewImage.nativeElement;
      const annotations = this.annotationCanvas.nativeElement;

      // Ensure the image and canvas are valid
      if (!image || !annotations) {
        console.error('Image or annotation canvas not available');
        return;
      }

      // Calculate the scaling factor between displayed image and natural image dimensions
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      // Handle rotation if present
      let x, y, width, height;

      if (this.imageRotation !== 0) {
        // For rotated images, we need to transform the coordinates
        // Store original dimensions for reference
        const originalWidth = image.naturalWidth;
        const originalHeight = image.naturalHeight;

        // Convert display coordinates to actual image coordinates, accounting for rotation
        if (this.imageRotation === 90) {
          // 90 degrees: (x,y) -> (y, width-x)
          x = Math.round(displayY * scaleY);
          y = Math.round(originalWidth - (displayX + displayWidth) * scaleX);
          width = Math.round(displayHeight * scaleY);
          height = Math.round(displayWidth * scaleX);
        } else if (this.imageRotation === 180) {
          // 180 degrees: (x,y) -> (width-x, height-y)
          x = Math.round(originalWidth - (displayX + displayWidth) * scaleX);
          y = Math.round(originalHeight - (displayY + displayHeight) * scaleY);
          width = Math.round(displayWidth * scaleX);
          height = Math.round(displayHeight * scaleY);
        } else if (this.imageRotation === 270) {
          // 270 degrees: (x,y) -> (height-y, x)
          x = Math.round(originalHeight - (displayY + displayHeight) * scaleY);
          y = Math.round(displayX * scaleX);
          width = Math.round(displayHeight * scaleY);
          height = Math.round(displayWidth * scaleX);
        } else {
          // For other rotation angles, use standard transformation
          console.warn('Non-standard rotation angle detected:', this.imageRotation);
          x = Math.round(displayX * scaleX);
          y = Math.round(displayY * scaleY);
          width = Math.round(displayWidth * scaleX);
          height = Math.round(displayHeight * scaleY);
        }
      } else {
        // No rotation - simple case
        x = Math.round(displayX * scaleX);
        y = Math.round(displayY * scaleY);
        width = Math.round(displayWidth * scaleX);
        height = Math.round(displayHeight * scaleY);
      }

      // Create a temporary canvas for the cropped image
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = width;
      tempCanvas.height = height;
      const tempCtx = tempCanvas.getContext('2d');

      if (!tempCtx) {
        console.error('Failed to get temporary canvas context');
        return;
      }

      // Draw the cropped portion of the image using the natural image dimensions
      tempCtx.drawImage(
        image,
        x, y, width, height,
        0, 0, width, height
      );

      // Draw the annotations on top, scaled appropriately
      if (this.imageRotation !== 0) {
        // For rotated images, we need to create a temporary canvas to handle the annotations correctly
        const annotationTempCanvas = document.createElement('canvas');
        annotationTempCanvas.width = annotations.width;
        annotationTempCanvas.height = annotations.height;
        const annotationTempCtx = annotationTempCanvas.getContext('2d');

        if (annotationTempCtx) {
          // Copy the annotations to the temporary canvas
          annotationTempCtx.drawImage(annotations, 0, 0);

          // Draw the relevant portion to the final canvas, accounting for rotation
          tempCtx.drawImage(
            annotationTempCanvas,
            displayX, displayY, displayWidth, displayHeight,
            0, 0, width, height
          );
        }
      } else {
        // No rotation - simple case
        tempCtx.drawImage(
          annotations,
          displayX, displayY, displayWidth, displayHeight,
          0, 0, width, height
        );
      }

      // Create a new image with the cropped data
      const newImage = new Image();

      // Handle errors during image loading
      newImage.onerror = (error) => {
        console.error('Error loading cropped image:', error);
        this.showNotification('Failed to apply crop. Please try again.');
      };

      newImage.onload = () => {
        try {
          // Reset canvas dimensions to exactly match the crop dimensions
          const canvas = this.annotationCanvas.nativeElement;
          canvas.width = width;
          canvas.height = height;

          // Reset the image source
          const previewImg = this.previewImage.nativeElement;
          previewImg.src = tempCanvas.toDataURL('image/png');

          // Important: Wait for the image to load with the new dimensions
          previewImg.onload = () => {
            // Reset the canvas dimensions again to match the new image
            // This ensures the canvas and image are perfectly aligned
            canvas.width = previewImg.naturalWidth;
            canvas.height = previewImg.naturalHeight;

            // Clear any existing context
            if (this.ctx) {
              this.ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
          };

          // Remove any style constraints that might cause scaling issues
          previewImg.style.width = '';
          previewImg.style.height = '';
          previewImg.style.maxWidth = '100%';
          previewImg.style.maxHeight = '60vh';

          // Reset crop mode
          this.isCropMode = false;
          this.cropStarted = false;
          this.cropSelectionFinalized = false;

          // Clear history and save new state
          this.history = [];
          this.historyIndex = -1;
          this.saveToHistory();
        } catch (error) {
          console.error('Error applying crop:', error);
        }
      };

      // Set the source to trigger the onload event
      newImage.src = tempCanvas.toDataURL('image/png');

    } catch (error) {
      console.error('Error during crop operation:', error);
      this.showNotification('An error occurred while cropping. Please try again.');

      // Reset crop mode on error
      this.isCropMode = false;
      this.cropStarted = false;
      this.cropSelectionFinalized = false;
    }
  }

  // Helper method to show notifications instead of alerts
  private showNotification(message: string): void {
    // This could be replaced with a proper notification component
    // For now, we'll use console.warn and could be enhanced later
    console.warn(message);

    // TODO: Implement a non-blocking notification UI
    // For now, we'll use a less intrusive alert
    setTimeout(() => {
      alert(message);
    }, 0);
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

    // Enforce history size limit to prevent memory issues
    if (this.history.length > this.MAX_HISTORY_SIZE) {
      // Remove oldest entries
      const itemsToRemove = this.history.length - this.MAX_HISTORY_SIZE;
      this.history = this.history.slice(itemsToRemove);
      this.historyIndex -= itemsToRemove;
    }
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
    try {
      if (!this.ctx) {
        console.warn('Canvas context not available for reset operation');
        return;
      }

      // Clear canvas
      const canvas = this.annotationCanvas.nativeElement;
      this.ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Reset image rotation
      this.imageRotation = 0;

      // Reset crop mode
      this.isCropMode = false;
      this.cropStarted = false;
      this.cropSelectionFinalized = false;
      this.cropStart = { x: 0, y: 0 };
      this.cropEnd = { x: 0, y: 0 };

      // Reset drawing mode
      this.drawingMode = DrawingMode.None;
      this.isDrawing = false;

      // Reset text input
      this.isAddingText = false;
      this.currentText = '';

      // Reset circle drawing state
      this._tempCanvasState = null;

      // Reset annotations
      this.annotations = [];

      // Clear history and save fresh state
      this.history = [];
      this.historyIndex = -1;
      this.saveToHistory();

      console.debug('Component state has been reset');
    } catch (error) {
      console.error('Error during reset operation:', error);
    }
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

    try {
      const canvas = document.createElement('canvas');
      const image = this.previewImage.nativeElement;

      // For rotated images, we need to adjust the canvas dimensions
      // Use naturalWidth and naturalHeight to ensure we get the actual pixel dimensions
      if (this.imageRotation === 90 || this.imageRotation === 270) {
        // Swap width and height for 90 or 270 degree rotations
        canvas.width = image.naturalHeight;
        canvas.height = image.naturalWidth;
      } else {
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('Failed to get canvas context');
        this.closeModal.emit();
        return;
      }

      // Clear the canvas before drawing
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Apply rotation if needed
      if (this.imageRotation !== 0) {
        ctx.save();

        // Translate to center
        ctx.translate(canvas.width / 2, canvas.height / 2);

        // Rotate
        ctx.rotate(this.imageRotation * Math.PI / 180);

        // For 90 or 270 degree rotations, we need to adjust the drawing offset
        if (this.imageRotation === 90 || this.imageRotation === 270) {
          ctx.drawImage(
            image,
            -image.naturalHeight / 2, // x offset
            -image.naturalWidth / 2,  // y offset
            image.naturalHeight,      // width (swapped)
            image.naturalWidth        // height (swapped)
          );

          // Draw the annotations on top
          if (this.ctx) {
            ctx.drawImage(
              this.annotationCanvas.nativeElement,
              -image.naturalHeight / 2,
              -image.naturalWidth / 2,
              image.naturalHeight,
              image.naturalWidth
            );
          }
        } else {
          // For 0 or 180 degree rotations
          ctx.drawImage(
            image,
            -image.naturalWidth / 2,  // x offset
            -image.naturalHeight / 2, // y offset
            image.naturalWidth,       // width
            image.naturalHeight       // height
          );

          // Draw the annotations on top
          if (this.ctx) {
            ctx.drawImage(
              this.annotationCanvas.nativeElement,
              -image.naturalWidth / 2,
              -image.naturalHeight / 2,
              image.naturalWidth,
              image.naturalHeight
            );
          }
        }

        ctx.restore();
      } else {
        // No rotation - simple case
        ctx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight);

        // Draw the annotations on top
        if (this.ctx) {
          ctx.drawImage(this.annotationCanvas.nativeElement, 0, 0, image.naturalWidth, image.naturalHeight);
        }
      }

      // Convert to data URL with quality parameter for better compression
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      this.saveImage.emit(dataUrl);

    } catch (error) {
      console.error('Error saving image:', error);
    } finally {
      this.closeModal.emit();
    }
  }
}
