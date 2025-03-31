import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Inquiry {
  id: string;
  machine: string;
  dateCreated: string;
  partsOrdered: number;
  status: 'Submitted' | 'Processing' | 'Confirmed';
}

@Component({
  selector: 'app-active-inquiries',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="active-inquiries">
      <div class="active-inquiries__header">
        <h2 class="active-inquiries__title">
          <svg width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 7.5v3.333m0 3.334h.008m2.492-12.5H5a1.667 1.667 0 0 0-1.667 1.666v13.334A1.666 1.666 0 0 0 5 18.333h10a1.666 1.666 0 0 0 1.667-1.666V5.833L12.5 1.667Z" stroke="#232323" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Active Inquiries
        </h2>
        <a routerLink="/inquiries" class="active-inquiries__view-all">
          View all
          <svg width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="m6 12 4-4-4-4" stroke="#DC2626" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </a>
      </div>

      <div class="active-inquiries__grid">
        @for (inquiry of activeInquiries; track inquiry.id) {
          <a [routerLink]="['/inquiries', inquiry.id]" class="inquiry-card">
            <div class="inquiry-card__header">
              <div class="inquiry-card__icon">
                <svg width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.333 13.333 15 15l3.333-3.333M17.5 8.333V6.667a1.667 1.667 0 0 0-.833-1.442l-5.834-3.333a1.666 1.666 0 0 0-1.666 0L3.333 5.225A1.667 1.667 0 0 0 2.5 6.667v6.666a1.667 1.667 0 0 0 .833 1.442l5.834 3.333a1.666 1.666 0 0 0 1.666 0l1.667-.95m-6.25-13.6 7.5 4.292M2.742 5.833 10 10m0 0 7.258-4.167M10 10v8.333" stroke="#71717A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </div>
              <span class="inquiry-card__id">Inquiry #{{ inquiry.id }}</span>
            </div>

            <div class="inquiry-card__machine">
              <div class="inquiry-card__machine-icon">
                <svg width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#a)" stroke="#71717A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4.583 7.083 7.5 10l-2.917 2.917L1.667 10l2.916-2.917ZM10 1.667l2.917 2.916L10 7.5 7.083 4.583 10 1.667ZM15.417 7.083 18.333 10l-2.916 2.917L12.5 10l2.917-2.917ZM10 12.5l2.917 2.917L10 18.333l-2.917-2.916L10 12.5Z"/></g><defs><clipPath id="a"><path fill="#fff" d="M0 0h20v20H0z"/></clipPath></defs></svg>
              </div>
              <div class="inquiry-card__machine-info">
                <span class="inquiry-card__label">Machine model</span>
                <span class="inquiry-card__value">{{ inquiry.machine }}</span>
              </div>
            </div>

            <div class="inquiry-card__details">
              <div class="inquiry-card__detail">
                <div class="inquiry-card__detail-icon">
                  <svg width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.667 1.667V5m6.666-3.333V5M2.5 8.333h15M6.667 11.667h.008m3.325 0h.008m3.325 0h.009M6.667 15h.008M10 15h.008m3.325 0h.009M4.167 3.333h11.666c.92 0 1.667.746 1.667 1.667v11.667c0 .92-.746 1.666-1.667 1.666H4.167c-.92 0-1.667-.746-1.667-1.666V5c0-.92.746-1.667 1.667-1.667Z" stroke="#71717A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </div>
                <div class="inquiry-card__detail-info">
                  <span class="inquiry-card__label">Date created</span>
                  <span class="inquiry-card__value">{{ inquiry.dateCreated }}</span>
                </div>
              </div>

              <div class="inquiry-card__detail">
                <div class="inquiry-card__detail-icon">
                  <svg width="21" height="20" fill="none" xmlns="http://www.w3.org/2000/svg"><g stroke="#71717A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13.333V6.667a1.667 1.667 0 0 0-.833-1.442l-5.834-3.333a1.666 1.666 0 0 0-1.666 0L3.833 5.225A1.667 1.667 0 0 0 3 6.667v6.666a1.667 1.667 0 0 0 .833 1.442l5.834 3.333a1.666 1.666 0 0 0 1.666 0l5.834-3.333A1.668 1.668 0 0 0 18 13.333Z"/><path d="M10.5 13.333a3.333 3.333 0 1 0 0-6.666 3.333 3.333 0 0 0 0 6.666Z"/></g></svg>
                </div>
                <div class="inquiry-card__detail-info">
                  <span class="inquiry-card__label">Parts ordered</span>
                  <span class="inquiry-card__value">{{ inquiry.partsOrdered }}</span>
                </div>
              </div>
            </div>

            <div class="inquiry-card__status">
              <span class="inquiry-card__status-badge" [class]="'inquiry-card__status-badge--' + inquiry.status.toLowerCase()">
                {{ inquiry.status }}
              </span>
              <span class="inquiry-card__status-arrow">
                <svg width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4.167 10h11.666m0 0-5-5m5 5-5 5" stroke="#18181B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
            </div>
          </a>
        }
      </div>
    </section>
  `,
  styles: [`
    .active-inquiries {
      margin-bottom: 2rem;

      &__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      }

      &__title {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 1.25rem;
        font-weight: 500;
        color: #18181B;

        svg {
          color: #71717A;
        }
      }

      &__view-all {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #DC2626;
        text-decoration: none;
        font-weight: 500;
        font-size: 0.875rem;
      }

      &__grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1.5rem;
      }
    }

    .inquiry-card {
      background: white;
      padding: 1.5rem;
      text-decoration: none;
      transition: all 0.2s;
      border-radius: 6px;
      border: 1px solid #E4E4E7;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
      }

      &__header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 1.5rem;
      }

      &__icon {
        width: 2.5rem;
        height: 2.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #F4F4F5;
        border-radius: 0.5rem;
      }

      &__id {
        font-weight: 500;
        color: #18181B;
      }

      &__machine {
        display: flex;
        gap: 0.75rem;
        margin-bottom: 1.5rem;
      }

      &__machine-icon {
        width: 2.5rem;
        height: 2.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #F4F4F5;
        border-radius: 0.5rem;
      }

      &__machine-info {
        display: flex;
        flex-direction: column;
      }

      &__details {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        margin-bottom: 1.5rem;
      }

      &__detail {
        display: flex;
        gap: 0.75rem;
      }

      &__detail-icon {
        width: 2.5rem;
        height: 2.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #F4F4F5;
        border-radius: 0.5rem;
      }

      &__detail-info {
        display: flex;
        flex-direction: column;
      }

      &__label {
        font-size: 0.875rem;
        color: #71717A;
      }

      &__value {
        font-weight: 500;
        color: #18181B;
      }

      &__status {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      &__status-badge {
        padding: 0.25rem 0.75rem;
        border-radius: 1rem;
        font-size: 0.875rem;
        font-weight: 500;

        &--submitted {
          background: #FEF3C7;
          color: #D97706;
        }

        &--processing {
          background: #EDE9FE;
          color: #7C3AED;
        }

        &--confirmed {
          background: #DCFCE7;
          color: #16A34A;
        }
      }

      &__status-arrow {
        border-radius: 50%;
        width: 32px;
        height: 32px;
        border: 1px solid #E4E4E7;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  `]
})
export class ActiveInquiriesComponent {
  activeInquiries: Inquiry[] = [
    {
      id: '0001',
      machine: 'ad*starKON SX+ 120',
      dateCreated: '14-03-2024',
      partsOrdered: 12,
      status: 'Submitted'
    },
    {
      id: '0002',
      machine: 'ad*starKON SX+ 120',
      dateCreated: '14-03-2024',
      partsOrdered: 12,
      status: 'Processing'
    },
    {
      id: '0003',
      machine: 'ad*starKON SX+ 120',
      dateCreated: '14-03-2024',
      partsOrdered: 12,
      status: 'Confirmed'
    }
  ];
}
