import { Component, OnInit, HostListener, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

// Components
import { BreadcrumbsComponent } from '@shared/components/ui/breadcrumbs/breadcrumbs.component';
import { MachineArticleItemComponent } from '@shared/components/machine/machine-article-item/machine-article-item.component';
import { AdvancedImagePreviewModalComponent } from '@shared/components/modals/advanced-image-preview-modal/advanced-image-preview-modal.component';
import { MachineType } from '@models/machine-type.model';
import { MachineService } from '@services/http/machine.service';
import {ManualCartItem, UploadedFile} from '@models/manual-cart-item.model';
import { Breadcrumb } from '@core/models';
import { Machine } from '@core/models/machine.model';
import { MachineArticleItemShimmerComponent } from '@shared/components/machine/machine-article-item/machine-article-item-shimmer.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { environment } from '@env/environment';
import { AuthService } from '@core/auth/auth.service';
import { InquiryRequest, InquiryService } from '@services/http/inquiry.service';
import { SpreadsheetComponent } from '@shared/components/spreadsheet/spreadsheet.component';
import { SpreadsheetRow } from '@shared/components/spreadsheet/spreadsheet.interface';
import { Part } from '@models/part.mode';
import {FileUploadComponent} from '@shared/components/file-upload/file-upload.component';

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
    IconComponent,
    SpreadsheetComponent,
    FileUploadComponent
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

  // Method to handle spreadsheet data changes
  onSpreadsheetDataChanged(data: SpreadsheetRow[], partIndex: number): void {
    console.log('Spreadsheet data changed for part', partIndex, ':', data);
    console.log('Number of non-empty rows:', data.filter(row =>
      row.productName || row.shortDescription || row.additionalNotes
    ).length);

    if (partIndex >= 0 && partIndex < this.parts.length) {
      this.parts[partIndex].spreadsheetData = data;

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
    private authService: AuthService,
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
    // return this.parts.every(part => {
    //   return part.files.some(file => file.status === 'success');
    // });
    return true;
  }

  closeImagePreview(): void {
    this.showImagePreview = false;
  }

  onSubmit(): void {
    if (this.isFormValid() && this.selectedMachine) {

      console.log('parts', this.parts);
      // console.log('parts spreadsheetData', this.parts[0].spreadsheetData);

      // Map parts to ManualCartItems for the cart service
      const manualCartItems: ManualCartItem[] = this.parts.flatMap(part => {
        // Get all non-empty rows from spreadsheet data
        const spreadsheetRows = part.spreadsheetData?.filter(row =>
          row.productName || row.shortDescription || row.additionalNotes
        ) || [];

        if (spreadsheetRows.length > 0) {
          // Create a cart item for each spreadsheet row
          return spreadsheetRows.map(row => ({
            id: this.generateUniqueId(),
            machineId: this.selectedMachine!.id,
            machineName: this.selectedMachine!.articleDescription,
            // Only include successfully uploaded files
            files: part.files.filter(file => file.status === 'success'),
            // Include MediaItem references
            mediaItems: part.files
              .filter(file => file.status === 'success' && file.mediaItem)
              .map(file => file.mediaItem!),
            // Include spreadsheet data
            productName: row.productName,
            shortDescription: row.shortDescription,
            additionalNotes: row.additionalNotes
          } as unknown as ManualCartItem));
        } else {
          // No spreadsheet data, create single cart item
          return [{
            id: this.generateUniqueId(),
            machineId: this.selectedMachine!.id,
            machineName: this.selectedMachine!.articleDescription,
            // Only include successfully uploaded files
            files: part.files.filter(file => file.status === 'success'),
            // Include MediaItem references
            mediaItems: part.files
              .filter(file => file.status === 'success' && file.mediaItem)
              .map(file => file.mediaItem!)
          } as unknown as ManualCartItem];
        }
      });

      // Create an array for all machines in the submission
      const machineEntries = [];

      // Add the currently selected machine
      machineEntries.push({
        machine: `${environment.apiBaseUrl}${environment.apiPath}/machines/${this.selectedMachine.id}`,
        notes: "string",
        products: this.parts.flatMap(part => {
          // Get all non-empty spreadsheet rows
          const spreadsheetRows = part.spreadsheetData?.filter(row =>
            row.productName || row.shortDescription || row.additionalNotes
          ) || [];

          // If there are spreadsheet rows, create a product for each
          if (spreadsheetRows.length > 0) {
            return spreadsheetRows.map(row => ({
              partName: row.productName || '',
              partNumber: '', // Keep empty as requested
              shortDescription: row.shortDescription || '',
              additionalNotes: row.additionalNotes || '',
              mediaItems: part.files
                .filter(file => file.status === 'success' && file.mediaItem)
                .map(file => '/api/v1/media_items/' + file.mediaItem!.id)
            }));
          } else {
            // If no spreadsheet data, create one product with empty fields but with files
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
        })
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
            products: parts.map(part => {
              // Get the first row of spreadsheet data if available
              const spreadsheetRow = part.spreadsheetData && part.spreadsheetData.length > 0
                ? part.spreadsheetData[0]
                : null;

              return {
                // Map spreadsheet data to product fields
                partName: spreadsheetRow?.productName || '',
                partNumber: '', // Keep empty as requested
                shortDescription: spreadsheetRow?.shortDescription || '',
                additionalNotes: spreadsheetRow?.additionalNotes || '',

                mediaItems: part.files
                  .filter(file => file.status === 'success' && file.mediaItem)
                  .map(file => '/api/v1/media_items/' + file.mediaItem!.id)
              };
            })
          });
        }
      });

      // Get the current user ID from an auth service
      const currentUser = this.authService.getCurrentUser();
      const userId = currentUser?.id || 'current-user';

      // Add parts to the manual cart and open the inquiry overview
      //this.manualQuickCartService.addToCart(manualCartItems);

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
      // if (this.selectedMachine) {
      //   this.machinePartsMap.delete(this.selectedMachine.id);
      // }

      // Reset the form state but don't close details yet
      // this.parts = [];
      // this.addPart();
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

        // Update the file object
        const updatedFile = { ...part.files[fileIndex] };
        updatedFile.file = editedFile;

        // Create new preview URL
        if (updatedFile.previewUrl) {
          URL.revokeObjectURL(updatedFile.previewUrl);
        }
        updatedFile.previewUrl = URL.createObjectURL(editedFile);

        // Update the files array
        const newFiles = [...part.files];
        newFiles[fileIndex] = updatedFile;

        // Emit the change through the proper channel
        this.onFilesChanged(newFiles, this.parts.indexOf(part));

        // Update the preview src to the new URL
        this.previewImageSrc = updatedFile.previewUrl;
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

  onFilesChanged(files: UploadedFile[], partIndex: number): void {
    if (partIndex >= 0 && partIndex < this.parts.length) {
      this.parts[partIndex].files = files;

      // Update the stored parts for the selected machine
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
}
