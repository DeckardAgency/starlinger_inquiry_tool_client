import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="quick-actions">
      <h2 class="quick-actions__title">
        <svg width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.333 11.667a.833.833 0 0 1-.65-1.359l8.25-8.5a.417.417 0 0 1 .717.384l-1.6 5.016a.833.833 0 0 0 .783 1.125h5.834a.833.833 0 0 1 .65 1.359l-8.25 8.5a.416.416 0 0 1-.717-.384l1.6-5.016a.833.833 0 0 0-.783-1.125H3.333Z" stroke="#232323" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Quick Actions
      </h2>
      <div class="quick-actions__grid">
        <a routerLink="/new-inquiry" class="quick-action-card">
          <div class="quick-action-card__icon quick-action-card__icon--red">
            <svg width="36" height="36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 33h21a3 3 0 0 0 3-3V10.5L22.5 3H9a3 3 0 0 0-3 3v6m15-9v6a3 3 0 0 0 3 3h6M4.5 22.5h9M9 18v9" stroke="#DC2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <h3 class="quick-action-card__title">New inquiry</h3>
          <p class="quick-action-card__description">
            Initiate a spare part request by completing our custom tailored ordering solutions.
          </p>
          <span class="quick-action-card__link">
            Create
            <svg width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="m6 12 4-4-4-4" stroke="#232323" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </span>
        </a>

        <a routerLink="/machines-parts" class="quick-action-card">
          <div class="quick-action-card__icon quick-action-card__icon--red">
            <svg width="37" height="36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24.333 6h3a3 3 0 0 1 3 3v21a3 3 0 0 1-3 3h-18a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3h3m6 10.5h6m-6 7.5h6m-12-7.5h.015m-.015 7.5h.015m1.485-21h9a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-9a1.5 1.5 0 0 1-1.5-1.5v-3a1.5 1.5 0 0 1 1.5-1.5Z" stroke="#DC2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <h3 class="quick-action-card__title">Machines & Parts</h3>
          <p class="quick-action-card__description">
            Explore our machine and spare parts catalogue, use custom filters to find your perfect match.
          </p>
          <span class="quick-action-card__link">
            Browse
            <svg width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="m6 12 4-4-4-4" stroke="#232323" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </span>
        </a>

        <a routerLink="/contact-sales" class="quick-action-card">
          <div class="quick-action-card__icon quick-action-card__icon--red">
            <svg width="37" height="36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M26.167 27a3 3 0 0 0-3-3h-9a3 3 0 0 0-3 3m1.5-24v3m12-3v3m-16.5 0h21a3 3 0 0 1 3 3v21a3 3 0 0 1-3 3h-21a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3Zm13.5 9a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" stroke="#DC2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <h3 class="quick-action-card__title">Contact Sales Manager</h3>
          <p class="quick-action-card__description">
            Access direct communication channel for expert support, technical consultations and inquiry status.
          </p>
          <span class="quick-action-card__link">
            Contact
            <svg width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="m6 12 4-4-4-4" stroke="#232323" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </span>
        </a>
      </div>
    </section>
  `,
  styles: [`
    .quick-actions {
      margin-bottom: 2rem;

      &__title {
        padding-top: 0;
        margin-top: 0;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 1.25rem;
        font-weight: 500;
        margin-bottom: 1rem;
        color: #18181B;

        &-icon {
          color: #71717A;
        }
      }

      &__grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1.5rem;
      }
    }

    .quick-action-card {
      background: white;
      border-radius: 0.375rem;
      border: 1px solid #E4E4E7;
      padding: 1.5rem;
      text-decoration: none;
      transition: all 0.2s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);

        .quick-action-card__link {
          color: #DC2626;
        }
      }

      &__icon {
        width: 3rem;
        height: 3rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 0.75rem;
        margin-bottom: 1rem;

        &--red {
          background: #FEF2F2;
          color: #DC2626;
        }
      }

      &__title {
        font-size: 1.125rem;
        font-weight: 500;
        color: #18181B;
        margin-bottom: 0.5rem;
      }

      &__description {
        color: #52525B;
        font-size: 0.875rem;
        line-height: 1.5;
        margin-bottom: 1.5rem;
      }

      &__link {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #18181B;
        font-weight: 500;
        font-size: 0.875rem;
        transition: color 0.2s;
        border-radius: 6px;
        border: 1px solid #E4E4E7;
        width: fit-content;
        padding: 10px 16px;
      }
    }
  `]
})
export class QuickActionsComponent {}
