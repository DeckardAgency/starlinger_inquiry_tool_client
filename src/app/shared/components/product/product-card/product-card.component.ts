import { Component, Input, OnInit, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuickCartService } from '@services/cart/quick-cart.service';
import { Product } from '@core/models';
import { environment } from '@env/environment';
import { SlickCarouselModule, SlickCarouselComponent } from 'ngx-slick-carousel';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, FormsModule, SlickCarouselModule],
  styleUrls: ['./product-card.component.scss'],
  templateUrl: './product-card.component.html',
})
export class ProductCardComponent implements OnInit, OnChanges {
  environment = environment;
  @Input() product!: Product;
  quantity: number = 1;

  // Reference to the carousel component
  @ViewChild('slickModal') slickModal!: SlickCarouselComponent;

  // Slick Carousel Configuration
  slideConfig = {
    "slidesToShow": 1,
    "slidesToScroll": 1,
    "arrows": true,
    "dots": true,
    "infinite": true,
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

    console.log(this.product.imageGallery);
  }

  ngOnChanges(changes: SimpleChanges) {
    // Check if the product input has changed
    if (changes['product'] && !changes['product'].firstChange) {
      // Reset the carousel to the first slide after a short delay to ensure DOM is updated
      setTimeout(() => {
        if (this.slickModal) {
          this.slickModal.slickGoTo(0);
          console.log('Carousel reset to first slide');
        }
      }, 0);
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

  // Manual method to reset the carousel to first slide
  resetCarousel(): void {
    if (this.slickModal) {
      this.slickModal.slickGoTo(0);
    }
  }

  // Slick Carousel Events
  slickInit() {
    console.log('slick initialized');
  }

  breakpoint() {
    console.log('breakpoint');
  }

  afterChange() {
    console.log('afterChange');
  }

  beforeChange() {
    console.log('beforeChange');
  }
}
