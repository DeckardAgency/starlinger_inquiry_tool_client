// src/app/shop/shop.component.ts
import { Component, OnInit } from '@angular/core';
import {CommonModule} from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BreadcrumbsComponent, Breadcrumb } from '../components/breadcrumbs/breadcrumbs.component';
import { ProductService } from '../services/product.service';
import { Product } from '../interfaces/product.interface';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import {ProductCardComponent} from '../components/product-card/product-card.component';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, BreadcrumbsComponent, ProductCardComponent],
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.scss']
})
export class ShopComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  selectedProduct: Product | null = null;
  relatedProducts: Product[] = [];
  loading = true;
  error: string | null = null;
  viewMode: 'grid' | 'list' = 'list';
  totalItems = 0;

  searchControl = new FormControl('');
  discountedControl = new FormControl(false);
  quantityControl = new FormControl(1);

  activeFilters: string[] = [];
  breadcrumbs: Breadcrumb[] = [
    { label: 'Shop', link: '/shop' },
    { label: 'All machines', link: '/shop/machines' }
  ];

  constructor(private productService: ProductService) {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => this.filterProducts());

    this.discountedControl.valueChanges.subscribe(() => this.filterProducts());
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  private loadProducts(): void {
    this.loading = true;
    this.productService.getProducts().subscribe({
      next: (response) => {
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

  selectProduct(product: Product): void {
    this.selectedProduct = product;
    if (product) {
      // Update breadcrumbs
      this.breadcrumbs = [
        { label: 'Shop', link: '/shop' },
        { label: 'All machines', link: '/shop/machines' },
        { label: product.name }
      ];

      // Load related products (excluding current product)
      this.relatedProducts = this.products
        .filter(p => p.id !== product.id)
        .slice(0, 6); // Show only 6 related products
    }
  }

  closeDetails(): void {
    this.selectedProduct = null;
    this.breadcrumbs = [
      { label: 'Shop', link: '/shop' },
      { label: 'All machines', link: '/shop/machines' }
    ];
  }

  removeFilter(filter: string): void {
    this.activeFilters = this.activeFilters.filter(f => f !== filter);
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

  private filterProducts(): void {
    let filtered = this.products;

    const searchTerm = this.searchControl.value?.toLowerCase();
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.partNo.toLowerCase().includes(searchTerm) ||
        product.name.toLowerCase().includes(searchTerm)
      );
    }

    if (this.discountedControl.value) {
      filtered = filtered.filter(product => product.price > 0);
    }

    if (this.activeFilters.length > 0) {
      filtered = filtered.filter(product =>
        this.activeFilters.some(filter => product.name.includes(filter))
      );
    }

    this.filteredProducts = filtered;
  }
}
