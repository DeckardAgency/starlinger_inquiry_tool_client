import { Component, OnInit, HostListener, ElementRef, ViewChildren, QueryList, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged, switchMap, startWith, catchError } from 'rxjs/operators';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { Subscription, of, EMPTY } from 'rxjs';
import { BreadcrumbsComponent } from '@shared/components/ui/breadcrumbs/breadcrumbs.component';
import { MachineArticleItemComponent } from '@shared/components/machine/machine-article-item/machine-article-item.component';
import { AdvancedImagePreviewModalComponent } from '@shared/components/modals/advanced-image-preview-modal/advanced-image-preview-modal.component';
import { MachineService } from '@services/http/machine.service';
import { ManualQuickCartService } from '@services/cart/manual-quick-cart.service';
import { ManualCartItem } from '@models/manual-cart-item.model';
import { MediaService } from '@services/http/media.service';
import { MediaItem } from '@models/media.model';
import { Breadcrumb, MachineType, UploadedFile } from '@core/models';
import { Machine } from '@core/models/machine.model';
import { IconComponent } from '@shared/components/icon/icon.component';
import { MachineArticleItemShimmerComponent } from '@shared/components/machine/machine-article-item/machine-article-item-shimmer.component';
import { environment } from '@env/environment';
import { AuthService } from '@core/auth/auth.service';
import { InquiryRequest, InquiryService } from '@services/http/inquiry.service';

export interface Part {
  id: string;
  data: {
    partName: string;
    partNumber: string;
    shortDescription: string;
    additionalNotes: string;
  };
  files: UploadedFile[];
  touched: boolean;
}

@Component({
  selector: 'app-manual-entry-input-form',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    BreadcrumbsComponent,
    MachineArticleItemComponent,
    AdvancedImagePreviewModalComponent,
    IconComponent,
    MachineArticleItemShimmerComponent
  ],
  templateUrl: './manual-entry-input-form.component.html',
  styleUrls: ['./manual-entry-input-form.component.scss']
})
export class ManualEntryInputFormComponent implements OnInit, OnDestroy {
  // Machine data properties
  machines: Machine[] = [];
  filteredMachines: Machine[] = [];
  selectedMachine: Machine | null = null;
  loading = true;
  error: string | null = null;
  totalItems = 0;
  dragCounter = 0;

  // Search state
  searchLoading = false;
  searchError: string | null = null;
  private searchSubscription?: Subscription;

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
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  // Using ViewChildren to get all file inputs
  @ViewChildren('fileInputElement') fileInputElements!: QueryList<ElementRef<HTMLInputElement>>;

  // Search and form controls
  searchControl = new FormControl('');

  // Form for adding a new part
  partForm = new FormGroup({
    partName: new FormControl('', Validators.required),
    partNumber: new FormControl(''),
    shortDescription: new FormControl('', Validators.required),
    additionalNotes: new FormControl('')
  });

  // Parts repeater array
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

  constructor(
    private machineService: MachineService,
    private manualQuickCartService: ManualQuickCartService,
    private authService: AuthService,
    private inquiryService: InquiryService,
    private mediaService: MediaService,
    private cdr: ChangeDetectorRef
  ) {
    // Set up search functionality with server-side search
    this.setupSearch();
  }

  ngOnInit(): void {
    this.loadMachines();
    this.addPart(); // Add first part by default
  }

  ngOnDestroy(): void {
    // Clean up search subscription
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }

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

  /**
   * Set up reactive search functionality
   */
  private setupSearch(): void {
    this.searchSubscription = this.searchControl.valueChanges.pipe(
      startWith(''), // Start with empty search
      debounceTime(300), // Wait 300ms after user stops typing
      distinctUntilChanged(), // Only emit if value actually changed
      switchMap(searchTerm => {
        // Set loading state
        this.searchLoading = true;
        this.searchError = null;

        // If search term is empty or only whitespace, load all machines
        if (!searchTerm?.trim()) {
          return this.machineService.getMachines().pipe(
            catchError(error => {
              console.error('Error loading machines:', error);
              this.searchError = 'Failed to load machines. Please try again.';
              return of({ member: [], totalItems: 0, '@context': '', '@id': '', '@type': '', view: null });
            })
          );
        }

        // Perform server-side search
        return this.machineService.searchMachines(searchTerm.trim()).pipe(
          catchError(error => {
            console.error('Error searching machines:', error);
            this.searchError = `Failed to search for "${searchTerm}". Please try again.`;
            return of({ member: [], totalItems: 0, '@context': '', '@id': '', '@type': '', view: null });
          })
        );
      })
    ).subscribe({
      next: (response) => {
        this.machines = response.member;
        this.totalItems = response.totalItems;
        this.searchLoading = false;

        // Apply local filters (machine types) if any are active
        this.applyLocalFilters();
      },
      error: (error) => {
        console.error('Search subscription error:', error);
        this.searchError = 'Search failed. Please try again.';
        this.searchLoading = false;
      }
    });
  }

  /**
   * Apply local filters (machine types) to the search results
   */
  private applyLocalFilters(): void {
    let filtered = this.machines;

    // Apply machine type filters
    if (this.activeFilters.length > 0) {
      filtered = filtered.filter(machine =>
        this.activeFilters.some(filter =>
          machine.articleDescription.toLowerCase().includes(filter.toLowerCase())
        )
      );
    }

    this.filteredMachines = filtered;
  }

  /**
   * Load initial machines without search
   */
  private loadMachines(): void {
    this.loading = true;
    this.error = null;

    this.machineService.getMachines().subscribe({
      next: (response) => {
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

  /**
   * Clear search input
   */
  clearSearch(): void {
    this.searchControl.setValue('');
  }

  /**
   * Handle search input focus for better UX
   */
  onSearchFocus(): void {
    // You can add focus-specific behavior here if needed
  }

  /**
   * Handle search input blur for better UX
   */
  onSearchBlur(): void {
    // You can add blur-specific behavior here if needed
  }

  // Machine type filter methods
  removeFilter(filter: string): void {
    // Remove from activeFilters
    this.activeFilters = this.activeFilters.filter(f => f !== filter);

    // Update machine type checked state
    const machineType = this.machineTypes.find(m => m.name === filter);
    if (machineType) {
      machineType.checked = false;
    }

    // Reapply local filters
    this.applyLocalFilters();
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

    // Reapply local filters
    this.applyLocalFilters();
  }

  // Part repeater methods
  addPart(): void {
    const newPart: Part = {
      id: this.generateUniqueId(),
      data: {
        partName: '',
        partNumber: '',
        shortDescription: '',
        additionalNotes: ''
      },
      files: [],
      touched: false
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

  // Methods to check part form validity
  checkPartValidity(): void {
    // Mark the current part as touched to show validation errors
    if (this.parts.length > 0) {
      this.parts[this.parts.length - 1].touched = true;

      // Update the stored parts for the selected machine
      if (this.selectedMachine) {
        this.machinePartsMap.set(this.selectedMachine.id, [...this.parts]);
      }
    }
  }

  isCurrentPartValid(): boolean {
    if (this.parts.length === 0) return false;

    const currentPart = this.parts[this.parts.length - 1];

    // Check if required fields are filled
    return !!currentPart.data.partName &&
      !!currentPart.data.shortDescription;
  }

  isFormValid(): boolean {
    return this.parts.every(part =>
      !!part.data.partName &&
      !!part.data.shortDescription
    );
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
          progress: 0 // Start at 0
        };

        // If it's an image, create a preview URL
        if (this.isImageFile(file.name)) {
          uploadedFile.previewUrl = URL.createObjectURL(file);
        }

        this.parts[partIndex].files.push(uploadedFile);

        // Force change detection to ensure UI updates immediately
        this.cdr.detectChanges();

        // Start upload with a small delay to ensure UI has rendered
        setTimeout(() => {
          this.uploadFile(partIndex, uploadedFile);
        }, 10);

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
    // Set initial progress to show the progress bar immediately
    file.progress = 1; // Start at 1% to ensure the progress bar is visible
    this.cdr.detectChanges(); // Force UI update

    const uploadSubscription = this.mediaService.uploadFile(file.file).subscribe({
      next: (event: HttpEvent<MediaItem>) => {
        switch (event.type) {
          case HttpEventType.Sent:
            // File upload has been sent to server
            file.progress = 1;
            break;

          case HttpEventType.UploadProgress:
            if (event.total) {
              // Calculate progress, ensuring it's at least 1% for visibility
              file.progress = Math.max(1, Math.round((event.loaded / event.total) * 100));
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

        // Trigger change detection for smooth progress updates
        this.cdr.detectChanges();
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

        this.cdr.detectChanges();
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
          partData: {
            partName: part.data.partName,
            partNumber: part.data.partNumber,
            shortDescription: part.data.shortDescription,
            additionalNotes: part.data.additionalNotes,
            // Include MediaItem references inside partData
            mediaItems: part.files
              .filter(file => file.status === 'success' && file.mediaItem)
              .map(file => file.mediaItem!)
          },
          // Only include successfully uploaded files
          files: part.files.filter(file => file.status === 'success')
        };
      });

      // Create an array for all machines in the submission
      const machineEntries = [];

      // Add the currently selected machine
      machineEntries.push({
        machine: `${environment.apiBaseUrl}${environment.apiPath}/machines/${this.selectedMachine.id}`,
        notes: "string",
        products: this.parts.map(part => ({
          partName: part.data.partName,
          partNumber: part.data.partNumber,
          shortDescription: part.data.shortDescription,
          additionalNotes: part.data.additionalNotes,
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

        // Only add machines that have at least one part
        if (parts.length > 0) {
          machineEntries.push({
            machine: `${environment.apiBaseUrl}${environment.apiPath}/machines/${machineId}`,
            notes: "string",
            products: parts.map(part => ({
              partName: part.data.partName,
              partNumber: part.data.partNumber,
              shortDescription: part.data.shortDescription,
              additionalNotes: part.data.additionalNotes,
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

      console.log('Form submission data:', inquiryData);

      // Remove the saved parts for this machine (since they've been submitted)
      if (this.selectedMachine) {
        this.machinePartsMap.delete(this.selectedMachine.id);
      }

      // Reset the form state but don't close details yet
      this.parts = [];
      this.addPart();
    }
  }

  // Add a method to get the total parts across all machines
  getTotalPartsCount(): number {
    let count = 0;
    this.machinePartsMap.forEach((parts) => {
      count += parts.length;
    });
    return count;
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
