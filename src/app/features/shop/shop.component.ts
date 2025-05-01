import { Component, OnInit, HostListener } from '@angular/core';
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
import { Machine } from '@models/machine-type.model';
import { IconComponent } from '@shared/components/icon/icon.component';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    BreadcrumbsComponent,
    ProductCardComponent,
    ArticleItemComponent,
    IconComponent
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

  searchControl = new FormControl('');
  discountedControl = new FormControl(false);
  quantityControl = new FormControl(1);

  machines: Machine[] = [
    { id: '1', name: '200XE Winding Machine', checked: false },
    { id: '2', name: 'starEX Machine', checked: false },
    { id: '3', name: 'ad*starKON Machine', checked: false },
    { id: '4', name: 'Alpha 6.0 Machine', checked: false },
    { id: '5', name: 'starEX 1600 ES Machine', checked: false }
  ];
  isFilterOpen = false;
  activeFilters: string[] = [];
  breadcrumbs: Breadcrumb[] = [
    { label: 'Shop', link: '/shop' },
    { label: 'All machines', link: '/shop/machines' }
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

    // Get client name if available
    const clientInfo = this.authService.getClientInfo();
    if (clientInfo) {
      this.clientName = clientInfo.name;

      // Update breadcrumbs with client name
      this.breadcrumbs = [
        { label: 'Shop', link: '/shop' },
        { label: `${this.clientName} Products`, link: '/shop/machines' }
      ];
    }
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  private loadProducts(): void {
    this.loading = true;

    // Check if user has a client
    if (this.authService.hasClient()) {
      const clientId = this.authService.getCurrentUser()?.client?.id;
      if (clientId) {
        console.log('Client found. Loading client products for client ID:', clientId);

        // Load client-specific products
        this.productService.getProductsByClientId(clientId).subscribe({
          next: (response) => {
            console.log('Product response received:', response);
            this.products = response.member;
            this.totalItems = response.totalItems;
            this.filteredProducts = this.products;
            this.loading = false;
          },
          error: (err) => {
            this.error = 'Failed to load products. Please try again later.';
            this.loading = false;
            console.error('Error loading client products:', err);
          }
        });
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

  /**
   * Get the effective price to display for a product
   * @param product The product
   * @returns The price to display
   */
  getProductPrice(product: Product): number {
    // First check if effectivePrice is available (new model)
    if (product.effectivePrice !== undefined) {
      return product.effectivePrice;
    }

    // Fallback to clientPrice if available
    if (product.clientPrice !== undefined) {
      return product.clientPrice;
    }

    // Fallback to regularPrice if available
    if (product.regularPrice !== undefined) {
      return product.regularPrice;
    }

    // Last resort: use legacy price field or return 0
    return product.price || 0;
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

  /**
   * Get the discount percentage for a product
   * @param product The product
   * @returns The discount percentage or 0 if no discount
   */
  getDiscountPercentage(product: Product): number {
    // If discountPercentage is explicitly set
    if (product.discountPercentage !== undefined && product.discountPercentage !== null) {
      return product.discountPercentage;
    }

    // Calculate discount if regularPrice and clientPrice are available
    if (product.regularPrice !== undefined && product.clientPrice !== undefined && product.regularPrice > 0) {
      return Math.round((1 - product.clientPrice / product.regularPrice) * 100);
    }

    return 0;
  }

  selectProduct(product: Product): void {
    this.selectedProduct = product;
    if (product) {
      // Update breadcrumbs with client name if available
      if (this.clientName) {
        this.breadcrumbs = [
          { label: 'Shop', link: '/shop' },
          { label: `${this.clientName} Products`, link: '/shop/machines' },
          { label: product.name }
        ];
      } else {
        this.breadcrumbs = [
          { label: 'Shop', link: '/shop' },
          { label: 'All machines', link: '/shop/machines' },
          { label: product.name }
        ];
      }

      this.relatedProducts = this.products
        .filter(p => p.id !== product.id)
        .slice(0, 6);

      // Reset quantity when selecting a new product
      this.quantityControl.setValue(1);
    }
  }

  closeDetails(): void {
    this.selectedProduct = null;

    // Reset breadcrumbs with client name if available
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

    this.filterProducts();
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

  toggleMachine(machine: Machine): void {
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

  // Add selected product to cart from the detail view
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
    let filtered = this.products;

    const searchTerm = this.searchControl.value?.toLowerCase();
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.partNo.toLowerCase().includes(searchTerm) ||
        product.name.toLowerCase().includes(searchTerm)
      );
    }

    // Use activeFilters for machine filtering
    if (this.activeFilters.length > 0) {
      // Check if "200XE Winding Machine" is selected
      if (this.activeFilters.includes('200XE Winding Machine')) {
        // Create demo products array
        const demoProducts = [
          {
            id: '1',
            name: 'Power Control 200XE',
            partNo: 'PC-200XE-001',
            clientPrice: 599.99,
            effectivePrice: 599.99,
            shortDescription: 'Power control unit for 200XE Winding Machine',
            technicalDescription: '24V DC, 500W, IP65'
          },
          {
            id: '2',
            name: 'Sensor Module 200XE',
            partNo: 'SM-200XE-002',
            clientPrice: 299.99,
            effectivePrice: 299.99,
            shortDescription: 'High-precision sensor module for 200XE',
            technicalDescription: 'Accuracy ±0.01mm, Response time 1ms'
          },
          {
            id: '3',
            name: 'Control Panel 200XE',
            partNo: 'CP-200XE-003',
            clientPrice: 449.99,
            effectivePrice: 449.99,
            shortDescription: 'Touch control panel for 200XE series',
            technicalDescription: '7" TFT, IP54, Multi-touch'
          }
        ] as Product[];

        filtered = demoProducts;
      } else {
        filtered = filtered.filter(product =>
          this.activeFilters.some(filter => product.name.includes(filter))
        );
      }
    }

    if (this.discountedControl.value) {
      // Filter products with discounts
      filtered = filtered.filter(product => this.hasDiscount(product));
    }

    this.filteredProducts = filtered;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const filterElement = document.querySelector('.shop__machine-filter');
    if (!filterElement?.contains(event.target as Node)) {
      this.isFilterOpen = false;
    }
  }
}
