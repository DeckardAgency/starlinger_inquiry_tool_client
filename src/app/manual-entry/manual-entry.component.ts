// src/app/manual-entry/manual-entry.component.ts
import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BreadcrumbsComponent, Breadcrumb } from '../components/breadcrumbs/breadcrumbs.component';
import { ProductService } from '../services/product.service';
import { Product } from '../interfaces/product.interface';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ArticleItemComponent } from '../components/article-item/article-item.component';

export interface MachineType {
  id: string;
  name: string;
  checked: boolean;
}

export interface UploadedFile {
  name: string;
  size: number;
  type: string;
  file: File;
  status: 'uploading' | 'success' | 'error';
  progress: number;
}

@Component({
  selector: 'app-manual-entry',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    BreadcrumbsComponent,
    ArticleItemComponent
  ],
  templateUrl: './manual-entry.component.html',
  styleUrls: ['./manual-entry.component.scss']
})
export class ManualEntryComponent implements OnInit {
  machines: Product[] = [];
  filteredMachines: Product[] = [];
  selectedMachine: Product | null = null;
  loading = true;
  error: string | null = null;
  totalItems = 0;

  // File upload properties
  uploadedFiles: UploadedFile[] = [];
  isDragging = false;
  maxFileSize = 5 * 1024 * 1024; // 5MB
  allowedFileTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'video/mp4'];

  @ViewChild('fileInputElement') fileInputElement!: ElementRef<HTMLInputElement>;

  searchControl = new FormControl('');

  // Form for adding a new part
  partForm = new FormGroup({
    partName: new FormControl('', Validators.required),
    partNumber: new FormControl(''),
    shortDescription: new FormControl('', Validators.required),
    additionalNotes: new FormControl('', Validators.required)
  });

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
    private productService: ProductService
  ) {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => this.filterMachines());
  }

  ngOnInit(): void {
    this.loadMachines();
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
    this.selectedMachine = machine;
    if (machine) {
      this.breadcrumbs = [
        { label: 'Dashboard', link: '/dashboard' },
        { label: 'Manual Entry', link: '/manual-entry' },
        { label: machine.name }
      ];

      // Reset form when selecting a new machine
      this.partForm.reset();
    }
  }

  closeDetails(): void {
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

  onSubmit(): void {
    if (this.partForm.valid && this.selectedMachine) {
      const newPart = {
        machineName: this.selectedMachine.name,
        machineId: this.selectedMachine.id,
        ...this.partForm.value
      };

      // Here you would typically save the new part to your service/backend
      console.log('New part added:', newPart);

      // Show success message or notification
      alert('Part added successfully!');

      // Reset form and close details
      this.partForm.reset();
      this.closeDetails();
    }
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
      // In a real app, you might have a machineType property to filter by
      filtered = filtered.filter(machine =>
        this.activeFilters.some(filter => machine.name.includes(filter))
      );
    }

    this.filteredMachines = filtered;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const filterElement = document.querySelector('.manual-entry__machine-filter');
    if (!filterElement?.contains(event.target as Node)) {
      this.isFilterOpen = false;
    }
  }

  // File upload methods
  triggerFileInput(): void {
    if (this.fileInputElement) {
      this.fileInputElement.nativeElement.click();
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(input.files);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (event.dataTransfer?.files) {
      this.handleFiles(event.dataTransfer.files);
    }
  }

  private handleFiles(fileList: FileList): void {
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

      this.uploadedFiles.push(uploadedFile);
      this.simulateUpload(uploadedFile);
    });
  }

  private isValidFileType(file: File): boolean {
    return this.allowedFileTypes.includes(file.type);
  }

  private simulateUpload(file: UploadedFile): void {
    // This is just a simulation - replace with actual upload logic
    const interval = setInterval(() => {
      file.progress += 10;

      if (file.progress >= 100) {
        clearInterval(interval);
        file.status = Math.random() > 0.8 ? 'error' : 'success'; // Randomly generate some errors
      }
    }, 300);
  }

  removeFile(file: UploadedFile): void {
    this.uploadedFiles = this.uploadedFiles.filter(f => f !== file);
  }

  cancelUpload(file: UploadedFile): void {
    // In a real app, you would cancel the actual upload request
    this.removeFile(file);
  }

  retryUpload(file: UploadedFile): void {
    file.status = 'uploading';
    file.progress = 0;
    this.simulateUpload(file);
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

  // Methods to check upload status
  hasSuccessfulUploads(): boolean {
    return this.uploadedFiles.some(file => file.status === 'success');
  }

  hasUploadsInProgress(): boolean {
    return this.uploadedFiles.some(file => file.status === 'uploading');
  }

  getSuccessfulUploadCount(): number {
    return this.uploadedFiles.filter(file => file.status === 'success').length;
  }
}
