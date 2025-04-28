import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {QuickCartService} from '@services/cart/quick-cart.service';
import { environment } from '@env/environment';
import {Product} from '@core/models';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./product-card.component.scss'],
  templateUrl: './product-card.component.html',
})
export class ProductCardComponent implements OnInit {
  environment = environment;
  @Input() product!: Product;
  quantity: number = 1;

  // Carousel properties
  currentSlide: number = 0;
  carouselPosition: number = 0;
  slideWidth: number = 0;

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

  // Carousel Methods
  hasGalleryImages(): boolean {
    return this.product.featuredImage !== null ||
      (this.product.imageGallery && this.product.imageGallery.length > 0);
  }

  getTotalSlides(): number {
    // Count featuredImage (if exists) plus all gallery images
    let count = 0;
    if (this.product.featuredImage) {
      count++;
    }
    if (this.product.imageGallery) {
      count += this.product.imageGallery.length;
    }
    return count;
  }

  getTotalSlidesArray(): number[] {
    return Array(this.getTotalSlides()).fill(0);
  }

  goToSlide(slideIndex: number): void {
    this.currentSlide = slideIndex;
    this.updateCarouselPosition();
  }

  nextSlide(): void {
    if (this.currentSlide < this.getTotalSlides() - 1) {
      this.currentSlide++;
      this.updateCarouselPosition();
    }
  }

  prevSlide(): void {
    if (this.currentSlide > 0) {
      this.currentSlide--;
      this.updateCarouselPosition();
    }
  }

  updateCarouselPosition(): void {
    // Calculate position based on current slide
    this.carouselPosition = -100 * this.currentSlide;
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

  // Method to add the product to cart
  addToCart(): void {
    console.log('addToCart');
    if (this.product) {
      this.quickCartService.addToCart(this.product, this.quantity);
      // Reset quantity after adding to cart
      this.quantity = 1;
    }
  }
}
