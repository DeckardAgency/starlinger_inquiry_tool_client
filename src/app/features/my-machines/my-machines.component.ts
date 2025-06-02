import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { BreadcrumbsComponent } from '@shared/components/ui/breadcrumbs/breadcrumbs.component';
import { MachineArticleItemComponent } from '@shared/components/machine/machine-article-item/machine-article-item.component';
import { MachineArticleItemShimmerComponent } from '@shared/components/machine/machine-article-item/machine-article-item-shimmer.component';
import { IconComponent } from '@shared/components/icon/icon.component';

import { MachineService } from '@services/http/machine.service';
import { AuthService } from '@core/auth/auth.service';
import { Machine } from '@core/models/machine.model';
import { Breadcrumb } from '@core/models';

@Component({
  selector: 'app-my-machines',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    BreadcrumbsComponent,
    MachineArticleItemComponent,
    MachineArticleItemShimmerComponent,
    IconComponent
  ],
  templateUrl: './my-machines.component.html',
  styleUrls: ['./my-machines.component.scss']
})
export class MyMachinesComponent implements OnInit {
  // Machine data
  machines: Machine[] = [];
  filteredMachines: Machine[] = [];
  loading = true;
  error: string | null = null;
  totalItems = 0;

  // Search control
  searchControl = new FormControl('');

  // View mode
  viewMode: 'grid' | 'list' = 'list';

  // Breadcrumbs
  breadcrumbs: Breadcrumb[] = [
    { label: 'Dashboard', link: '/dashboard' },
    { label: 'My Machines' }
  ];

  constructor(
    private machineService: MachineService,
    private authService: AuthService
  ) {
    // Setup search with debounce
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => this.filterMachines());
  }

  ngOnInit(): void {
    this.loadMachines();
  }

  private loadMachines(): void {
    this.loading = true;
    this.error = null;

    // Get current user
    const currentUser = this.authService.getCurrentUser();

    if (currentUser?.client?.id) {
      // Load machines for the user's client
      this.machineService.getMachinesByClientId(currentUser.client.id).subscribe({
        next: (response) => {
          this.machines = response.member;
          this.totalItems = response.totalItems;
          this.filteredMachines = [...this.machines];
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load machines. Please try again later.';
          this.loading = false;
          console.error('Error loading machines:', err);
        }
      });
    } else {
      // No client associated with user, load all machines
      this.machineService.getMachines().subscribe({
        next: (response) => {
          this.machines = response.member;
          this.totalItems = response.totalItems;
          this.filteredMachines = [...this.machines];
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load machines. Please try again later.';
          this.loading = false;
          console.error('Error loading machines:', err);
        }
      });
    }
  }

  private filterMachines(): void {
    const searchTerm = this.searchControl.value?.toLowerCase() || '';

    if (!searchTerm) {
      this.filteredMachines = [...this.machines];
      return;
    }

    this.filteredMachines = this.machines.filter(machine =>
      machine.articleDescription.toLowerCase().includes(searchTerm) ||
      machine.articleNumber.toLowerCase().includes(searchTerm) ||
      machine.ibSerialNumber?.toString().includes(searchTerm) ||
      machine.ibStationNumber?.toString().includes(searchTerm) ||
      machine.mcNumber?.toLowerCase().includes(searchTerm) ||
      machine.kmsIdentificationNumber?.toLowerCase().includes(searchTerm)
    );
  }

  toggleViewMode(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
  }

  onMachineSelected(machine: Machine): void {
    // Navigate to machine detail or perform other action
    console.log('Machine selected:', machine);
    // You can add navigation logic here
    // this.router.navigate(['/machines', machine.id]);
  }

  clearSearch(): void {
    this.searchControl.setValue('');
  }

  refreshMachines(): void {
    this.loadMachines();
  }
}
