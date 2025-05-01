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


export interface InquiryHistory {
  id: string;
  machine: string;
  dateCreated: string;
  customer: {
    initials: string;
    name: string;
    image?: string;
  };
  partsOrdered: number;
  status: 'Completed' | 'Confirmed' | 'Processing' | 'Cancelled';
}
