// src/app/core/models/inquiry.model.ts
export interface Inquiry {
  id: string;
  machine: string;
  dateCreated: string;
  partsOrdered: number;
  status: 'Submitted' | 'Processing' | 'Confirmed';
}
