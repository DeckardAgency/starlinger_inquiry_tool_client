import { Component, Input, OnInit, OnChanges, SimpleChanges, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuickCartService } from '@services/cart/quick-cart.service';
import { Product } from '@core/models';
import { environment } from '@env/environment';
import { SlickCarouselModule, SlickCarouselComponent } from 'ngx-slick-carousel';
import {IconComponent} from '@shared/components/icon/icon.component';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, FormsModule, SlickCarouselModule, IconComponent],
  styleUrls: ['./product-card.component.scss'],
  templateUrl: './product-card.component.html',
})
export class ProductCardComponent implements OnInit, OnChanges, AfterViewInit {
  environment = environment;
  @Input() product!: Product;
  quantity: number = 1;

  // Reference to the carousel component
  @ViewChild('slickModal') slickModal!: SlickCarouselComponent;
  private productChanged = false;

  // Slick Carousel Configuration
  slideConfig = {
    "slidesToShow": 1,
    "slidesToScroll": 1,
    "arrows": false,
    "dots": false,
    "infinite": false,
    "autoplay": false
  };

  constructor(private quickCartService: QuickCartService) {}

  ngOnInit() {
    // Validate product data
    if (!this.product) {
      console.error('Product data is required for ProductCardComponent');
    }

    // Initialize imageGallery if it's undefined
    if (!this.product.imageGallery) {
      this.product.imageGallery = [];
    }
  }

  ngAfterViewInit() {
    // If product changed and view is initialized, reset the carousel
    if (this.productChanged && this.slickModal) {
      this.slickModal.slickGoTo(0);
      this.productChanged = false;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['product'] && !changes['product'].firstChange) {
      this.productChanged = true;

      // If view is already initialized, reset the carousel immediately
      if (this.slickModal) {
        this.slickModal.slickGoTo(0);
        this.productChanged = false;
      }
    }
  }

  /**
   * Check if product has any images (featured or gallery)
   * @returns boolean indicating if there are any images to display
   */
  hasImages(): boolean {
    return (
      (this.product.featuredImage !== null && this.product.featuredImage !== undefined) ||
      (this.product.imageGallery && this.product.imageGallery.length > 0)
    );
  }

  next() {
    this.slickModal.slickNext();
  }

  prev() {
    this.slickModal.slickPrev();
  }

  // Quantity Methods
  incrementQuantity(): void {
    this.quantity++;
  }

  decrementQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  updateQuantity(value: number): void {
    this.quantity = Math.max(1, value);
  }

  formatPrice(price: number): string {
    return price.toLocaleString('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  // Method to add the product to the cart
  addToCart(): void {
    if (this.product) {
      this.quickCartService.addToCart(this.product, this.quantity);
      // Reset quantity after adding to the cart
      this.quantity = 1;
    }
  }
}
