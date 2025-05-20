import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {CalendarComponent} from '@shared/components/calendar/calendar.component';

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [CommonModule, CalendarComponent],
  template: `
    <div class="date-picker-container">
      <button class="date-picker-button" (click)="toggleCalendar()">
        {{ displayValue }}
        <span class="calendar-icon">📅</span>
      </button>

      <app-calendar
        *ngIf="showCalendar"
        [isRange]="isRange"
        [selectedDate]="selectedDate"
        [startDate]="startDate"
        [endDate]="endDate"
        (dateSelected)="onDateSelected($event)"
        (rangeSelected)="onRangeSelected($event)"
        (closeCalendar)="showCalendar = false"
      ></app-calendar>
    </div>
  `,
  styles: [`
    .date-picker-container {
      position: relative;
      display: inline-block;
    }

    .date-picker-button {
      padding: 8px 16px;
      background-color: white;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-width: 200px;
    }

    .calendar-icon {
      margin-left: 8px;
    }
  `]
})
export class DatePickerComponent {
  showCalendar = false;
  isRange = false; // Set to true for range picker

  // For single date selection
  selectedDate: Date | null = null;

  // For range selection
  startDate: Date | null = null;
  endDate: Date | null = null;

  get displayValue(): string {
    if (this.isRange) {
      if (this.startDate && this.endDate) {
        return `${this.formatDate(this.startDate)} - ${this.formatDate(this.endDate)}`;
      } else if (this.startDate) {
        return `${this.formatDate(this.startDate)} - Select end date`;
      } else {
        return 'Select date range';
      }
    } else {
      return this.selectedDate ? this.formatDate(this.selectedDate) : 'Select date';
    }
  }

  toggleCalendar(): void {
    this.showCalendar = !this.showCalendar;
  }

  onDateSelected(date: Date): void {
    this.selectedDate = date;
    this.showCalendar = false;
    console.log('Date selected:', date);
  }

  onRangeSelected(range: { start: Date, end: Date }): void {
    this.startDate = range.start;
    this.endDate = range.end;
    console.log('Range selected:', range);
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
