import { Component, Input, OnInit, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuickCartService } from '@services/cart/quick-cart.service';
import { Product } from '@core/models';
import { environment } from '@env/environment';
import { CarouselComponent, CarouselImage } from '@shared/components/carousel/carousel.component';

@Component({
  selector: 'app-product-card',
  imports: [CommonModule, FormsModule, CarouselComponent],
  styleUrls: ['./product-card.component.scss'],
  templateUrl: './product-card.component.html'
})
export class ProductCardComponent implements OnInit, OnChanges, AfterViewInit {
  environment = environment;
  @Input() product!: Product;
  quantity: number = 1;
  carouselImages: CarouselImage[] = [];

  private productChanged = false;

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

    // Prepare carousel images
    this.prepareCarouselImages();
  }

  ngAfterViewInit() {

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['product'] && !changes['product'].firstChange) {
      this.productChanged = true;
      // Update carousel images when product changes
      this.prepareCarouselImages();
    }
  }

  /**
   * Prepare images for the carousel component
   */
  prepareCarouselImages(): void {
    this.carouselImages = [];

    // Add a featured image first if it exists
    if (this.product.featuredImage) {
      this.carouselImages.push({
        url: this.environment.apiBaseUrl + this.product.featuredImage.filePath,
        alt: this.product.name
      });
    }

    // Add gallery images
    if (this.product.imageGallery && this.product.imageGallery.length > 0) {
      this.product.imageGallery.forEach((image, index) => {
        this.carouselImages.push({
          url: this.environment.apiBaseUrl + image.filePath,
          alt: `${this.product.name} - Image ${index + 1}`
        });
      });
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

  /**
   * Check if carousel should be displayed (when there are multiple images)
   * @returns boolean indicating if carousel should be shown
   */
  shouldShowCarousel(): boolean {
    return this.carouselImages.length > 1;
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

  formatPrice(price: number | undefined): string {
    if (price === undefined || price === null) {
      return '0.00';
    }
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
