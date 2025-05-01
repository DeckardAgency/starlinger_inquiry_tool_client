// src/app/core/models/inquiry.model.ts
export interface Inquiry {
  id: string;
  machine: string;
  dateCreated: string;
  partsOrdered: number;
  status: string;
}

export enum InquiryStatus {
  Submitted = 'Submitted',
  Processing = 'Processing',
  Confirmed = 'Confirmed'
}
