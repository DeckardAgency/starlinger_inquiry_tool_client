import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-card-shimmer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="product-card shimmer-container">
      <div class="product-card__image shimmer-effect"></div>

      <div class="product-card__specs">
        <div class="product-card__spec shimmer-effect" *ngFor="let i of [1,2,3]"></div>
      </div>

      <div class="product-card__title shimmer-effect"></div>
      <div class="product-card__description shimmer-effect"></div>
      <div class="product-card__price shimmer-effect"></div>

      <div class="product-card__details">
        <div class="product-card__detail shimmer-effect" *ngFor="let i of [1,2]"></div>
      </div>

      <div class="product-card__actions">
        <div class="product-card__quantity shimmer-effect"></div>
        <div class="product-card__add-btn shimmer-effect"></div>
      </div>
    </div>
  `,
  styles: [`
    .shimmer-container .shimmer-effect {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 4px;
    }

    .product-card__image.shimmer-effect {
      height: 250px;
      width: 100%;
      margin-bottom: 24px;
      border-radius: 8px;
    }

    .product-card__spec.shimmer-effect {
      height: 40px;
      width: 100%;
    }

    .product-card__title.shimmer-effect {
      height: 32px;
      width: 80%;
      margin-bottom: 12px;
    }

    .product-card__description.shimmer-effect {
      height: 60px;
      width: 100%;
      margin-bottom: 24px;
    }

    .product-card__price.shimmer-effect {
      height: 32px;
      width: 40%;
      margin-bottom: 24px;
    }

    .product-card__detail.shimmer-effect {
      height: 50px;
      width: 100%;
    }

    .product-card__quantity.shimmer-effect {
      height: 42px;
      width: 120px;
    }

    .product-card__add-btn.shimmer-effect {
      height: 42px;
      width: 150px;
    }

    @keyframes shimmer {
      0% {
        background-position: -200% 0;
      }
      100% {
        background-position: 200% 0;
      }
    }
  `]
})
export class ProductCardShimmerComponent {}
