import { Component, OnInit, HostListener, ViewChild, ElementRef, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

// Import ag-Grid modules
import { AgGridModule } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';
import { SpreadsheetComponent } from '../components/spreadsheet/spreadsheet.component';
import { BreadcrumbsComponent } from '@shared/components/ui/breadcrumbs/breadcrumbs.component';
import { ArticleItemComponent } from '@shared/components/product/article-item/article-item.component';
import {
  AdvancedImagePreviewModalComponent
} from '@shared/components/modals/advanced-image-preview-modal/advanced-image-preview-modal.component';
import { MachineType } from '@models/machine-type.model';
import { ProductService } from '@services/http/product.service';
import { ManualQuickCartService } from '@services/cart/manual-quick-cart.service';
import { ManualCartItem } from '@models/manual-cart-item.model';
import { Breadcrumb, Product } from '@core/models';
import {ArticleItemShimmerComponent} from '@shared/components/product/article-item/article-item-shimmer.component';

export interface UploadedFile {
  name: string;
  size: number;
  type: string;
  file: File;
  status: 'uploading' | 'success' | 'error';
  progress: number;
  previewUrl?: string;
}

export interface Part {
  id: string;
  files: UploadedFile[];
  spreadsheetData?: any[];
}

export interface SpreadsheetTemplateData {
  columns: ColDef[];
  data: any[];
}

@Component({
  selector: 'app-manual-entry-template',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    BreadcrumbsComponent,
    ArticleItemComponent,
    AdvancedImagePreviewModalComponent,
    AgGridModule,
    SpreadsheetComponent,
    ArticleItemShimmerComponent
  ],
  templateUrl: './manual-entry-template.component.html',
  styleUrls: ['./manual-entry-template.component.scss']
})
export class ManualEntryTemplateComponent implements OnInit, AfterViewInit {
  // Machine data properties
  machines: Product[] = [];
  filteredMachines: Product[] = [];
  selectedMachine: Product | null = null;
  rowData = [
    { A: "Product (part) name", B: "..."},
    { A: "Short description", B: "..."},
    { A: "Additional notes", B: "..."},
  ];
  colDefs: ColDef[] = [
    { field: "A", minWidth: 200 },
    { field: "B", minWidth: 400},
  ];
  loading = true;
  error: string | null = null;
  totalItems = 0;
  dragCounter = 0;

  // Spreadsheet properties
  showSpreadsheet = true;
  isFullScreenMode = false;

  // Image preview modal properties
  showImagePreview = false;
  previewImageSrc = '';
  previewImageAlt = '';
  previewImageFileName = '';

  // File upload properties
  isDragging = false;
  maxFileSize = 5 * 1024 * 1024; // 5MB
  allowedFileTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'video/mp4'
  ];

  // Using ViewChildren to get all file inputs
  @ViewChildren('fileInputElement') fileInputElements!: QueryList<ElementRef<HTMLInputElement>>;

  // ViewChild for a spreadsheet component
  @ViewChild('spreadsheet') spreadsheetComponent!: SpreadsheetComponent;

  // Search and form controls
  searchControl = new FormControl('');

  // Simple form for files only
  partForm = new FormGroup({});

  // Parts array (simplified)
  parts: Part[] = [];

  // Map to store parts for each machine
  machinePartsMap: Map<string, Part[]> = new Map();

  // Machine types for filtering
  machineTypes: MachineType[] = [
    { id: '1', name: 'Winding Machines', checked: false },
    { id: '2', name: 'Extrusion Machines', checked: false },
    { id: '3', name: 'Converting Machines', checked: false },
    { id: '4', name: 'Packaging Machines', checked: false }
  ];

  isFilterOpen = false;
  activeFilters: string[] = [];
  breadcrumbs: Breadcrumb[] = [
    { label: 'Dashboard', link: '/dashboard' },
    { label: 'Manual Entry', link: '/manual-entry' }
  ];

  // Simplified part methods - no longer need additional fields
  addPart(): void {
    const newPart: Part = {
      id: this.generateUniqueId(),
      files: [],
      spreadsheetData: []
    };

    this.parts.push(newPart);

    // Also update the stored parts for the selected machine
    if (this.selectedMachine) {
      this.machinePartsMap.set(this.selectedMachine.id, [...this.parts]);
    }
  }

  removePart(index: number): void {
    if (this.parts.length > 1) {
      this.parts.splice(index, 1);

      // Update the stored parts for the selected machine
      if (this.selectedMachine) {
        this.machinePartsMap.set(this.selectedMachine.id, [...this.parts]);
      }
    }
  }

  private generateUniqueId(): string {
    return 'part_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
  }

  toggleFullScreenMode(value?: boolean): void {
    if (value !== undefined) {
      // If value is provided from the event, use it
      this.isFullScreenMode = value;
    } else {
      // Otherwise toggle the current value
      this.isFullScreenMode = !this.isFullScreenMode;
    }

    // Allow time for the DOM to update before refreshing the grid
    setTimeout(() => {
      if (this.spreadsheetComponent) {
        this.spreadsheetComponent.resizeGrid();
      }
    }, 100);
  }

  onSpreadsheetDataChanged(data: any[]): void {
    if (this.parts.length > 0) {
      this.parts[0].spreadsheetData = data;

      // Update the stored parts for the selected machine
      if (this.selectedMachine) {
        this.machinePartsMap.set(this.selectedMachine.id, [...this.parts]);
      }
    }
  }

  constructor(
    private productService: ProductService,
    private manualQuickCartService: ManualQuickCartService
  ) {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => this.filterMachines());
  }

  ngOnInit(): void {
    this.loadMachines();
    this.addPart(); // Add first part by default
  }

  ngAfterViewInit(): void {
    // Initialize grid if needed
    setTimeout(() => {
      if (this.spreadsheetComponent) {
        this.spreadsheetComponent.resizeGrid();
      }
    }, 100);
  }

  private loadMachines(): void {
    this.loading = true;
    this.productService.getProducts().subscribe({
      next: (response) => {
        // Treat products as machines for this component
        this.machines = response.member;
        this.totalItems = response.totalItems;
        this.filteredMachines = this.machines;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load machines. Please try again later.';
        this.loading = false;
        console.error('Error loading machines:', err);
      }
    });
  }

  selectMachine(machine: Product): void {
    // Save the current parts state if a machine is already selected
    if (this.selectedMachine) {
      this.machinePartsMap.set(this.selectedMachine.id, [...this.parts]);
    }

    this.selectedMachine = machine;
    if (machine) {
      this.breadcrumbs = [
        { label: 'Dashboard', link: '/dashboard' },
        { label: 'Manual Entry', link: '/manual-entry' },
        { label: machine.name }
      ];

      // Check if we have saved parts for this machine
      if (this.machinePartsMap.has(machine.id)) {
        // Restore the saved parts
        this.parts = [...this.machinePartsMap.get(machine.id)!];
      } else {
        // Initialize with a single part for a new machine
        this.parts = [];
        this.addPart();
      }
    }
  }

  closeDetails(): void {
    // Save the current parts state before closing
    if (this.selectedMachine) {
      this.machinePartsMap.set(this.selectedMachine.id, [...this.parts]);
    }

    this.selectedMachine = null;
    this.breadcrumbs = [
      { label: 'Dashboard', link: '/dashboard' },
      { label: 'Manual Entry', link: '/manual-entry' }
    ];
  }

  removeFilter(filter: string): void {
    // Remove from activeFilters
    this.activeFilters = this.activeFilters.filter(f => f !== filter);

    // Update machine type checked state
    const machineType = this.machineTypes.find(m => m.name === filter);
    if (machineType) {
      machineType.checked = false;
    }

    this.filterMachines();
  }

  toggleFilter(): void {
    this.isFilterOpen = !this.isFilterOpen;
  }

  toggleMachineType(machineType: MachineType): void {
    machineType.checked = !machineType.checked;

    if (machineType.checked) {
      // Add to activeFilters if not already present
      if (!this.activeFilters.includes(machineType.name)) {
        this.activeFilters.push(machineType.name);
      }
    } else {
      // Remove from activeFilters
      this.activeFilters = this.activeFilters.filter(filter => filter !== machineType.name);
    }

    this.filterMachines();
  }

  private filterMachines(): void {
    let filtered = this.machines;

    const searchTerm = this.searchControl.value?.toLowerCase();
    if (searchTerm) {
      filtered = filtered.filter(machine =>
        machine.name.toLowerCase().includes(searchTerm)
      );
    }

    // Use activeFilters for machine type filtering
    if (this.activeFilters.length > 0) {
      // Simple filtering by machine name containing filter text
      filtered = filtered.filter(machine =>
        this.activeFilters.some(filter => machine.name.includes(filter))
      );
    }

    this.filteredMachines = filtered;
  }

  // Updated validation methods - check for files or spreadsheet data
  isCurrentPartValid(): boolean {
    if (this.parts.length === 0) return false;

    const currentPart = this.parts[this.parts.length - 1];

    // Either valid spreadsheet data or at least one successful file upload is required
    const hasValidFiles = currentPart.files.some(file => file.status === 'success');

    // Check if spreadsheetData exists before trying to use it
    const hasValidSpreadsheetData = currentPart.spreadsheetData ?
      currentPart.spreadsheetData.some(row =>
        Boolean(row.name) || Boolean(row.description) || Boolean(row.notes)
      ) : false;

    return hasValidFiles || hasValidSpreadsheetData;
  }

  isFormValid(): boolean {
    // For each part, check if there's valid data
    return this.parts.every(part => {
      const hasValidFiles = part.files.some(file => file.status === 'success');

      const hasValidSpreadsheetData = part.spreadsheetData ?
        part.spreadsheetData.some(row =>
          Boolean(row.name) || Boolean(row.description) || Boolean(row.notes)
        ) : false;

      return hasValidFiles || hasValidSpreadsheetData;
    });
  }

  // File upload methods
  triggerFileInput(partIndex: number): void {
    // Get file inputs after view is initialized
    if (this.fileInputElements) {
      const fileInputArray = this.fileInputElements.toArray();
      if (fileInputArray.length > 0 && fileInputArray[partIndex]) {
        fileInputArray[partIndex].nativeElement.click();
      }
    }
  }

  // Rest of the component's methods (file handling, etc.) remain the same
  // ...

  onFileSelected(event: Event, partIndex: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(input.files, partIndex);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragEnter(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragCounter++;
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragCounter--;

    // Only set isDragging to false when we've left the outermost element
    if (this.dragCounter === 0) {
      this.isDragging = false;
    }
  }

  onDrop(event: DragEvent, partIndex: number): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    this.dragCounter = 0; // Reset counter

    if (event.dataTransfer?.files) {
      this.handleFiles(event.dataTransfer.files, partIndex);
    }
  }

  private handleFiles(fileList: FileList, partIndex: number): void {
    // Ensure we have a valid part
    if (partIndex >= 0 && partIndex < this.parts.length) {
      Array.from(fileList).forEach(file => {
        // Validate file type
        if (!this.isValidFileType(file)) {
          alert(`File type not allowed: ${file.name}`);
          return;
        }

        // Validate file size
        if (file.size > this.maxFileSize) {
          alert(`File too large: ${file.name}. Maximum size is 5MB.`);
          return;
        }

        const uploadedFile: UploadedFile = {
          name: file.name,
          size: file.size,
          type: file.type,
          file: file,
          status: 'uploading',
          progress: 0
        };

        // If it's an image, create a preview URL
        if (this.isImageFile(file.name)) {
          uploadedFile.previewUrl = URL.createObjectURL(file);
        }

        this.parts[partIndex].files.push(uploadedFile);
        this.simulateUpload(partIndex, uploadedFile);

        // Update the stored parts for the selected machine
        if (this.selectedMachine) {
          this.machinePartsMap.set(this.selectedMachine.id, [...this.parts]);
        }
      });
    }
  }

  private isValidFileType(file: File): boolean {
    return this.allowedFileTypes.includes(file.type);
  }

  private simulateUpload(partIndex: number, file: UploadedFile): void {
    // This is just a simulation - replace with actual upload logic
    const interval = setInterval(() => {
      file.progress += 10;

      if (file.progress >= 100) {
        clearInterval(interval);
        file.status = Math.random() > 0.8 ? 'error' : 'success'; // Randomly generate some errors

        // Update the stored parts for the selected machine after upload is complete
        if (this.selectedMachine) {
          this.machinePartsMap.set(this.selectedMachine.id, [...this.parts]);
        }
      }
    }, 300);
  }

  removeFile(partIndex: number, file: UploadedFile): void {
    // Revoke URL if exists to prevent memory leaks
    if (file.previewUrl) {
      URL.revokeObjectURL(file.previewUrl);
    }
    this.parts[partIndex].files = this.parts[partIndex].files.filter(f => f !== file);

    // Update the stored parts for the selected machine
    if (this.selectedMachine) {
      this.machinePartsMap.set(this.selectedMachine.id, [...this.parts]);
    }
  }

  cancelUpload(partIndex: number, file: UploadedFile): void {
    // In a real app, you would cancel the actual upload request
    this.removeFile(partIndex, file);
  }

  retryUpload(partIndex: number, file: UploadedFile): void {
    file.status = 'uploading';
    file.progress = 0;
    this.simulateUpload(partIndex, file);
  }

  hasSuccessfulUploads(partIndex: number): boolean {
    return this.parts[partIndex].files.some(file => file.status === 'success');
  }

  hasUploadsInProgress(partIndex: number): boolean {
    return this.parts[partIndex].files.some(file => file.status === 'uploading');
  }

  getSuccessfulUploadCount(partIndex: number): number {
    return this.parts[partIndex].files.filter(file => file.status === 'success').length;
  }

  // Image preview methods
  openImagePreview(file: UploadedFile): void {
    if (this.isImageFile(file.name) && file.previewUrl) {
      this.previewImageSrc = file.previewUrl;
      this.previewImageAlt = file.name;
      this.previewImageFileName = file.name;
      this.showImagePreview = true;
    }
  }

  closeImagePreview(): void {
    this.showImagePreview = false;
  }

  // Utility methods for file handling
  isImageFile(fileName: string): boolean {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extension || '');
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  onSubmit(): void {
    if (this.isFormValid() && this.selectedMachine) {
      // Map parts to ManualCartItems for the cart service
      const manualCartItems: ManualCartItem[] = this.parts.map(part => {
        return {
          machineId: this.selectedMachine!.id,
          machineName: this.selectedMachine!.name,
          // Only include successfully uploaded files
          files: part.files.filter(file => file.status === 'success'),
          // Include spreadsheet data
          spreadsheetData: part.spreadsheetData
        } as unknown as ManualCartItem;
      });

      // Add parts to manual cart and open the inquiry overview
      this.manualQuickCartService.addToCart(manualCartItems);

      // Remove the saved parts for this machine (since they've been submitted)
      if (this.selectedMachine) {
        this.machinePartsMap.delete(this.selectedMachine.id);
      }

      // Reset the form state but don't close details yet
      this.parts = [];
      this.addPart();
    }
  }

  // Get the total parts across all machines
  getTotalPartsCount(): number {
    let count = 0;
    this.machinePartsMap.forEach((parts) => {
      count += parts.length;
    });
    return count;
  }

  ngOnDestroy(): void {
    // Clean up all object URLs to prevent memory leaks
    this.machinePartsMap.forEach(parts => {
      parts.forEach(part => {
        part.files.forEach(file => {
          if (file.previewUrl) {
            URL.revokeObjectURL(file.previewUrl);
          }
        });
      });
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const filterElement = document.querySelector('.manual-entry__machine-filter');
    if (!filterElement?.contains(event.target as Node)) {
      this.isFilterOpen = false;
    }
  }

  // Image editing methods
  saveEditedImage(dataUrl: string): void {
    // Find the file that's currently being previewed
    if (!this.previewImageSrc) return;

    for (const part of this.parts) {
      const fileIndex = part.files.findIndex(f => f.previewUrl === this.previewImageSrc);
      if (fileIndex !== -1) {
        // Convert the data URL to a Blob
        const blob = this.dataURLToBlob(dataUrl);

        // Create a new File from the Blob
        const editedFile = new File([blob], part.files[fileIndex].name, {
          type: part.files[fileIndex].type
        });

        // Revoke the old preview URL to prevent memory leaks
        URL.revokeObjectURL(part.files[fileIndex].previewUrl!);

        // Update the file in the array
        part.files[fileIndex].file = editedFile;
        part.files[fileIndex].previewUrl = URL.createObjectURL(editedFile);

        // If this file was already in 'success' state, mark it as edited
        if (part.files[fileIndex].status === 'success') {
          console.log('File edited:', part.files[fileIndex].name);
        }

        // Update the preview src to the new URL
        this.previewImageSrc = part.files[fileIndex].previewUrl;

        // Update the stored parts for the selected machine
        if (this.selectedMachine) {
          this.machinePartsMap.set(this.selectedMachine.id, [...this.parts]);
        }
        break;
      }
    }
  }

  // Helper function to convert a data URL to a Blob
  dataURLToBlob(dataURL: string): Blob {
    const parts = dataURL.split(';base64,');
    const contentType = parts[0].split(':')[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);

    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], { type: contentType });
  }
}
