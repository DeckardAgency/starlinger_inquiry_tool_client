import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-quick-cart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="quick-cart"
      [class.quick-cart--open]="isOpen"
      (click)="$event.stopPropagation()"
    >
      <div class="quick-cart__header">
        <div class="quick-cart__title">
          <h2>Cart overview</h2>
          <span class="quick-cart__count">2</span>
        </div>
        <button class="quick-cart__close" (click)="onClose()">
          <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <div class="quick-cart__content">
        <div class="cart-item">
          <div class="cart-item__image">
            <img src="https://via.assets.so/img.jpg?w=80&h=80" alt="Product" />
          </div>
          <div class="cart-item__details">
            <div class="cart-item__info">
              <div class="cart-item__name">Power Panel T30 4,3" WQVGA Color Touch</div>
              <div class="cart-item__part-number">AIVV-01152</div>
            </div>
            <div class="cart-item__quantity">
              <button class="cart-item__qty-btn">-</button>
              <input type="text" class="cart-item__qty-input" value="2" />
              <button class="cart-item__qty-btn">+</button>
              <div class="cart-item__price">€ 1.390,42</div>
              <button class="cart-item__remove">
                <svg width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.5 5h15M6.667 5V3.333A1.667 1.667 0 0 1 8.333 1.667h3.334a1.667 1.667 0 0 1 1.666 1.666V5m2.5 0v11.667a1.667 1.667 0 0 1-1.666 1.666H5.833a1.667 1.667 0 0 1-1.666-1.666V5h11.666Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="quick-cart__footer">
        <div class="quick-cart__shipping">
          <span>Shipping & handling</span>
          <span>€ 49,00</span>
        </div>
        <div class="quick-cart__total">
          <span>Total</span>
          <span>€ 1.624,06</span>
        </div>
        <div class="quick-cart__actions">
          <button class="quick-cart__back">Back to product list</button>
          <button class="quick-cart__order">Place order</button>
        </div>
      </div>
    </div>

    <div
      class="quick-cart-overlay"
      [class.quick-cart-overlay--visible]="isOpen"
      (click)="onClose()"
    ></div>
  `,
  styles: [`
    .quick-cart-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s, visibility 0.3s;
      z-index: 998;

      &--visible {
        opacity: 1;
        visibility: visible;
      }
    }

    .quick-cart {
      position: fixed;
      top: 0;
      right: -480px;
      width: 480px;
      height: 100vh;
      background-color: white;
      box-shadow: -4px 0 16px rgba(0, 0, 0, 0.1);
      transition: right 0.3s ease;
      z-index: 999;
      display: flex;
      flex-direction: column;

      &--open {
        right: 0;
      }
    }

    .quick-cart__header {
      padding: 24px;
      border-bottom: 1px solid #E5E7EB;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .quick-cart__title {
      display: flex;
      align-items: center;
      gap: 12px;

      h2 {
        font-size: 18px;
        font-weight: 500;
        margin: 0;
      }
    }

    .quick-cart__count {
      background-color: #DC2626;
      color: white;
      padding: 2px 8px;
      border-radius: 16px;
      font-size: 14px;
    }

    .quick-cart__close {
      background: none;
      border: none;
      padding: 8px;
      cursor: pointer;
      color: #6B7280;

      &:hover {
        color: #DC2626;
      }
    }

    .quick-cart__content {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
    }

    .cart-item {
      display: flex;
      gap: 16px;
      padding-bottom: 24px;
      border-bottom: 1px solid #E5E7EB;
      margin-bottom: 24px;
    }

    .cart-item__image {
      width: 80px;
      height: 80px;
      background-color: #F3F4F6;
      border-radius: 8px;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .cart-item__details {
      flex: 1;
    }

    .cart-item__info {
      margin-bottom: 16px;
    }

    .cart-item__name {
      font-weight: 500;
      margin-bottom: 4px;
    }

    .cart-item__part-number {
      color: #6B7280;
      font-size: 14px;
    }

    .cart-item__quantity {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .cart-item__qty-btn {
      width: 32px;
      height: 32px;
      border: 1px solid #E5E7EB;
      background: white;
      border-radius: 4px;
      cursor: pointer;

      &:hover {
        background-color: #F3F4F6;
      }
    }

    .cart-item__qty-input {
      width: 48px;
      height: 32px;
      border: 1px solid #E5E7EB;
      border-radius: 4px;
      text-align: center;
    }

    .cart-item__price {
      margin-left: auto;
      font-weight: 500;
    }

    .cart-item__remove {
      background: none;
      border: none;
      padding: 8px;
      cursor: pointer;
      color: #6B7280;

      &:hover {
        color: #DC2626;
      }
    }

    .quick-cart__footer {
      padding: 24px;
      border-top: 1px solid #E5E7EB;
    }

    .quick-cart__shipping,
    .quick-cart__total {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .quick-cart__total {
      font-weight: 500;
      font-size: 18px;
    }

    .quick-cart__actions {
      display: flex;
      gap: 16px;
      margin-top: 24px;
    }

    .quick-cart__back {
      flex: 1;
      padding: 12px 24px;
      background: none;
      border: 1px solid #E5E7EB;
      border-radius: 6px;
      cursor: pointer;

      &:hover {
        background-color: #F3F4F6;
      }
    }

    .quick-cart__order {
      flex: 1;
      padding: 12px 24px;
      background-color: #DC2626;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;

      &:hover {
        background-color: #B91C1C;
      }
    }
  `]
})
export class QuickCartComponent {
  @Input() isOpen = false;

  onClose() {
    this.isOpen = false;
  }
}
