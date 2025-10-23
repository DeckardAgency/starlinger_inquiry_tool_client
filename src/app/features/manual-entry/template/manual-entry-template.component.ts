import { Component, OnInit, HostListener, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged, switchMap, startWith, catchError } from 'rxjs/operators';
import { Subscription, of } from 'rxjs';

// Components
import { BreadcrumbsComponent } from '@shared/components/ui/breadcrumbs/breadcrumbs.component';
import { MachineArticleItemComponent } from '@shared/components/machine/machine-article-item/machine-article-item.component';
import { AdvancedImagePreviewModalComponent } from '@shared/components/modals/advanced-image-preview-modal/advanced-image-preview-modal.component';
import { MachineArticleItemShimmerComponent } from '@shared/components/machine/machine-article-item/machine-article-item-shimmer.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { SpreadsheetComponent } from '@shared/components/spreadsheet/spreadsheet.component';
import { FileUploadComponent } from '@shared/components/file-upload/file-upload.component';

// Services
import { MachineService } from '@services/http/machine.service';
import { ManualQuickCartService } from '@services/cart/manual-quick-cart.service';
import { AuthService } from '@core/auth/auth.service';
import { InquiryService, InquiryRequest } from '@services/http/inquiry.service';

// Models and Types
import { ManualCartItem } from '@models/manual-cart-item.model';
import { UploadedFile } from '@models/manual-cart-item.model';
import { Breadcrumb } from '@core/models';
import { Machine } from '@core/models/machine.model';
import { SpreadsheetRow, TabType } from '@shared/components/spreadsheet/spreadsheet.interface';
import { environment } from '@env/environment';

// Guard interface
import { CanComponentDeactivate } from '@core/guards/can-deactivate.guard';

// Define Part interface with updated structure
interface Part {
  id: string;
  files: UploadedFile[];
  spreadsheetData: SpreadsheetRow[];
  data?: {
    machineId?: string; // For "Other" machines
  };
}

// Define MachineType interface
interface MachineType {
  id: string;
  name: string;
  checked: boolean;
}

// OtherMachine interface extending Machine
export interface OtherMachine extends Machine {
  isOther?: boolean;
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
    MachineArticleItemComponent,
    AdvancedImagePreviewModalComponent,
    MachineArticleItemShimmerComponent,
    IconComponent,
    SpreadsheetComponent,
    FileUploadComponent
  ],
  templateUrl: './manual-entry-template.component.html',
  styleUrls: ['./manual-entry-template.component.scss']
})
export class ManualEntryTemplateComponent implements OnInit, AfterViewInit, OnDestroy, CanComponentDeactivate {
  // Machine data properties
  machines: Machine[] = [];
  filteredMachines: Machine[] = [];
  selectedMachine: Machine | null = null;
  isOtherMachineSelected = false;
  loading = true;
  error: string | null = null;
  totalItems = 0;

  // Search state
  searchLoading = false;
  searchError: string | null = null;
  private searchSubscription?: Subscription;

  // Image preview modal properties
  showImagePreview = false;
  previewImageSrc = '';
  previewImageAlt = '';
  previewImageFileName = '';

  // Search and form controls
  searchControl = new FormControl('');

  // Simple form for files only
  partForm = new FormGroup({});

  // Spreadsheet state
  currentSpreadsheetTab: TabType = 'client';
  hasClientData: boolean = false;

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

  constructor(
    private machineService: MachineService,
    private authService: AuthService,
    private inquiryService: InquiryService,
    private manualQuickCartService: ManualQuickCartService
  ) {
    // Set up search functionality
    this.setupSearch();
  }

  ngOnInit(): void {
    this.loadMachines();
    this.addPart(); // Add first part by default
  }

  ngAfterViewInit(): void {
    // Component initialization complete
  }

  ngOnDestroy(): void {
    // Clean up search subscription
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }

    // Clean up file URLs to prevent memory leaks
    this.machinePartsMap.forEach(parts => {
      parts.forEach(part => {
        part.files.forEach(file => {
          if (file.previewUrl) {
            URL.revokeObjectURL(file.previewUrl);
          }
        });
      });
    });

    // Also clean up current parts
    this.parts.forEach(part => {
      part.files.forEach(file => {
        if (file.previewUrl) {
          URL.revokeObjectURL(file.previewUrl);
        }
      });
    });
  }

  /**
   * CanComponentDeactivate implementation
   * Returns true if there's no unsaved data, false otherwise
   */
  canDeactivate(): boolean {
    return !this.hasUnsavedData();
  }

  /**
   * Get component name for the guard message
   */
  getComponentName(): string {
    return 'Use template';
  }

  /**
   * Check if there's any unsaved data
   */
  private hasUnsavedData(): boolean {
    // Check current parts
    const hasCurrentData = this.parts.some(part =>
      part.files.length > 0 ||
      part.spreadsheetData.length > 0
    );

    if (hasCurrentData) {
      return true;
    }

    // Check parts in machinePartsMap
    for (const [machineId, parts] of this.machinePartsMap.entries()) {
      const hasData = parts.some(part =>
        part.files.length > 0 ||
        part.spreadsheetData.length > 0
      );
      if (hasData) {
        return true;
      }
    }

    return false;
  }

  /**
   * Set up reactive search functionality
   */
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

        // Add "Other" machine option at the end
        this.machines.push({
          id: 'other',
          articleDescription: 'Other/Older (Not Listed)',
          machineType: []
        } as unknown as Machine);

        this.totalItems = response.totalItems + 1;
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

  /**
   * Apply local filters to machines list
   */
  private applyLocalFilters(): void {
    // For template component, no machine type filtering needed
    // Just return all machines as filtered machines
    this.filteredMachines = this.machines;
  }

  /**
   * Load machines from service
   */
  private loadMachines(): void {
    this.loading = true;
    this.error = null;

    this.machineService.getMachines().subscribe({
      next: (response) => {
        this.machines = response.member;

        // Add "Other" machine option at the end
        this.machines.push({
          id: 'other',
          articleDescription: 'Other/Unlisted Machine',
          machineType: []
        } as unknown as Machine);

        this.totalItems = response.totalItems + 1;
        this.applyLocalFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading machines:', error);
        this.error = 'Failed to load machines. Please try again.';
        this.loading = false;
      }
    });
  }

  /**
   * Select a machine and initialize parts for it
   */
  selectMachine(machine: Machine): void {
    this.selectedMachine = machine;

    // Check if "Other" machine is selected
    this.isOtherMachineSelected = machine.id === 'other';

    // Initialize parts data structure if not exists
    if (!this.parts[0]) {
      this.parts[0] = {
        id: this.generateUniqueId(),
        files: [],
        spreadsheetData: [],
        data: { machineId: '' }
      };
    }

    // Restore previously saved parts for this machine if they exist
    if (this.machinePartsMap.has(machine.id)) {
      this.parts = this.machinePartsMap.get(machine.id) || [];
      // Ensure all parts have data object initialized
      this.parts.forEach(part => {
        if (!part.data) {
          part.data = { machineId: '' };
        }
      });
    } else {
      // Reset parts for new machine selection
      this.parts = [{
        id: this.generateUniqueId(),
        files: [],
        spreadsheetData: [],
        data: { machineId: '' }
      }];
    }
  }

  /**
   * Add a new part to the current machine
   */
  addPart(): void {
    this.parts.push({
      id: this.generateUniqueId(),
      files: [],
      spreadsheetData: [],
      data: { machineId: '' }
    });
  }

  /**
   * Check if form is valid
   */
  isFormValid(): boolean {
    return this.parts.some(part =>
      part.files.length > 0 ||
      part.spreadsheetData.some(row => row.quantity || row.partNumber || row.partName)
    );
  }

  /**
   * Close the details panel and save current parts
   */
  closeDetails(): void {
    if (this.selectedMachine) {
      this.machinePartsMap.set(this.selectedMachine.id, [...this.parts]);
    }
    this.selectedMachine = null;
    this.isOtherMachineSelected = false;
  }

  /**
   * Handle spreadsheet data changes
   */
  onSpreadsheetDataChanged(data: SpreadsheetRow[], partIndex: number): void {
    if (this.parts[partIndex]) {
      this.parts[partIndex].spreadsheetData = data;
      if (this.selectedMachine) {
        this.machinePartsMap.set(this.selectedMachine.id, [...this.parts]);
      }
    }
  }

  /**
   * Handle spreadsheet tab changes
   */
  onSpreadsheetTabChanged(tab: TabType): void {
    this.currentSpreadsheetTab = tab;
  }

  /**
   * Handle file changes
   */
  onFilesChanged(files: UploadedFile[], partIndex: number): void {
    if (this.parts[partIndex]) {
      this.parts[partIndex].files = files;
      if (this.selectedMachine) {
        this.machinePartsMap.set(this.selectedMachine.id, [...this.parts]);
      }
    }
  }

  /**
   * Handle file preview request
   */
  onFilePreviewRequested(file: UploadedFile): void {
    if (this.isImageFile(file.name) && file.previewUrl) {
      this.previewImageSrc = file.previewUrl;
      this.previewImageAlt = file.name;
      this.previewImageFileName = file.name;
      this.showImagePreview = true;
    }
  }

  /**
   * Check if file is an image
   */
  isImageFile(fileName: string): boolean {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extension || '');
  }

  /**
   * Close image preview modal
   */
  closeImagePreview(): void {
    this.showImagePreview = false;
  }

  /**
   * Generate unique ID for parts
   */
  private generateUniqueId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  /**
   * Remove a filter
   */
  removeFilter(filter: string): void {
    this.activeFilters = this.activeFilters.filter(f => f !== filter);
    this.applyLocalFilters();
  }

  // Form submission
  onSubmit(): void {
    if (this.isFormValid() && this.selectedMachine) {
      console.log('Template form submission - parts:', this.parts);

      // Create cart items from all machines
      const allManualCartItems: ManualCartItem[] = [];

      // Process current machine
      const currentMachineItems = this.createCartItemsFromParts(this.parts, this.selectedMachine);
      allManualCartItems.push(...currentMachineItems);

      // Process saved machines
      this.machinePartsMap.forEach((parts, machineId) => {
        if (machineId !== this.selectedMachine?.id) {
          const machine = this.machines.find(m => m.id === machineId);
          if (machine && parts.length > 0) {
            const machineItems = this.createCartItemsFromParts(parts, machine);
            allManualCartItems.push(...machineItems);
          }
        }
      });

      // Add to cart
      console.log('Adding to cart:', allManualCartItems);
      this.manualQuickCartService.addToCart(allManualCartItems);

      // Create inquiry data
      const inquiryData = this.createInquiryData();
      console.log('Inquiry data:', inquiryData);

      // Clean up after submission
      if (this.selectedMachine) {
        this.machinePartsMap.delete(this.selectedMachine.id);
      }

      this.parts = [];
      this.addPart();
    }
  }

  /**
   * Create cart items from parts - Updated for new structure
   */
  private createCartItemsFromParts(parts: Part[], machine: Machine): ManualCartItem[] {
    return parts.flatMap(part => {
      const spreadsheetRows = part.spreadsheetData?.filter(row =>
        row.quantity || row.partNumber || row.partName
      ) || [];

      if (spreadsheetRows.length > 0) {
        return spreadsheetRows.map(row => ({
          id: this.generateUniqueId(),
          machineId: machine.id,
          machineName: machine.articleDescription,
          partData: {
            partName: row.partName || '',
            partNumber: row.partNumber || '',
            quantity: row.quantity || '',
            shortDescription: row.quantity ? `${row.quantity} pieces of ${row.partNumber || ''}` : '',
            additionalNotes: row.partName || '',
            mediaItems: part.files
              .filter(file => file.status === 'success' && file.mediaItem)
              .map(file => file.mediaItem!)
          },
          files: part.files.filter(file => file.status === 'success')
        }));
      } else if (part.files.some(file => file.status === 'success')) {
        return [{
          id: this.generateUniqueId(),
          machineId: machine.id,
          machineName: machine.articleDescription,
          partData: {
            partName: '',
            partNumber: '',
            quantity: '',
            shortDescription: '',
            additionalNotes: '',
            mediaItems: part.files
              .filter(file => file.status === 'success' && file.mediaItem)
              .map(file => file.mediaItem!)
          },
          files: part.files.filter(file => file.status === 'success')
        }];
      }

      return [];
    });
  }

  /**
   * Create inquiry data for API
   */
  private createInquiryData(): InquiryRequest {
    const currentUser = this.authService.getCurrentUser();
    const userId = currentUser?.id || 'current-user';

    const machineEntries = [];

    // Current machine
    if (this.selectedMachine && this.parts.length > 0) {
      machineEntries.push(this.createMachineEntry(this.selectedMachine, this.parts));
    }

    // Saved machines
    this.machinePartsMap.forEach((parts, machineId) => {
      if (machineId !== this.selectedMachine?.id) {
        const machine = this.machines.find(m => m.id === machineId);
        if (machine && parts.length > 0 && this.hasValidPartsData(parts)) {
          machineEntries.push(this.createMachineEntry(machine, parts));
        }
      }
    });

    return {
      status: "pending",
      notes: "Inquiry created via manual entry template",
      contactEmail: currentUser?.email || "string",
      contactPhone: 'string',
      isDraft: false,
      user: `${environment.apiBaseUrl}${environment.apiPath}/users/${userId}`,
      machines: machineEntries
    };
  }

  /**
   * Create machine entry for inquiry - Updated for new structure
   */
  private createMachineEntry(machine: Machine, parts: Part[]) {
    // Handle "Other" machines differently
    if (this.isOtherMachineSelected && machine.id === 'other') {
      return {
        machine: this.parts[0].data?.machineId || 'Custom machine', // Custom machine identifier
        notes: `Inquiry for unlisted/custom machine: ${this.parts[0].data?.machineId}`,
        products: parts.flatMap(part => {
          const spreadsheetRows = part.spreadsheetData?.filter(row =>
            row.quantity || row.partNumber || row.partName
          ) || [];

          if (spreadsheetRows.length > 0) {
            return spreadsheetRows.map(row => ({
              partName: row.partName || '',
              partNumber: row.partNumber || '',
              quantity: row.quantity || '',
              shortDescription: row.quantity ? `${row.quantity} pieces of ${row.partNumber || ''}` : '',
              additionalNotes: row.partName || '',
              mediaItems: part.files
                .filter(file => file.status === 'success' && file.mediaItem)
                .map(file => '/api/v1/media_items/' + file.mediaItem!.id)
            }));
          } else if (part.files.some(file => file.status === 'success')) {
            return [{
              partName: '',
              partNumber: '',
              quantity: '',
              shortDescription: '',
              additionalNotes: '',
              mediaItems: part.files
                .filter(file => file.status === 'success' && file.mediaItem)
                .map(file => '/api/v1/media_items/' + file.mediaItem!.id)
            }];
          }

          return [];
        })
      };
    }

    // Regular machine entry
    return {
      machine: `${environment.apiBaseUrl}${environment.apiPath}/machines/${machine.id}`,
      notes: "string",
      products: parts.flatMap(part => {
        const spreadsheetRows = part.spreadsheetData?.filter(row =>
          row.quantity || row.partNumber || row.partName
        ) || [];

        if (spreadsheetRows.length > 0) {
          return spreadsheetRows.map(row => ({
            partName: row.partName || '',
            partNumber: row.partNumber || '',
            quantity: row.quantity || '',
            shortDescription: row.quantity ? `${row.quantity} pieces of ${row.partNumber || ''}` : '',
            additionalNotes: row.partName || '',
            mediaItems: part.files
              .filter(file => file.status === 'success' && file.mediaItem)
              .map(file => '/api/v1/media_items/' + file.mediaItem!.id)
          }));
        } else if (part.files.some(file => file.status === 'success')) {
          return [{
            partName: '',
            partNumber: '',
            quantity: '',
            shortDescription: '',
            additionalNotes: '',
            mediaItems: part.files
              .filter(file => file.status === 'success' && file.mediaItem)
              .map(file => '/api/v1/media_items/' + file.mediaItem!.id)
          }];
        }

        return [];
      })
    };
  }

  /**
   * Check if parts have valid data - Updated for new structure
   */
  private hasValidPartsData(parts: Part[]): boolean {
    return parts.some(part => {
      const hasValidSpreadsheetData = part.spreadsheetData?.some(row =>
        row.quantity || row.partNumber || row.partName
      ) || false;

      const hasSuccessfulUpload = part.files.some(file => file.status === 'success');

      return hasValidSpreadsheetData || hasSuccessfulUpload;
    });
  }

  // Image editing
  saveEditedImage(dataUrl: string): void {
    if (!this.previewImageSrc) return;

    for (const part of this.parts) {
      const fileIndex = part.files.findIndex(f => f.previewUrl === this.previewImageSrc);
      if (fileIndex !== -1) {
        const blob = this.dataURLToBlob(dataUrl);
        const editedFile = new File([blob], part.files[fileIndex].name, {
          type: part.files[fileIndex].type
        });

        const updatedFile = { ...part.files[fileIndex] };
        updatedFile.file = editedFile;

        if (updatedFile.previewUrl) {
          URL.revokeObjectURL(updatedFile.previewUrl);
        }
        updatedFile.previewUrl = URL.createObjectURL(editedFile);

        const newFiles = [...part.files];
        newFiles[fileIndex] = updatedFile;

        this.onFilesChanged(newFiles, this.parts.indexOf(part));
        this.previewImageSrc = updatedFile.previewUrl;
        break;
      }
    }
  }

  private dataURLToBlob(dataURL: string): Blob {
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

  // Utility methods
  getTotalPartsCount(): number {
    let count = 0;

    count += this.parts.filter(part => this.hasValidPartsData([part])).length;

    this.machinePartsMap.forEach((parts, machineId) => {
      if (machineId !== this.selectedMachine?.id) {
        count += parts.filter(part => this.hasValidPartsData([part])).length;
      }
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
}
