import { Component, OnInit, HostListener, ViewChild, ElementRef, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { Subscription } from 'rxjs';

// Components
import { BreadcrumbsComponent } from '@shared/components/ui/breadcrumbs/breadcrumbs.component';
import { MachineArticleItemComponent } from '@shared/components/machine/machine-article-item/machine-article-item.component';
import { AdvancedImagePreviewModalComponent } from '@shared/components/modals/advanced-image-preview-modal/advanced-image-preview-modal.component';
import { MachineType } from '@models/machine-type.model';
import { MachineService } from '@services/http/machine.service';
import { ManualQuickCartService } from '@services/cart/manual-quick-cart.service';
import { ManualCartItem } from '@models/manual-cart-item.model';
import { Breadcrumb } from '@core/models';
import { Machine } from '@core/models/machine.model';
import { MachineArticleItemShimmerComponent } from '@shared/components/machine/machine-article-item/machine-article-item-shimmer.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { MediaService } from '@services/http/media.service';
import { MediaItem } from '@models/media.model';
import { environment } from '@env/environment';
import { AuthService } from '@core/auth/auth.service';
import { InquiryRequest, InquiryService } from '@services/http/inquiry.service';

export interface UploadedFile {
  name: string;
  size: number;
  type: string;
  file: File;
  status: 'uploading' | 'success' | 'error';
  progress: number;
  previewUrl?: string;
  mediaItem?: MediaItem; // Store the API response
  uploadSubscription?: Subscription; // Store subscription for cancellation
  errorMessage?: string; // Store specific error message
}

export interface Part {
  id: string;
  files: UploadedFile[];
}

@Component({
  selector: 'app-manual-entry-template',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    BreadcrumbsComponent,
    MachineArticleItemComponent,
    AdvancedImagePreviewModalComponent,
    MachineArticleItemShimmerComponent,
    IconComponent
  ],
  templateUrl: './manual-entry-template.component.html',
  styleUrls: ['./manual-entry-template.component.scss']
})
export class ManualEntryTemplateComponent implements OnInit, AfterViewInit {
  // Machine data properties
  machines: Machine[] = [];
  filteredMachines: Machine[] = [];
  selectedMachine: Machine | null = null;
  loading = true;
  error: string | null = null;
  totalItems = 0;
  dragCounter = 0;

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
      files: []
    };

    this.parts.push(newPart);

    // Also update the stored parts for the selected machine
    if (this.selectedMachine) {
      this.machinePartsMap.set(this.selectedMachine.id, [...this.parts]);
    }
  }

  removePart(index: number): void {
    if (this.parts.length > 1) {
      // Cancel any ongoing uploads for this part
      this.parts[index].files.forEach(file => {
        if (file.uploadSubscription && !file.uploadSubscription.closed) {
          file.uploadSubscription.unsubscribe();
        }
        if (file.previewUrl) {
          URL.revokeObjectURL(file.previewUrl);
        }
      });

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

  constructor(
    private machineService: MachineService,
    private manualQuickCartService: ManualQuickCartService,
    private authService: AuthService,
    private inquiryService: InquiryService,
    private mediaService: MediaService // Add MediaService injection
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
    // Component initialization complete
  }

  private loadMachines(): void {
    this.loading = true;
    this.machineService.getMachines().subscribe({
      next: (response) => {
        // Use machines instead of products
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

  selectMachine(machine: Machine): void {
    // Save the current parts state if a machine is already selected
    if (this.selectedMachine) {
      this.machinePartsMap.set(this.selectedMachine.id, [...this.parts]);
    }

    this.selectedMachine = machine;
    if (machine) {
      this.breadcrumbs = [
        { label: 'Dashboard', link: '/dashboard' },
        { label: 'Manual Entry', link: '/manual-entry' },
        { label: machine.articleDescription }
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
        machine.articleDescription.toLowerCase().includes(searchTerm) ||
        machine.articleNumber.toLowerCase().includes(searchTerm) ||
        machine.ibSerialNumber.toString().includes(searchTerm) ||
        machine.ibStationNumber.toString().includes(searchTerm)
      );
    }

    // Use activeFilters for machine type filtering
    if (this.activeFilters.length > 0) {
      // Simple filtering by machine name containing filter text
      filtered = filtered.filter(machine =>
        this.activeFilters.some(filter => machine.articleDescription.includes(filter))
      );
    }

    this.filteredMachines = filtered;
  }

  // Updated validation methods - check for files only
  isCurrentPartValid(): boolean {
    if (this.parts.length === 0) return false;

    const currentPart = this.parts[this.parts.length - 1];

    // At least one successful file upload is required
    return currentPart.files.some(file => file.status === 'success');
  }

  isFormValid(): boolean {
    // For each part, check if there's valid data
    return this.parts.every(part => {
      return part.files.some(file => file.status === 'success');
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
        this.uploadFile(partIndex, uploadedFile);

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

  // Replace simulateUpload with actual upload using MediaService
  private uploadFile(partIndex: number, file: UploadedFile): void {
    const uploadSubscription = this.mediaService.uploadFile(file.file).subscribe({
      next: (event: HttpEvent<MediaItem>) => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            if (event.total) {
              file.progress = Math.round((event.loaded / event.total) * 100);
            }
            break;

          case HttpEventType.Response:
            if (event.body) {
              file.status = 'success';
              file.progress = 100;
              file.mediaItem = event.body;
              console.log('File uploaded successfully:', event.body);
            }
            break;
        }

        // Update the stored parts for the selected machine after each progress update
        if (this.selectedMachine) {
          this.machinePartsMap.set(this.selectedMachine.id, [...this.parts]);
        }
      },
      error: (error) => {
        console.error('Upload failed:', error);
        file.status = 'error';
        file.progress = 0;

        // Set a user-friendly error message
        if (error.status === 413) {
          file.errorMessage = 'File too large';
        } else if (error.status === 415) {
          file.errorMessage = 'Unsupported file type';
        } else if (error.status === 0) {
          file.errorMessage = 'Network error';
        } else {
          file.errorMessage = error.error?.message || 'Upload failed';
        }

        // Update the stored parts for the selected machine
        if (this.selectedMachine) {
          this.machinePartsMap.set(this.selectedMachine.id, [...this.parts]);
        }
      },
      complete: () => {
        // Clean up the subscription
        if (file.uploadSubscription) {
          file.uploadSubscription = undefined;
        }
      }
    });

    // Store the subscription so we can cancel it if needed
    file.uploadSubscription = uploadSubscription;
  }

  removeFile(partIndex: number, file: UploadedFile): void {
    // Cancel upload if it's in progress
    if (file.uploadSubscription && !file.uploadSubscription.closed) {
      file.uploadSubscription.unsubscribe();
    }

    // If the file was successfully uploaded, optionally delete it from the server
    if (file.status === 'success' && file.mediaItem) {
      this.mediaService.deleteMediaItem(file.mediaItem.id).subscribe({
        next: () => {
          console.log('File deleted from server:', file.mediaItem?.filename);
        },
        error: (error) => {
          console.error('Failed to delete file from server:', error);
          // Don't prevent local removal if server deletion fails
        }
      });
    }

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
    // Cancel the actual upload request
    if (file.uploadSubscription && !file.uploadSubscription.closed) {
      file.uploadSubscription.unsubscribe();
    }

    // Remove the file from the list
    this.removeFile(partIndex, file);
  }

  retryUpload(partIndex: number, file: UploadedFile): void {
    // Cancel any existing upload
    if (file.uploadSubscription && !file.uploadSubscription.closed) {
      file.uploadSubscription.unsubscribe();
    }

    // Reset file status and progress
    file.status = 'uploading';
    file.progress = 0;
    file.errorMessage = undefined;

    // Start the upload again
    this.uploadFile(partIndex, file);
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
          id: this.generateUniqueId(),
          machineId: this.selectedMachine!.id,
          machineName: this.selectedMachine!.articleDescription,
          // Only include successfully uploaded files
          files: part.files.filter(file => file.status === 'success'),
          // Include MediaItem references
          mediaItems: part.files
            .filter(file => file.status === 'success' && file.mediaItem)
            .map(file => file.mediaItem!)
        } as unknown as ManualCartItem;
      });

      // Create an array for all machines in the submission
      const machineEntries = [];

      // Add the currently selected machine
      machineEntries.push({
        machine: `${environment.apiBaseUrl}${environment.apiPath}/machines/${this.selectedMachine.id}`,
        notes: "string",
        products: this.parts.map(part => ({

          //
          partName: '',
          partNumber: '',
          shortDescription: '',
          additionalNotes: '',
          //

          // Include media item references if needed for API
          mediaItems: part.files
            .filter(file => file.status === 'success' && file.mediaItem)
            .map(file => '/api/v1/media_items/' + file.mediaItem!.id)
        }))
      });

      // Add other machines from the machinePartsMap
      this.machinePartsMap.forEach((parts, machineId) => {
        // Skip the current machine as we've already added it
        if (machineId === this.selectedMachine?.id) {
          return;
        }

        // Only add machines that have at least one part with files
        if (parts.length > 0 && parts.some(part => part.files.length > 0)) {
          machineEntries.push({
            machine: `${environment.apiBaseUrl}${environment.apiPath}/machines/${machineId}`,
            notes: "string",
            products: parts.map(part => ({
              mediaItems: part.files
                .filter(file => file.status === 'success' && file.mediaItem)
                .map(file => '/api/v1/media_items/' + file.mediaItem!.id)
            }))
          });
        }
      });

      // Get the current user ID from an auth service
      const currentUser = this.authService.getCurrentUser();
      const userId = currentUser?.id || 'current-user';

      // Add parts to the manual cart and open the inquiry overview
      this.manualQuickCartService.addToCart(manualCartItems);

      const inquiryData: InquiryRequest = {
        status: "pending",
        notes: "Inquiry created via manual entry form",
        contactEmail: currentUser?.email || "string",
        contactPhone: 'string',
        isDraft: false,
        user: `${environment.apiBaseUrl}${environment.apiPath}/users/${userId}`,
        machines: machineEntries
      };

      console.log('Template submission data:', inquiryData);

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
    // Cancel all ongoing uploads and clean up resources
    this.machinePartsMap.forEach(parts => {
      parts.forEach(part => {
        part.files.forEach(file => {
          // Cancel any ongoing uploads
          if (file.uploadSubscription && !file.uploadSubscription.closed) {
            file.uploadSubscription.unsubscribe();
          }
          // Clean up object URLs
          if (file.previewUrl) {
            URL.revokeObjectURL(file.previewUrl);
          }
        });
      });
    });

    // Also clean up current parts
    this.parts.forEach(part => {
      part.files.forEach(file => {
        if (file.uploadSubscription && !file.uploadSubscription.closed) {
          file.uploadSubscription.unsubscribe();
        }
        if (file.previewUrl) {
          URL.revokeObjectURL(file.previewUrl);
        }
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

        // If this file was already uploaded successfully, we need to re-upload the edited version
        if (part.files[fileIndex].status === 'success') {
          part.files[fileIndex].status = 'uploading';
          part.files[fileIndex].progress = 0;

          // Delete the old file from server if it exists
          if (part.files[fileIndex].mediaItem) {
            this.mediaService.deleteMediaItem(part.files[fileIndex].mediaItem!.id).subscribe({
              error: (error) => console.error('Failed to delete old file:', error)
            });
          }

          // Upload the edited file
          this.uploadFile(this.parts.indexOf(part), part.files[fileIndex]);
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
