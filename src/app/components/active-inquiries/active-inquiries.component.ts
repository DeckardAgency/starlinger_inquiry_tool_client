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
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Active Inquiries
        </h2>
        <a routerLink="/inquiries" class="active-inquiries__view-all">
          View all
          <svg width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.167 10h11.666m0 0-5-5m5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </a>
      </div>

      <div class="active-inquiries__grid">
        @for (inquiry of activeInquiries; track inquiry.id) {
          <a [routerLink]="['/inquiries', inquiry.id]" class="inquiry-card">
            <div class="inquiry-card__header">
              <div class="inquiry-card__icon">
                <svg width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15.833 4.167H4.167C3.247 4.167 2.5 4.913 2.5 5.833v8.334c0 .92.746 1.666 1.667 1.666h11.666c.92 0 1.667-.746 1.667-1.666V5.833c0-.92-.746-1.666-1.667-1.666Z" stroke="#18181B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <span class="inquiry-card__id">Inquiry #{{ inquiry.id }}</span>
            </div>

            <div class="inquiry-card__machine">
              <div class="inquiry-card__machine-icon">
                <svg width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" stroke="#71717A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="inquiry-card__machine-info">
                <span class="inquiry-card__label">Machine model</span>
                <span class="inquiry-card__value">{{ inquiry.machine }}</span>
              </div>
            </div>

            <div class="inquiry-card__details">
              <div class="inquiry-card__detail">
                <div class="inquiry-card__detail-icon">
                  <svg width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.333 2.5H6.667A1.667 1.667 0 0 0 5 4.167v11.666A1.667 1.667 0 0 0 6.667 17.5h6.666a1.667 1.667 0 0 0 1.667-1.667V4.167A1.667 1.667 0 0 0 13.333 2.5Z" stroke="#71717A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="inquiry-card__detail-info">
                  <span class="inquiry-card__label">Date created</span>
                  <span class="inquiry-card__value">{{ inquiry.dateCreated }}</span>
                </div>
              </div>

              <div class="inquiry-card__detail">
                <div class="inquiry-card__detail-icon">
                  <svg width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.5 5h15M6.667 5V3.333A1.667 1.667 0 0 1 8.333 1.667h3.334a1.667 1.667 0 0 1 1.666 1.666V5m2.5 0v11.667a1.667 1.667 0 0 1-1.666 1.666H5.833a1.667 1.667 0 0 1-1.666-1.666V5h11.666Z" stroke="#71717A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
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
              <svg width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4.167 10h11.666m0 0-5-5m5 5-5 5" stroke="#18181B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
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
      border-radius: 1rem;
      padding: 1.5rem;
      text-decoration: none;
      transition: all 0.2s;

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
