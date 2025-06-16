import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { environment } from '@env/environment';
import { BreadcrumbsComponent } from '@shared/components/ui/breadcrumbs/breadcrumbs.component';
import { ProductCardComponent } from '@shared/components/product/product-card/product-card.component';
import { ArticleItemComponent } from '@shared/components/product/article-item/article-item.component';
import { ProductService } from '@services/http/product.service';
import { CartService } from '@services/cart/cart.service';
import { AuthService } from '@core/auth/auth.service';
import { Breadcrumb, Product } from '@core/models';
import { MachineType } from '@models/machine.model';
import { IconComponent } from '@shared/components/icon/icon.component';
import { ArticleItemShimmerComponent } from '@shared/components/product/article-item/article-item-shimmer.component';
import { ProductCardShimmerComponent } from '@shared/components/product/product-card/product-card-shimmer.component';

@Component({
  selector: 'app-shop',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    BreadcrumbsComponent,
    ProductCardComponent,
    ArticleItemComponent,
    IconComponent,
    ArticleItemShimmerComponent,
    ProductCardShimmerComponent,
  ],
  templateUrl: 'shop.component.html',
  styleUrls: ['shop.component.scss']
})
export class ShopComponent implements OnInit {
  environment = environment;
  products: Product[] = [];
  filteredProducts: Product[] = [];
  selectedProduct: Product | null = null;
  relatedProducts: Product[] = [];
  loading = true;
  error: string | null = null;
  viewMode: 'grid' | 'list' = 'list';
  totalItems = 0;
  clientName: string = '';
  isProductDetailsLoading = false;
  isListProductDetailsLoading = false;

  searchControl = new FormControl('');
  discountedControl = new FormControl(false);
  quantityControl = new FormControl(1);

  machines: MachineType[] = [];
  isFilterOpen = false;
  activeFilters: string[] = [];
  breadcrumbs: Breadcrumb[] = [
    { label: 'Shop' },
    { label: 'All Parts', link: '/shop' },
  ];

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService
  ) {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => this.filterProducts());

    this.discountedControl.valueChanges.subscribe(() => this.filterProducts());

    // Get the client name if available
    const clientInfo = this.authService.getClientInfo();
    if (clientInfo) {
      this.clientName = clientInfo.name;

      // Update breadcrumbs with the client name
      this.breadcrumbs = [
        { label: 'Shop' },
        { label: 'All Parts', link: '/shop' },
      ];
    }
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  private loadInitialProducts(): void {
    this.loading = true;

    // Check if a user has a client
    if (this.authService.hasClient()) {
      const clientId = this.authService.getCurrentUser()?.client?.id;
      if (clientId) {
        console.log('Loading initial client products for client ID:', clientId);
        this.loadClientProducts(clientId, []); // Load without any machine filters
      } else {
        this.error = 'Client ID is missing. Please contact support.';
        this.loading = false;
      }
    } else {
      // Load all products (no client filter)
      console.log('Loading initial products (no client).');
      this.productService.getProducts().subscribe({
        next: (response) => {
          console.log('Initial product response received:', response);
          this.products = response.member;
          this.totalItems = response.totalItems;
          this.filteredProducts = this.products;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load products. Please try again later.';
          this.loading = false;
          console.error('Error loading initial products:', err);
        }
      });
    }
  }

  private loadProducts(): void {
    this.loading = true;
    this.totalItems = 0;

    // Check if a user has a client
    if (this.authService.hasClient()) {
      const clientId = this.authService.getCurrentUser()?.client?.id;
      if (clientId) {
        console.log('Client found. Loading client products for client ID:', clientId);
        this.loadClientProducts(clientId);
      } else {
        this.error = 'Client ID is missing. Please contact support.';
        this.loading = false;
      }
    } else {
      // Load all products (no client filter)
      console.log('No client found. Loading all products.');
      this.productService.getProducts().subscribe({
        next: (response) => {
          console.log('Product response received:', response);
          this.products = response.member;
          this.totalItems = response.totalItems;
          this.filteredProducts = this.products;
          this.extractMachinesFromProducts(this.products);
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load products. Please try again later.';
          this.loading = false;
          console.error('Error loading products:', err);
        }
      });
    }
  }

  private loadClientProducts(clientId: string, machineFilters: string[] = []): void {
    // Build query parameters for machine filtering
    const params: any = {};
    if (machineFilters.length > 0) {
      // Create multiple machine filter parameters
      machineFilters.forEach(machineDescription => {
        if (!params['machines.articleDescription']) {
          params['machines.articleDescription'] = [];
        }
        params['machines.articleDescription'].push(machineDescription);
      });
    }

    this.productService.getProductsByClientIdWithFilters(clientId, params).subscribe({
      next: (response) => {
        console.log('Product response received:', response);
        this.products = response.member;
        this.totalItems = response.totalItems;

        // Apply local search filtering after getting API results
        this.applyLocalFilters();

        // Only extract machines on initial load (when no filters are applied)
        if (machineFilters.length === 0) {
          this.extractMachinesFromProducts(this.products);
        }

        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load products. Please try again later.';
        this.loading = false;
        console.error('Error loading client products:', err);
      }
    });
  }

  private extractMachinesFromProducts(products: Product[]): void {
    const machineMap = new Map<string, MachineType>();

    products.forEach(product => {
      if (product.machines && Array.isArray(product.machines)) {
        product.machines.forEach(machine => {
          if (machine.articleDescription && !machineMap.has(machine.articleDescription)) {
            machineMap.set(machine.articleDescription, {
              id: machine.id,
              name: machine.articleDescription,
              checked: false
            });
          }
        });
      }
    });

    this.machines = Array.from(machineMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    console.log('Extracted machines:', this.machines);
  }

  /**
   * Check if a product has a discount
   * @param product The product
   * @returns True if the product has a discount
   */
  hasDiscount(product: Product): boolean {
    // If discountPercentage is explicitly set and not null
    if (product.discountPercentage !== undefined && product.discountPercentage !== null) {
      return true;
    }

    // If both regularPrice and clientPrice are available and different
    if (product.regularPrice !== undefined && product.clientPrice !== undefined) {
      return product.regularPrice > product.clientPrice && product.regularPrice > 0;
    }

    return false;
  }

  selectProduct(product: Product): void {
    this.selectedProduct = product;

    if (this.viewMode === 'grid') {
      this.isProductDetailsLoading = true;
    } else {
      this.isListProductDetailsLoading = true;
    }

    if (product) {
      // Update breadcrumbs with the client name if available
      if (this.clientName) {
        this.breadcrumbs = [
          { label: 'Shop', link: '/shop' },
          { label: 'All Parts', link: '/shop' },
          { label: product.name }
        ];
      } else {
        this.breadcrumbs = [
          { label: 'Shop', link: '/shop' },
          { label: 'All Parts', link: '/shop' },
          { label: product.name }
        ];
      }

      this.relatedProducts = this.products
        .filter(p => p.id !== product.id)
        .slice(0, 6);

      // Reset quantity when selecting a new product
      this.quantityControl.setValue(1);

      // Simulate loading time using setTimeout
      setTimeout(() => {
        if (this.viewMode === 'grid') {
          this.isProductDetailsLoading = false;
        } else {
          this.isListProductDetailsLoading = false;
        }
      }, 300);
    }
  }

  closeDetails(): void {
    this.selectedProduct = null;

    // Reset breadcrumbs with the client name if available
    if (this.clientName) {
      this.breadcrumbs = [
        { label: 'Shop', link: '/shop' },
        { label: `${this.clientName} Products`, link: '/shop/machines' }
      ];
    } else {
      this.breadcrumbs = [
        { label: 'Shop', link: '/shop' },
        { label: 'All machines', link: '/shop/machines' }
      ];
    }
  }

  removeFilter(filter: string): void {
    // Remove from activeFilters
    this.activeFilters = this.activeFilters.filter(f => f !== filter);

    // Update machine checked state
    const machine = this.machines.find(m => m.name === filter);
    if (machine) {
      machine.checked = false;
    }

    // If no active filters remain, reload initial products
    if (this.activeFilters.length === 0) {
      this.loadInitialProducts();
    } else {
      this.filterProducts();
    }
  }

  incrementQuantity(): void {
    this.quantityControl.setValue(this.quantityControl.value! + 1);
  }

  decrementQuantity(): void {
    if (this.quantityControl.value! > 1) {
      this.quantityControl.setValue(this.quantityControl.value! - 1);
    }
  }

  toggleFilter(): void {
    this.isFilterOpen = !this.isFilterOpen;
  }

  toggleMachine(machine: MachineType): void {
    machine.checked = !machine.checked;

    if (machine.checked) {
      // Add to activeFilters if not already present
      if (!this.activeFilters.includes(machine.name)) {
        this.activeFilters.push(machine.name);
      }
    } else {
      // Remove from activeFilters
      this.activeFilters = this.activeFilters.filter(filter => filter !== machine.name);
    }

    this.filterProducts();
  }

  addSelectedProductToCart(): void {
    if (this.selectedProduct) {
      const quantity = this.quantityControl.value || 1;

      // Using cartService will now show notification instead of directly opening the cart
      this.cartService.addToCart(this.selectedProduct, quantity);

      // Reset quantity after adding to cart
      this.quantityControl.setValue(1);
    }
  }

  private filterProducts(): void {
    // If we have machine filters and this is a client, use API filtering
    if (this.activeFilters.length > 0 && this.authService.hasClient()) {
      this.loading = true;
      const clientId = this.authService.getCurrentUser()?.client?.id;
      if (clientId) {
        this.loadClientProducts(clientId, this.activeFilters);
      }
      return;
    }

    // Local filtering for search and discount
    let filtered = this.products;

    const searchTerm = this.searchControl.value?.toLowerCase();
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.partNo.toLowerCase().includes(searchTerm) ||
        product.name.toLowerCase().includes(searchTerm)
      );
    }

    if (this.discountedControl.value) {
      // Filter products with discounts
      filtered = filtered.filter(product => this.hasDiscount(product));
    }

    this.filteredProducts = filtered;
  }

  private applyLocalFilters(): void {
    let filtered = this.products;

    const searchTerm = this.searchControl.value?.toLowerCase();
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.partNo.toLowerCase().includes(searchTerm) ||
        product.name.toLowerCase().includes(searchTerm)
      );
    }

    if (this.discountedControl.value) {
      // Filter products with discounts
      filtered = filtered.filter(product => this.hasDiscount(product));
    }

    this.filteredProducts = filtered;
  }
  onDocumentClick(event: MouseEvent): void {
    const filterElement = document.querySelector('.shop__machine-filter');
    if (!filterElement?.contains(event.target as Node)) {
      this.isFilterOpen = false;
    }
  }
}
