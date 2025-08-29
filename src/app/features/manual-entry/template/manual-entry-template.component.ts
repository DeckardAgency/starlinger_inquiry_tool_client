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
import { SpreadsheetRow } from '@shared/components/spreadsheet/spreadsheet.interface';
import { Part } from '@models/part.mode';
import { environment } from '@env/environment';

// Define MachineType interface if not imported
interface MachineType {
  id: string;
  name: string;
  checked: boolean;
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
export class ManualEntryTemplateComponent implements OnInit, AfterViewInit, OnDestroy {
  // Machine data properties
  machines: Machine[] = [];
  filteredMachines: Machine[] = [];
  selectedMachine: Machine | null = null;
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

  /**
   * Apply local filters (machine types) to the search results
   */
  private applyLocalFilters(): void {
    let filtered = this.machines;

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
   * Load initial machines
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

  // Part management methods
  addPart(): void {
    const newPart: Part = {
      id: this.generateUniqueId(),
      files: [],
      spreadsheetData: []
    };

    this.parts.push(newPart);

    if (this.selectedMachine) {
      this.machinePartsMap.set(this.selectedMachine.id, [...this.parts]);
    }
  }

  private generateUniqueId(): string {
    return 'part_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
  }

  // Machine selection
  selectMachine(machine: Machine): void {
    // Save current parts state
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

      // Restore saved parts or initialize new
      if (this.machinePartsMap.has(machine.id)) {
        this.parts = [...this.machinePartsMap.get(machine.id)!];
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
    this.breadcrumbs = [
      { label: 'Dashboard', link: '/dashboard' },
      { label: 'Manual Entry', link: '/manual-entry' }
    ];
  }

  // Filter methods
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

  // Search methods
  clearSearch(): void {
    this.searchControl.setValue('');
  }

  onSearchFocus(): void {
    // Optional: Add focus behavior
  }

  onSearchBlur(): void {
    // Optional: Add blur behavior
  }

  // Spreadsheet data handler
  onSpreadsheetDataChanged(data: SpreadsheetRow[], partIndex: number): void {
    console.log('Spreadsheet data changed for part', partIndex, ':', data);

    if (partIndex >= 0 && partIndex < this.parts.length) {
      this.parts[partIndex].spreadsheetData = data;

      if (this.selectedMachine) {
        this.machinePartsMap.set(this.selectedMachine.id, [...this.parts]);
      }
    }
  }

  // File handlers
  onFilesChanged(files: UploadedFile[], partIndex: number): void {
    if (partIndex >= 0 && partIndex < this.parts.length) {
      this.parts[partIndex].files = files;

      if (this.selectedMachine) {
        this.machinePartsMap.set(this.selectedMachine.id, [...this.parts]);
      }
    }
  }

  onFilePreviewRequested(file: UploadedFile): void {
    if (file.previewUrl) {
      this.previewImageSrc = file.previewUrl;
      this.previewImageAlt = file.name;
      this.previewImageFileName = file.name;
      this.showImagePreview = true;
    }
  }

  closeImagePreview(): void {
    this.showImagePreview = false;
  }

  // Validation methods
  isCurrentPartValid(): boolean {
    if (this.parts.length === 0) return false;

    const currentPart = this.parts[this.parts.length - 1];

    const hasValidSpreadsheetData = currentPart.spreadsheetData?.some(row =>
      row.productName || row.shortDescription || row.additionalNotes
    ) || false;

    const hasSuccessfulUpload = currentPart.files.some(file => file.status === 'success');

    return hasValidSpreadsheetData || hasSuccessfulUpload;
  }

  isFormValid(): boolean {
    return this.parts.some(part => {
      const hasValidSpreadsheetData = part.spreadsheetData?.some(row =>
        row.productName || row.shortDescription || row.additionalNotes
      ) || false;

      const hasSuccessfulUpload = part.files.some(file => file.status === 'success');

      return hasValidSpreadsheetData || hasSuccessfulUpload;
    });
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
   * Create cart items from parts
   */
  private createCartItemsFromParts(parts: Part[], machine: Machine): ManualCartItem[] {
    return parts.flatMap(part => {
      const spreadsheetRows = part.spreadsheetData?.filter(row =>
        row.productName || row.shortDescription || row.additionalNotes
      ) || [];

      if (spreadsheetRows.length > 0) {
        return spreadsheetRows.map(row => ({
          id: this.generateUniqueId(),
          machineId: machine.id,
          machineName: machine.articleDescription,
          partData: {
            partName: row.productName || '',
            partNumber: '',
            shortDescription: row.shortDescription || '',
            additionalNotes: row.additionalNotes || '',
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
   * Create machine entry for inquiry
   */
  private createMachineEntry(machine: Machine, parts: Part[]) {
    return {
      machine: `${environment.apiBaseUrl}${environment.apiPath}/machines/${machine.id}`,
      notes: "string",
      products: parts.flatMap(part => {
        const spreadsheetRows = part.spreadsheetData?.filter(row =>
          row.productName || row.shortDescription || row.additionalNotes
        ) || [];

        if (spreadsheetRows.length > 0) {
          return spreadsheetRows.map(row => ({
            partName: row.productName || '',
            partNumber: '',
            shortDescription: row.shortDescription || '',
            additionalNotes: row.additionalNotes || '',
            mediaItems: part.files
              .filter(file => file.status === 'success' && file.mediaItem)
              .map(file => '/api/v1/media_items/' + file.mediaItem!.id)
          }));
        } else if (part.files.some(file => file.status === 'success')) {
          return [{
            partName: '',
            partNumber: '',
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
   * Check if parts have valid data
   */
  private hasValidPartsData(parts: Part[]): boolean {
    return parts.some(part => {
      const hasValidSpreadsheetData = part.spreadsheetData?.some(row =>
        row.productName || row.shortDescription || row.additionalNotes
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
