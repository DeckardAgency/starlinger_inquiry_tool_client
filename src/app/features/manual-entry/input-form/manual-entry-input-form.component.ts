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

// Guard interface
import { CanComponentDeactivate } from '@core/guards/can-deactivate.guard';

export interface Part {
  id: string;
  data: {
    partName: string;
    partNumber: string;
    shortDescription: string;
    additionalNotes: string;
    machineId?: string; // For "Other" machines
  };
  files: UploadedFile[];
  touched: boolean;
  isExpanded: boolean;
}

export interface OtherMachine extends Machine {
  isOther?: boolean;
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
export class ManualEntryInputFormComponent implements OnInit, OnDestroy, CanComponentDeactivate {
  machines: Machine[] = [];
  filteredMachines: Machine[] = [];
  selectedMachine: Machine | null = null;
  isOtherMachineSelected = false;
  loading = true;
  error: string | null = null;
  totalItems = 0;
  dragCounter = 0;

  searchLoading = false;
  searchError: string | null = null;
  private searchSubscription?: Subscription;

  showImagePreview = false;
  previewImageSrc = '';
  previewImageAlt = '';
  previewImageFileName = '';

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

  @ViewChildren('fileInputElement') fileInputElements!: QueryList<ElementRef<HTMLInputElement>>;

  searchControl = new FormControl('');

  partForm = new FormGroup({
    partName: new FormControl('', Validators.required),
    partNumber: new FormControl(''),
    shortDescription: new FormControl('', Validators.required),
    additionalNotes: new FormControl('')
  });

  parts: Part[] = [];
  machinePartsMap: Map<string, Part[]> = new Map();

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
    this.setupSearch();
  }

  ngOnInit(): void {
    this.loadMachines();
    this.addPart();
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }

    this.machinePartsMap.forEach(parts => {
      parts.forEach(part => {
        part.files.forEach(file => {
          if (file.uploadSubscription && !file.uploadSubscription.closed) {
            file.uploadSubscription.unsubscribe();
          }
          if (file.previewUrl) {
            URL.revokeObjectURL(file.previewUrl);
          }
        });
      });
    });

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

  canDeactivate(): boolean {
    return !this.hasUnsavedData();
  }

  getComponentName(): string {
    return 'Use input form';
  }

  private hasUnsavedData(): boolean {
    const hasCurrentData = this.parts.some(part =>
      part.files.length > 0 ||
      part.data.partName ||
      part.data.shortDescription
    );

    if (hasCurrentData) {
      return true;
    }

    for (const [machineId, parts] of this.machinePartsMap.entries()) {
      const hasData = parts.some(part =>
        part.files.length > 0 ||
        part.data.partName ||
        part.data.shortDescription
      );
      if (hasData) {
        return true;
      }
    }

    return false;
  }

  private setupSearch(): void {
    this.searchSubscription = this.searchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(searchTerm => {
        this.searchLoading = true;
        this.searchError = null;

        if (!searchTerm?.trim()) {
          return this.machineService.getMachines().pipe(
            catchError(error => {
              console.error('Error loading machines:', error);
              this.searchError = 'Failed to load machines. Please try again.';
              return of({ member: [], totalItems: 0, '@context': '', '@id': '', '@type': '', view: null });
            })
          );
        }

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
        this.applyLocalFilters();
      },
      error: (error) => {
        console.error('Search subscription error:', error);
        this.searchError = 'Search failed. Please try again.';
        this.searchLoading = false;
      }
    });
  }

  private applyLocalFilters(): void {
    let filtered = this.machines;

    if (this.activeFilters.length > 0) {
      filtered = filtered.filter(machine =>
        this.activeFilters.some(filter =>
          machine.articleDescription.toLowerCase().includes(filter.toLowerCase())
        )
      );
    }

    // Add "Other" option at the end
    this.filteredMachines = [...filtered, this.createOtherMachineOption()];
  }

  private loadMachines(): void {
    this.loading = true;
    this.error = null;

    this.machineService.getMachines().subscribe({
      next: (response) => {
        this.machines = response.member;
        this.totalItems = response.totalItems;
        // Include "Other" option
        this.filteredMachines = [...this.machines, this.createOtherMachineOption()];
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load machines. Please try again later.';
        this.loading = false;
        console.error('Error loading machines:', err);
      }
    });
  }

  private createOtherMachineOption(): OtherMachine {
    return {
      id: 'other',
      articleDescription: 'Other/Older (Not Listed)',
      isOther: true
    } as OtherMachine;
  }

  clearSearch(): void {
    this.searchControl.setValue('');
  }

  onSearchFocus(): void { }

  onSearchBlur(): void { }

  removeFilter(filter: string): void {
    this.activeFilters = this.activeFilters.filter(f => f !== filter);

    const machineType = this.machineTypes.find(m => m.name === filter);
    if (machineType) {
      machineType.checked = false;
    }

    this.applyLocalFilters();
  }

  toggleFilter(): void {
    this.isFilterOpen = !this.isFilterOpen;
  }

  toggleMachineType(machineType: MachineType): void {
    machineType.checked = !machineType.checked;

    if (machineType.checked) {
      if (!this.activeFilters.includes(machineType.name)) {
        this.activeFilters.push(machineType.name);
      }
    } else {
      this.activeFilters = this.activeFilters.filter(filter => filter !== machineType.name);
    }

    this.applyLocalFilters();
  }

  addPart(): void {
    // Close all existing parts
    this.parts.forEach((part: Part) => {
      part.isExpanded = false;
    });

    const newPart: Part = {
      id: this.generateUniqueId(),
      data: {
        partName: '',
        partNumber: '',
        shortDescription: '',
        additionalNotes: '',
        machineId: ''
      },
      files: [],
      touched: false,
      isExpanded: true
    };

    this.parts.push(newPart);

    if (this.selectedMachine) {
      this.machinePartsMap.set(this.selectedMachine.id, [...this.parts]);
    }

    // Scroll to the new part after a short delay to ensure DOM is updated
    setTimeout(() => {
      this.scrollToNewPart();
    }, 100);
  }

  private scrollToNewPart(): void {
    const partElements = document.querySelectorAll('.part-repeater__item');
    if (partElements.length > 0) {
      const lastPart = partElements[partElements.length - 1];
      const elementPosition = lastPart.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - 140;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }

  removePart(index: number): void {
    if (this.parts.length > 1) {
      this.parts[index].files.forEach(file => {
        if (file.uploadSubscription && !file.uploadSubscription.closed) {
          file.uploadSubscription.unsubscribe();
        }
        if (file.previewUrl) {
          URL.revokeObjectURL(file.previewUrl);
        }
      });

      this.parts.splice(index, 1);

      // If only one part remains, expand it
      if (this.parts.length === 1) {
        this.parts[0].isExpanded = true;
      }

      if (this.selectedMachine) {
        this.machinePartsMap.set(this.selectedMachine.id, [...this.parts]);
      }
    }
  }

  togglePartAccordion(index: number): void {
    this.parts[index].isExpanded = !this.parts[index].isExpanded;

    if (this.selectedMachine) {
      this.machinePartsMap.set(this.selectedMachine.id, [...this.parts]);
    }
  }

  private generateUniqueId(): string {
    return 'part_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
  }

  selectMachine(machine: Machine): void {
    if (this.selectedMachine) {
      this.machinePartsMap.set(this.selectedMachine.id, [...this.parts]);
    }

    this.selectedMachine = machine;
    this.isOtherMachineSelected = machine.id === 'other';

    if (machine) {
      this.breadcrumbs = [
        { label: 'Dashboard', link: '/dashboard' },
        { label: 'Manual Entry', link: '/manual-entry' },
        { label: machine.articleDescription }
      ];

      if (this.machinePartsMap.has(machine.id)) {
        this.parts = [...this.machinePartsMap.get(machine.id)!];
        // If only one part, expand it
        if (this.parts.length === 1) {
          this.parts[0].isExpanded = true;
        }
      } else {
        this.parts = [];
        this.addPart();
      }
    }
  }

  closeDetails(): void {
    if (this.selectedMachine) {
      this.machinePartsMap.set(this.selectedMachine.id, [...this.parts]);
    }

    this.selectedMachine = null;
    this.isOtherMachineSelected = false;
    this.breadcrumbs = [
      { label: 'Dashboard', link: '/dashboard' },
      { label: 'Manual Entry', link: '/manual-entry' }
    ];
  }

  checkPartValidity(): void {
    if (this.parts.length > 0) {
      this.parts[this.parts.length - 1].touched = true;

      if (this.selectedMachine) {
        this.machinePartsMap.set(this.selectedMachine.id, [...this.parts]);
      }
    }
  }

  isCurrentPartValid(): boolean {
    if (this.parts.length === 0) return false;

    const currentPart = this.parts[this.parts.length - 1];
    const hasBasicFields = !!currentPart.data.partName &&
      !!currentPart.data.shortDescription;

    // If "Other" machine, also require machineId
    if (this.isOtherMachineSelected) {
      return hasBasicFields && !!currentPart.data.machineId?.trim();
    }

    return hasBasicFields;
  }

  isFormValid(): boolean {
    const baseValid = this.parts.every(part =>
      !!part.data.partName &&
      !!part.data.shortDescription
    );

    // If "Other" machine, all parts must have machineId
    if (this.isOtherMachineSelected) {
      return baseValid && this.parts.every(part => !!part.data.machineId?.trim());
    }

    return baseValid;
  }

  triggerFileInput(partIndex: number): void {
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

    if (this.dragCounter === 0) {
      this.isDragging = false;
    }
  }

  onDrop(event: DragEvent, partIndex: number): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    this.dragCounter = 0;

    if (event.dataTransfer?.files) {
      this.handleFiles(event.dataTransfer.files, partIndex);
    }
  }

  private handleFiles(fileList: FileList, partIndex: number): void {
    if (partIndex >= 0 && partIndex < this.parts.length) {
      Array.from(fileList).forEach(file => {
        if (!this.isValidFileType(file)) {
          alert(`File type not allowed: ${file.name}`);
          return;
        }

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

        if (this.isImageFile(file.name)) {
          uploadedFile.previewUrl = URL.createObjectURL(file);
        }

        this.parts[partIndex].files.push(uploadedFile);

        this.cdr.detectChanges();

        setTimeout(() => {
          this.uploadFile(partIndex, uploadedFile);
        }, 10);

        if (this.selectedMachine) {
          this.machinePartsMap.set(this.selectedMachine.id, [...this.parts]);
        }
      });
    }
  }

  private isValidFileType(file: File): boolean {
    return this.allowedFileTypes.includes(file.type);
  }

  private uploadFile(partIndex: number, file: UploadedFile): void {
    file.progress = 1;
    this.cdr.detectChanges();

    const uploadSubscription = this.mediaService.uploadFile(file.file).subscribe({
      next: (event: HttpEvent<MediaItem>) => {
        switch (event.type) {
          case HttpEventType.Sent:
            file.progress = 1;
            break;

          case HttpEventType.UploadProgress:
            if (event.total) {
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

        if (this.selectedMachine) {
          this.machinePartsMap.set(this.selectedMachine.id, [...this.parts]);
        }

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Upload failed:', error);
        file.status = 'error';
        file.progress = 0;

        if (error.status === 413) {
          file.errorMessage = 'File too large';
        } else if (error.status === 415) {
          file.errorMessage = 'Unsupported file type';
        } else if (error.status === 0) {
          file.errorMessage = 'Network error';
        } else {
          file.errorMessage = error.error?.message || 'Upload failed';
        }

        if (this.selectedMachine) {
          this.machinePartsMap.set(this.selectedMachine.id, [...this.parts]);
        }

        this.cdr.detectChanges();
      },
      complete: () => {
        if (file.uploadSubscription) {
          file.uploadSubscription = undefined;
        }
      }
    });

    file.uploadSubscription = uploadSubscription;
  }

  removeFile(partIndex: number, file: UploadedFile): void {
    if (file.uploadSubscription && !file.uploadSubscription.closed) {
      file.uploadSubscription.unsubscribe();
    }

    if (file.status === 'success' && file.mediaItem) {
      this.mediaService.deleteMediaItem(file.mediaItem.id).subscribe({
        next: () => {
          console.log('File deleted from server:', file.mediaItem?.filename);
        },
        error: (error) => {
          console.error('Failed to delete file from server:', error);
        }
      });
    }

    if (file.previewUrl) {
      URL.revokeObjectURL(file.previewUrl);
    }

    this.parts[partIndex].files = this.parts[partIndex].files.filter(f => f !== file);

    if (this.selectedMachine) {
      this.machinePartsMap.set(this.selectedMachine.id, [...this.parts]);
    }
  }

  cancelUpload(partIndex: number, file: UploadedFile): void {
    if (file.uploadSubscription && !file.uploadSubscription.closed) {
      file.uploadSubscription.unsubscribe();
    }

    this.removeFile(partIndex, file);
  }

  retryUpload(partIndex: number, file: UploadedFile): void {
    if (file.uploadSubscription && !file.uploadSubscription.closed) {
      file.uploadSubscription.unsubscribe();
    }

    file.status = 'uploading';
    file.progress = 0;
    file.errorMessage = undefined;

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
            mediaItems: part.files
              .filter(file => file.status === 'success' && file.mediaItem)
              .map(file => file.mediaItem!)
          },
          files: part.files.filter(file => file.status === 'success')
        };
      });

      const machineEntries: any[] = [];

      // Handle "Other" machines differently
      if (this.isOtherMachineSelected) {
        machineEntries.push({
          machine: this.parts[0].data.machineId, // Custom machine identifier
          notes: `Inquiry for unlisted/custom machine: ${this.parts[0].data.machineId}`,
          products: this.parts.map(part => ({
            partName: part.data.partName,
            partNumber: part.data.partNumber,
            shortDescription: part.data.shortDescription,
            additionalNotes: part.data.additionalNotes,
            mediaItems: part.files
              .filter(file => file.status === 'success' && file.mediaItem)
              .map(file => '/api/v1/media_items/' + file.mediaItem!.id)
          }))
        });
      } else {
        machineEntries.push({
          machine: `${environment.apiBaseUrl}${environment.apiPath}/machines/${this.selectedMachine.id}`,
          notes: "string",
          products: this.parts.map(part => ({
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

      this.machinePartsMap.forEach((parts, machineId) => {
        if (machineId === this.selectedMachine?.id) {
          return;
        }

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

      const currentUser = this.authService.getCurrentUser();
      const userId = currentUser?.id || 'current-user';

      this.manualQuickCartService.addToCart(manualCartItems);

      const inquiryData: InquiryRequest = {
        status: "pending",
        notes: "Inquiry created via manual entry form",
        contactEmail: currentUser?.email || "string",
        contactPhone: 'string',
        isDraft: false,
        user: `${environment.apiBaseUrl}${environment.apiPath}/users/${userId}`,
        machines: machineEntries as any
      };

      console.log('Form submission data:', inquiryData);

      if (this.selectedMachine) {
        this.machinePartsMap.delete(this.selectedMachine.id);
      }

      this.parts = [];
      this.isOtherMachineSelected = false;
      this.addPart();
    }
  }

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

  saveEditedImage(dataUrl: string): void {
    if (!this.previewImageSrc) return;

    for (const part of this.parts) {
      const fileIndex = part.files.findIndex(f => f.previewUrl === this.previewImageSrc);
      if (fileIndex !== -1) {
        const blob = this.dataURLToBlob(dataUrl);
        const editedFile = new File([blob], part.files[fileIndex].name, {
          type: part.files[fileIndex].type
        });

        URL.revokeObjectURL(part.files[fileIndex].previewUrl!);

        part.files[fileIndex].file = editedFile;
        part.files[fileIndex].previewUrl = URL.createObjectURL(editedFile);

        if (part.files[fileIndex].status === 'success') {
          part.files[fileIndex].status = 'uploading';
          part.files[fileIndex].progress = 0;

          if (part.files[fileIndex].mediaItem) {
            this.mediaService.deleteMediaItem(part.files[fileIndex].mediaItem!.id).subscribe({
              error: (error) => console.error('Failed to delete old file:', error)
            });
          }

          this.uploadFile(this.parts.indexOf(part), part.files[fileIndex]);
        }

        this.previewImageSrc = part.files[fileIndex].previewUrl;

        if (this.selectedMachine) {
          this.machinePartsMap.set(this.selectedMachine.id, [...this.parts]);
        }
        break;
      }
    }
  }

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
