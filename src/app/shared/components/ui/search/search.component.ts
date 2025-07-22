import { Component, OnInit, HostListener, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs';
import { SearchService, SearchResultItem, SearchResults } from '@core/services/search.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') searchInput!: ElementRef;

  searchQuery: string = '';
  showResults: boolean = false;
  minSearchLength: number = 2;
  searchPlaceholder: string = 'Search';
  isLoading: boolean = false;

  searchResults: SearchResultItem[] = [];
  activeIndex: number = 0;

  // Counts for different types
  machineCounts: number = 0;
  productCounts: number = 0;
  orderCounts: number = 0;

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private elementRef: ElementRef,
    private searchService: SearchService
  ) {
    this.setSearchPlaceholder();
  }

  ngOnInit(): void {
    // Set up debounced search
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (query.length < this.minSearchLength) {
          this.showResults = false;
          return [];
        }
        this.isLoading = true;
        return this.searchService.searchAll(query);
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (results: SearchResults) => {
        this.handleSearchResults(results);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.showResults = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Search functionality
  search(): void {
    this.searchSubject.next(this.searchQuery);
  }

  private handleSearchResults(results: SearchResults): void {
    // Combine all results
    this.searchResults = [
      ...results.machines,
      ...results.products,
      ...results.orders
    ];

    // Update counts
    this.machineCounts = results.totalMachines;
    this.productCounts = results.totalProducts;
    this.orderCounts = results.totalOrders;

    // Show results if we have any
    if (this.searchResults.length > 0) {
      this.showResults = true;
      this.activeIndex = 0;
    } else {
      this.showResults = false;
    }
  }

  selectResult(result: SearchResultItem): void {
    console.log('Selected:', result);
    this.showResults = false;
    this.searchQuery = '';

    // Navigate to the result
    this.router.navigate([result.route]);
  }

  selectByIndex(index: number): void {
    if (index >= 0 && index < this.searchResults.length) {
      this.selectResult(this.searchResults[index]);
    }
  }

  focusSearchInput(): void {
    if (this.searchInput?.nativeElement) {
      this.searchInput.nativeElement.focus();
    }
  }

  // Keyboard event handlers
  @HostListener('document:keydown', ['$event'])
  handleShortcut(event: KeyboardEvent) {
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      this.focusSearchInput();
    }
  }

  @HostListener('document:keydown.arrowup', ['$event'])
  handleArrowUp(event: KeyboardEvent) {
    if (!this.showResults || this.searchResults.length === 0) return;

    event.preventDefault();
    if (this.activeIndex > 0) {
      this.activeIndex--;
    }
  }

  @HostListener('document:keydown.arrowdown', ['$event'])
  handleArrowDown(event: KeyboardEvent) {
    if (!this.showResults || this.searchResults.length === 0) return;

    event.preventDefault();
    if (this.activeIndex < this.searchResults.length - 1) {
      this.activeIndex++;
    }
  }

  @HostListener('document:keydown.enter', ['$event'])
  handleEnterKey(event: KeyboardEvent) {
    if (!this.showResults || this.searchResults.length === 0) return;

    event.preventDefault();
    this.selectByIndex(this.activeIndex);
  }

  @HostListener('document:keydown.escape', ['$event'])
  handleEscapeKey(event: KeyboardEvent) {
    this.showResults = false;
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event) {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.showResults = false;
    }
  }

  // Helper methods
  getBadgeClass(type: string): string {
    switch(type) {
      case 'machine':
        return 'search__badge--machine';
      case 'product':
        return 'search__badge--file';
      case 'order':
        return 'search__badge--order';
      default:
        return '';
    }
  }

  private setSearchPlaceholder(): void {
    this.searchPlaceholder = "Search";
  }

  // Template helper to check if result is active
  isResultActive(index: number): boolean {
    return index === this.activeIndex;
  }
}
