// draft-order-table.component.ts
import { Component, Input, OnInit, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DraftOrderTableItem {
  id?: string | number; // Unique identifier
  dateCreated: string;
  type: 'Order' | 'Inquiry';
  referenceNumber: string;
  customer: {
    initials: string;
    name: string;
    avatar?: string;
  };
  status: 'Draft';
  showMenu?: boolean;
}

export interface OrderAction {
  type: 'edit' | 'delete';
  item: DraftOrderTableItem;
}

@Component({
    selector: 'app-draft-order-table',
    imports: [CommonModule],
    templateUrl: './draft-order-table.component.html',
    styleUrls: ['./draft-order-table.component.scss']
})
export class DraftOrderTableComponent implements OnInit {
  @Input() items: DraftOrderTableItem[] = [];
  @Input() loading: boolean = false;
  @Output() actionSelected = new EventEmitter<OrderAction>();

  // Array for shimmer rows (between 5-8 rows as requested)
  shimmerRows = Array(6).fill(0); // Default to 6 rows, adjust as needed

  sortDirection: 'asc' | 'desc' = 'desc'; // Default newest first
  sortField: string = 'dateCreated';

  // Listen for clicks outside of the component to close menus
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // Check if click was inside the table
    if (!(event.target as HTMLElement).closest('.menu-container')) {
      this.closeAllMenus();
    }
  }

  constructor() {}

  ngOnInit(): void {
    // Initial sort by date (newest first)
    this.sortItems();

    // Randomize the number of shimmer rows between 5-8
    const rowCount = Math.floor(Math.random() * 4) + 5; // Random number between 5-8
    this.shimmerRows = Array(rowCount).fill(0);
  }

  sortItems(): void {
    this.items.sort((a, b) => {
      if (this.sortField === 'dateCreated') {
        // Convert DD-MM-YYYY to YYYY-MM-DD for proper date comparison
        const dateA = new Date(a.dateCreated.split('-').reverse().join('-'));
        const dateB = new Date(b.dateCreated.split('-').reverse().join('-'));

        return this.sortDirection === 'asc'
          ? dateA.getTime() - dateB.getTime()
          : dateB.getTime() - dateA.getTime();
      }
      return 0;
    });
  }

  sortByDate(): void {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.sortItems();
  }

  getTypeClass(type: string): string {
    return type.toLowerCase();
  }

  getStatusClass(): string {
    return 'draft';
  }

  getSortIconClass(): string {
    return this.sortDirection === 'asc' ? 'asc' : 'desc';
  }

  openMoreOptions(event: Event, item: DraftOrderTableItem): void {
    event.stopPropagation();

    // Close all other menus first
    this.items.forEach(i => {
      if (i !== item) {
        i.showMenu = false;
      }
    });

    // Toggle this menu
    item.showMenu = !item.showMenu;
  }

  handleAction(event: Event, item: DraftOrderTableItem, action: 'edit' | 'delete'): void {
    event.stopPropagation();

    // Close the menu
    item.showMenu = false;

    // Emit the action
    this.actionSelected.emit({ type: action, item });
  }

  closeAllMenus(): void {
    this.items.forEach(item => {
      item.showMenu = false;
    });
  }

  // Prevent event propagation
  stopPropagation(event: Event): void {
    event.stopPropagation();
  }

  // Track items by unique identifier or reference number
  trackByFn(index: number, item: DraftOrderTableItem): string | number {
    return item.id || item.referenceNumber || index;
  }
}
