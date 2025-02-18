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
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="quick-actions__title-icon">
          <path d="M3.75 13.5l10.5-10.5 4.5 4.5-10.5 10.5h-4.5v-4.5z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Quick Actions
      </h2>
      <div class="quick-actions__grid">
        <a routerLink="/new-inquiry" class="quick-action-card">
          <div class="quick-action-card__icon quick-action-card__icon--red">
            <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3 class="quick-action-card__title">New inquiry</h3>
          <p class="quick-action-card__description">
            Initiate a spare part request by completing our custom tailored ordering solutions.
          </p>
          <span class="quick-action-card__link">
            Create
            <svg width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.167 10h11.666m0 0-5-5m5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
        </a>

        <a routerLink="/machines-parts" class="quick-action-card">
          <div class="quick-action-card__icon quick-action-card__icon--red">
            <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3 class="quick-action-card__title">Machines & Parts</h3>
          <p class="quick-action-card__description">
            Explore our machine and spare parts catalogue, use custom filters to find your perfect match.
          </p>
          <span class="quick-action-card__link">
            Browse
            <svg width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.167 10h11.666m0 0-5-5m5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
        </a>

        <a routerLink="/contact-sales" class="quick-action-card">
          <div class="quick-action-card__icon quick-action-card__icon--red">
            <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 10c0 4.418-3.582 8-8 8s-8-3.582-8-8 3.582-8 8-8 8 3.582 8 8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3 class="quick-action-card__title">Contact Sales Manager</h3>
          <p class="quick-action-card__description">
            Access direct communication channel for expert support, technical consultations and inquiry status.
          </p>
          <span class="quick-action-card__link">
            Contact
            <svg width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.167 10h11.666m0 0-5-5m5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
        </a>
      </div>
    </section>
  `,
  styles: [`
    .quick-actions {
      margin-bottom: 2rem;

      &__title {
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
      border-radius: 1rem;
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
      }
    }
  `]
})
export class QuickActionsComponent {}
